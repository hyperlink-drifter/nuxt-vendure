import { Injectable, OnModuleInit } from '@nestjs/common';
import { KeycrmClient } from './keycrm.client';
import {
  AssetService,
  ConfigService,
  Importer,
  JobQueue,
  JobQueueService,
  Logger,
  ParsedProductWithVariants,
  ProductService,
  RequestContext,
  SearchService,
  SerializedRequestContext,
} from '@vendure/core';
import {
  GlobalFlag,
  JobState,
  LanguageCode,
} from '@vendure/common/lib/generated-types';
import { loggerCtx } from './constants';
import { ProductKeycrm } from './types';

@Injectable()
export class KeycrmSyncService implements OnModuleInit {
  private jobQueue: JobQueue<{
    ctx: SerializedRequestContext;
    product: ProductKeycrm;
  }>;

  constructor(
    private keycrmClient: KeycrmClient,
    private jobQueueService: JobQueueService,
    private productService: ProductService,
    private assetService: AssetService,
    private searchService: SearchService,
    private configService: ConfigService,
    private importer: Importer
  ) {}

  async onModuleInit() {
    this.jobQueue = await this.jobQueueService.createQueue({
      name: 'keycrm-sync',
      process: async (job) => {
        const ctx = RequestContext.deserialize(job.data.ctx);

        const productKeycrm = job.data.product;

        const slug = productKeycrm.custom_fields.find(
          (field) => field.name === 'slug'
        )?.value;

        if (!slug) {
          Logger.error(`Could not find slug of keycrm product.`, loggerCtx);
          Logger.error(`Id: ${productKeycrm.id}`, loggerCtx);
          Logger.error(`Name: ${productKeycrm.name}`, loggerCtx);
          throw new Error('Job was cancelled');
        }

        const offerList = await this.keycrmClient.getOffers({
          limit: 50,
          include: 'product',
          'filter[product_id]': `${productKeycrm.id}`,
        });

        const { data: offersKeycrm } = offerList;

        const { product: productOfferKeycrm } = offersKeycrm[0];

        if (!productOfferKeycrm) {
          Logger.error(`Could not find included product in offer`, loggerCtx);
          throw new Error('Job was cancelled');
        }

        const { properties_agg } = productOfferKeycrm;

        if (!properties_agg) {
          Logger.error(`Could not find aggregated properties`, loggerCtx);
          throw new Error('Job was cancelled');
        }

        const productVendure = await this.productService.findOneBySlug(
          ctx,
          slug
        );

        Logger.info(`Product ${productKeycrm.id}`, loggerCtx);

        if (productVendure) {
          Logger.info(`Already available within vendure's system.`, loggerCtx);
          Logger.info(`Soft deleting Product ${productVendure.id}`, loggerCtx);
          const productSoftDeletionResponse =
            await this.productService.softDelete(ctx, productVendure.id);
          Logger.info(
            `${JSON.stringify(productSoftDeletionResponse)}`,
            loggerCtx
          );

          const assetStorageStrategy =
            this.configService.assetOptions.assetStorageStrategy;

          const assets = await this.assetService.getEntityAssets(
            ctx,
            productVendure
          );

          if (assets && assets.length) {
            for (const asset of assets) {
              const sourceFileExists = await assetStorageStrategy.fileExists(
                asset.source
              );

              if (sourceFileExists) {
                try {
                  Logger.info(
                    `deleting asset source file ${asset.source}`,
                    loggerCtx
                  );
                  await assetStorageStrategy.deleteFile(asset.source);
                } catch (e: any) {
                  Logger.error(
                    'error.could-not-delete-asset-source-file',
                    loggerCtx,
                    e.stack
                  );
                }
              }

              const previewFileExists = await assetStorageStrategy.fileExists(
                asset.preview
              );

              if (previewFileExists) {
                try {
                  Logger.info(
                    `deleting asset preview file ${asset.preview}`,
                    loggerCtx
                  );
                  await assetStorageStrategy.deleteFile(asset.preview);
                } catch (e: any) {
                  Logger.error(
                    'error.could-not-delete-asset-preview-file',
                    loggerCtx,
                    e.stack
                  );
                }
              }
            }
          }

          const featuredAsset = await this.assetService.getFeaturedAsset(
            ctx,
            productVendure
          );

          if (featuredAsset) {
            const featuredAssetSourceFileExists =
              await assetStorageStrategy.fileExists(featuredAsset.source);

            if (featuredAssetSourceFileExists) {
              try {
                Logger.info(
                  `deleting featured asset source file ${featuredAsset.source}`,
                  loggerCtx
                );
                await assetStorageStrategy.deleteFile(featuredAsset.source);
              } catch (e: any) {
                Logger.error(
                  'error.could-not-delete-featured-asset-source-file',
                  loggerCtx,
                  e.stack
                );
              }
            }

            const featuredAssetPreviewFileExists =
              await assetStorageStrategy.fileExists(featuredAsset.preview);

            if (featuredAssetPreviewFileExists) {
              try {
                Logger.info(
                  `deleting featured asset preview file ${featuredAsset.preview}`,
                  loggerCtx
                );
                await assetStorageStrategy.deleteFile(featuredAsset.preview);
              } catch (e: any) {
                Logger.error(
                  'error.could-not-delete-featured-asset-preview-file',
                  loggerCtx,
                  e.stack
                );
              }
            }
          }
        } else {
          Logger.info(`Not yet available within vendure's system`, loggerCtx);
        }

        Logger.info(`Starting import`, loggerCtx);
        const importRow: ParsedProductWithVariants[] = [
          {
            product: {
              translations: [
                {
                  languageCode: LanguageCode.uk,
                  name: productKeycrm.name,
                  slug: slug,
                  description: productKeycrm.description
                    ? productKeycrm.description
                    : '',
                  customFields: {
                    keycrm_id: `${productKeycrm.id}`,
                    keycrm_created_at: productKeycrm.created_at,
                    keycrm_updated_at: productKeycrm.updated_at,
                  },
                },
              ],
              assetPaths: productKeycrm.attachments_data.map((url) => url),
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
            variants: offersKeycrm.map((offer) => {
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
                assetPaths: offer.thumbnail_url ? [offer.thumbnail_url] : [],
                trackInventory: GlobalFlag.FALSE,
                facets: [],
                taxCategory: 'default',
              };
            }),
          },
        ];

        try {
          await this.importer.importProducts(ctx, importRow, (progress) => {
            Logger.info(
              `Imported product (${productKeycrm.id}) ${productKeycrm.name}`,
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

        await this.searchService.reindex(ctx);

        return { 'mac-and-cheese': true };
      },
    });
  }

  async sync(ctx: RequestContext) {
    const productList = await this.keycrmClient.getProducts({
      limit: 50,
      include: 'custom_fields',
    });

    const { data: products } = productList;

    for (const product of products) {
      const job = await this.jobQueue.add(
        { ctx: ctx.serialize(), product },
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
        .catch((error: any) => {
          Logger.error(`error.job-update`, loggerCtx, error.stack);
        });
    }

    return { fml: true };
  }
}
