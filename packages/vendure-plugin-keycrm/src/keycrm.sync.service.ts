import { Injectable, OnModuleInit } from '@nestjs/common';
import { KeycrmClient } from './keycrm.client';
import {
  AssetImporter,
  AssetService,
  Importer,
  JobQueue,
  JobQueueService,
  Logger,
  ParsedProductWithVariants,
  ProductOptionGroupService,
  ProductOptionService,
  ProductService,
  ProductVariantService,
  RequestContext,
  SearchService,
  SerializedRequestContext,
} from '@vendure/core';
import {
  DeletionResult,
  GlobalFlag,
  JobState,
  LanguageCode,
} from '@vendure/common/lib/generated-types';
import { loggerCtx } from './constants';

@Injectable()
export class KeycrmSyncService implements OnModuleInit {
  private jobQueue: JobQueue<{ ctx: SerializedRequestContext }>;

  constructor(
    private keycrmClient: KeycrmClient,
    private jobQueueService: JobQueueService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
    private assetService: AssetService,
    private productOptionGroupService: ProductOptionGroupService,
    private productOptionService: ProductOptionService,
    private searchService: SearchService,
    private importer: Importer,
    private assetImporter: AssetImporter
  ) {}

  async onModuleInit() {
    this.jobQueue = await this.jobQueueService.createQueue({
      name: 'keycrm-sync',
      process: async (job) => {
        const ctx = RequestContext.deserialize(job.data.ctx);

        const productList = await this.keycrmClient.getProducts({
          limit: 50,
          include: 'custom_fields',
        });

        const { data: keycrmProducts } = productList;

        for (const keycrmProduct of keycrmProducts) {
          const slug = keycrmProduct.custom_fields.find(
            (field) => field.name === 'slug'
          )?.value;

          if (!slug) {
            Logger.error(`Could not find slug of keycrm product.`, loggerCtx);
            Logger.error(`Id: ${keycrmProduct.id}`, loggerCtx);
            Logger.error(`Name: ${keycrmProduct.name}`, loggerCtx);
            throw new Error('Job was cancelled');
          }

          const offerList = await this.keycrmClient.getOffers({
            limit: 50,
            include: 'product',
            'filter[product_id]': `${keycrmProduct.id}`,
          });

          const { data: keycrmVariants } = offerList;

          const { product: keycrmProductOffer } = keycrmVariants[0];

          if (!keycrmProductOffer) {
            Logger.error(`Could not find included product in offer`, loggerCtx);
            throw new Error('Job was cancelled');
          }

          const { properties_agg } = keycrmProductOffer;

          if (!properties_agg) {
            Logger.error(`Could not find aggregated properties`, loggerCtx);
            throw new Error('Job was cancelled');
          }

          const vendureProduct = await this.productService.findOneBySlug(
            ctx,
            slug
          );

          Logger.info(
            `Product (${keycrmProduct.id}) ${keycrmProduct.name}`,
            loggerCtx
          );

          //** Update Product */
          if (vendureProduct) {
            Logger.info(
              `Already available within vendure's system.`,
              loggerCtx
            );
            Logger.info(`Updating Product`, loggerCtx);

            const currentAssets = await this.assetService.getEntityAssets(
              ctx,
              vendureProduct
            );

            const currentAssetIds = currentAssets
              ? currentAssets.map((asset) => asset.id)
              : [];

            const { assets: newAssets } = await this.assetImporter.getAssets(
              keycrmProduct.attachments_data
            );

            const newAssetIds = newAssets.map((asset) => asset.id);

            await this.productService.update(ctx, {
              id: vendureProduct.id,
              assetIds: newAssetIds,
              featuredAssetId: newAssetIds[0],
              customFields: {
                keycrm_id: `${keycrmProduct.id}`,
                keycrm_created_at: keycrmProduct.created_at,
                keycrm_updated_at: keycrmProduct.updated_at,
              },
              translations: [
                {
                  languageCode: LanguageCode.uk,
                  name: keycrmProduct.name,
                  slug: slug,
                  description: keycrmProduct.description
                    ? keycrmProduct.description
                    : '',
                },
              ],
            });

            //** Assets deleted within keycrm still exist within vendure and must be deleted */
            const leftbehindAssetIds = currentAssetIds.filter(
              (id) => !newAssetIds.includes(id)
            );

            if (leftbehindAssetIds && leftbehindAssetIds.length) {
              Logger.info(`Deleting left-behind assets`, loggerCtx);

              const deletionResponse = await this.assetService.delete(
                ctx,
                leftbehindAssetIds
              );

              Logger.info(`Result: ${deletionResponse.result}`, loggerCtx);
              if (deletionResponse.result === DeletionResult.NOT_DELETED) {
                Logger.info(`Message: ${deletionResponse.message}`, loggerCtx);
              }
            }

            /** OptionGroups and Options */
            const currentOptionGroups =
              await this.productOptionGroupService.getOptionGroupsByProductId(
                ctx,
                vendureProduct.id
              );

            for (const group of currentOptionGroups) {
              await this.productService.removeOptionGroupFromProduct(
                ctx,
                vendureProduct.id,
                group.id,
                // Removal of this ProductOptionGroup will be forced by first
                // removing all ProductOptions from the ProductVariants
                true
              );
            }

            const createdOptionsMap = new Map();

            for (const key of Object.keys(properties_agg)) {
              const newOptionGroup =
                await this.productOptionGroupService.create(ctx, {
                  code: `${vendureProduct.slug}-${key}`,
                  translations: [
                    {
                      languageCode: LanguageCode.uk,
                      name: key,
                    },
                  ],
                });

              for (const option of properties_agg[key]) {
                const optionCode = `${vendureProduct.slug}-${key}-${option}`;
                const createdOption = await this.productOptionService.create(
                  ctx,
                  newOptionGroup.id,
                  {
                    code: optionCode,
                    productOptionGroupId: newOptionGroup.id,
                    translations: [
                      {
                        languageCode: LanguageCode.uk,
                        name: option,
                      },
                    ],
                  }
                );

                createdOptionsMap.set(optionCode, createdOption.id);
              }

              await this.productService.addOptionGroupToProduct(
                ctx,
                vendureProduct.id,
                newOptionGroup.id
              );
            }

            /** Variants */
            const { items: vendureVariants } =
              await this.productVariantService.getVariantsByProductId(
                ctx,
                vendureProduct.id
              );

            // Variants deleted within keycrm still exist within vendure and must be deleted
            const leftbehindVariants = vendureVariants.filter(
              (vendureVariant) =>
                !keycrmVariants.some(
                  (keycrmVariant) =>
                    keycrmVariant.id === vendureVariant.customFields.keycrm_id
                )
            );

            const leftbehindVariantIds = leftbehindVariants.map(
              (variant) => variant.id
            );

            if (leftbehindVariantIds && leftbehindVariantIds.length) {
              Logger.info(
                `Deleting left-behind Variants ${leftbehindVariantIds}`,
                loggerCtx
              );

              const deletionResponse =
                await this.productVariantService.softDelete(
                  ctx,
                  leftbehindVariantIds
                );

              Logger.info(`Result: ${deletionResponse.result}`, loggerCtx);
              if (deletionResponse.result === DeletionResult.NOT_DELETED) {
                Logger.info(`Message: ${deletionResponse.message}`, loggerCtx);
              }
            }

            /* From Keycrm to Vendure */
            for (const keycrmVariant of keycrmVariants) {
              const vendureVariant = vendureVariants.find(
                (vendureVariant) =>
                  vendureVariant.customFields.keycrm_id === keycrmVariant.id
              );

              const { assets: newAssets } = await this.assetImporter.getAssets([
                keycrmVariant.thumbnail_url ? keycrmVariant.thumbnail_url : '',
              ]);

              const newAssetIds = newAssets.map((asset) => asset.id);

              const preparedProductVariantInput = {
                sku: keycrmVariant.sku ? keycrmVariant.sku : '',
                price: keycrmVariant.price,
                stockOnHand: keycrmVariant.quantity,
                // no featuredAssetId as long as vendure's importer (uses assetPaths) is used below
                // must use assetIds to ensure assets will be deleted in a proper way
                assetIds: newAssetIds,
                optionIds: keycrmVariant.properties.map((prop) =>
                  createdOptionsMap.get(
                    `${vendureProduct.slug}-${prop.name}-${prop.value}`
                  )
                ),
                // definition of custom fields must be top level
                // otherwise data will be null and variants can not be linked
                // between keycrm and vendure
                customFields: {
                  keycrm_id: `${keycrmVariant.id}`,
                  keycrm_product_id: `${keycrmVariant.product_id}`,
                  keycrm_created_at: keycrmVariant.created_at,
                  keycrm_updated_at: keycrmVariant.updated_at,
                },
                translations: [
                  {
                    languageCode: LanguageCode.uk,
                    name: [
                      vendureProduct.name,
                      ...keycrmVariant.properties.map(
                        (prop) => `${prop.name} ${prop.value}`
                      ),
                      ,
                    ].join(' '),
                    customFields: {
                      keycrm_id: `${keycrmVariant.id}`,
                      keycrm_product_id: `${keycrmVariant.product_id}`,
                      keycrm_created_at: keycrmVariant.created_at,
                      keycrm_updated_at: keycrmVariant.updated_at,
                    },
                  },
                ],
              };

              //** Update Variant */
              if (vendureVariant) {
                const currentAssets = await this.assetService.getEntityAssets(
                  ctx,
                  vendureVariant
                );

                const currentAssetIds = currentAssets
                  ? currentAssets.map((asset) => asset.id)
                  : [];

                await this.productVariantService.update(ctx, [
                  {
                    id: vendureVariant.id,
                    ...preparedProductVariantInput,
                  },
                ]);

                //** Assets deleted within keycrm still exist within vendure and must be deleted */
                const leftbehindAssetIds = currentAssetIds.filter(
                  (id) => !newAssetIds.includes(id)
                );

                if (leftbehindAssetIds && leftbehindAssetIds.length) {
                  Logger.info(
                    `Deleting left-behind assets of Variant`,
                    loggerCtx
                  );

                  const deletionResponse = await this.assetService.delete(
                    ctx,
                    leftbehindAssetIds
                  );

                  Logger.info(`Result: ${deletionResponse.result}`, loggerCtx);
                  if (deletionResponse.result === DeletionResult.NOT_DELETED) {
                    Logger.info(
                      `Message: ${deletionResponse.message}`,
                      loggerCtx
                    );
                  }
                }
              }
              //** Create Variant */
              else {
                await this.productVariantService.create(ctx, [
                  {
                    productId: vendureProduct.id,
                    ...preparedProductVariantInput,
                  },
                ]);
              }
            }
          } else {
            Logger.info(`Not yet available within vendure's system`, loggerCtx);
            Logger.info(`Starting import`, loggerCtx);
            const importRow: ParsedProductWithVariants[] = [
              {
                product: {
                  translations: [
                    {
                      languageCode: LanguageCode.uk,
                      name: keycrmProduct.name,
                      slug: slug,
                      description: keycrmProduct.description
                        ? keycrmProduct.description
                        : '',
                      customFields: {
                        keycrm_id: `${keycrmProduct.id}`,
                        keycrm_created_at: keycrmProduct.created_at,
                        keycrm_updated_at: keycrmProduct.updated_at,
                      },
                    },
                  ],
                  assetPaths: keycrmProduct.attachments_data.map((url) => url),
                  facets: [],
                  optionGroups: Object.keys(properties_agg).map((key) => ({
                    translations: [
                      {
                        languageCode: LanguageCode.uk,
                        name: key,
                        values: properties_agg[key],
                      },
                    ],
                  })),
                },
                variants: keycrmVariants.map((offer) => {
                  return {
                    sku: offer.sku ? offer.sku : '',
                    price: offer.price,
                    stockOnHand: offer.quantity,
                    translations: [
                      {
                        languageCode: LanguageCode.uk,
                        // option values must be in the same order as the order of option groups generation
                        optionValues: Object.keys(properties_agg).map(
                          (key) =>
                            offer.properties.find((prop) => prop.name === key)
                              ?.value ?? ''
                        ),
                        customFields: {
                          keycrm_id: `${offer.id}`,
                          keycrm_product_id: `${offer.product_id}`,
                          keycrm_created_at: offer.created_at,
                          keycrm_updated_at: offer.updated_at,
                        },
                      },
                    ],
                    assetPaths: offer.thumbnail_url
                      ? [offer.thumbnail_url]
                      : [],
                    trackInventory: GlobalFlag.FALSE,
                    facets: [],
                    taxCategory: 'default',
                  };
                }),
              },
            ];

            try {
              await this.importer.importProducts(ctx, importRow, () => {
                Logger.info(
                  `Imported product (${keycrmProduct.id}) ${keycrmProduct.name}`,
                  loggerCtx
                );
              });
            } catch (e: any) {
              Logger.error(
                'error.could-not-import-product-row',
                loggerCtx,
                e.stack
              );
            }
          }
        }

        await this.searchService.reindex(ctx);

        return { 'mac-and-cheese': true };
      },
    });
  }

  async sync(ctx: RequestContext) {
    const job = await this.jobQueue.add(
      { ctx: ctx.serialize() },
      { retries: 4 }
    );

    job
      .updates()
      .toPromise()
      .then((update: any) => {
        Logger.info(
          `Job ${update.id}: progress: ${update.progress}`,
          loggerCtx
        );
        if (update.state === JobState.COMPLETED) {
          Logger.info(`COMPLETED Job ${update.id}`, loggerCtx);
        }
        return update.result;
      })
      .catch((e) => {
        Logger.error(`error.job-update`, loggerCtx);
        console.info(e);
      });

    return { fml: true };
  }
}
