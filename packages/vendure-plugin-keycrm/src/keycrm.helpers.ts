import { AssetType } from '@vendure/core';
import type {
  LocaleString,
  Product,
  ProductOption,
  ProductOptionGroup,
  Translation,
  VendureEntity,
} from '@vendure/core';
import { ProductKeycrm } from './types';

export function toVendureProduct(
  keycrmProduct: ProductKeycrm,
  vendureProduct: Product
): Product &
  Pick<ProductKeycrm, 'has_offers'> & {
    translations: Array<Translation<VendureEntity>>;
  } {
  const product: Product &
    Pick<ProductKeycrm, 'has_offers'> & {
      translations: Array<Translation<VendureEntity>>;
    } = {
    id: keycrmProduct.id,
    createdAt: keycrmProduct.created_at,
    updatedAt: keycrmProduct.updated_at,
    deletedAt: null,
    name: keycrmProduct.name as LocaleString,
    slug: vendureProduct.slug,
    description: keycrmProduct.description
      ? (keycrmProduct.description as LocaleString)
      : vendureProduct.description
      ? vendureProduct.description
      : ('' as LocaleString),
    enabled: !keycrmProduct.is_archived,
    featuredAssetId: 0,
    featuredAsset: {
      source: keycrmProduct.thumbnail_url ? keycrmProduct.thumbnail_url : '',
      // TODO: fall back values to satisfy type
      name: '',
      type: AssetType.IMAGE,
      mimeType: '',
      width: 0,
      height: 0,
      fileSize: 0,
      preview: '',
      tags: [],
      channels: [],
      id: '',
      createdAt: keycrmProduct.created_at,
      updatedAt: keycrmProduct.created_at,
      customFields: [],
    },
    assets: [
      ...keycrmProduct.attachments_data.map((url) => ({
        source: url,
        // TODO: fall back values to satisfy type
        productId: keycrmProduct.id,
        product: vendureProduct,
        assetId: 0,
        createdAt: keycrmProduct.created_at,
        updatedAt: keycrmProduct.updated_at,
        id: 0,
        asset: {
          source: url ? url : '',
          // TODO: fall back values to satisfy type
          name: '',
          type: AssetType.IMAGE,
          mimeType: '',
          width: 0,
          height: 0,
          fileSize: 0,
          preview: '',
          tags: [],
          channels: [],
          id: '',
          createdAt: keycrmProduct.created_at,
          updatedAt: keycrmProduct.created_at,
          customFields: [],
        },
        position: 0,
      })),
    ],
    translations: [],
    variants: [],
    optionGroups: [],
    facetValues: [],
    channels: [],
    customFields: {
      KeycrmId: vendureProduct.customFields.KeycrmId,
    },
    keycrm: undefined,
    // fields specific to keycrm product
    has_offers: keycrmProduct.has_offers,
  };

  return product;
}

export function toVendureProductOptionGroup(
  keycrmPropertiesAgg: Record<string, string[]>,
  vendureProduct: Product
): Array<ProductOptionGroup> {
  const optionGroups: Array<ProductOptionGroup> = [];

  for (const property in keycrmPropertiesAgg) {
    const options: ProductOption[] = keycrmPropertiesAgg[property].map(
      (name) => ({
        // TODO: fall back values to satisfy type
        id: '',
        createdAt: vendureProduct.createdAt,
        updatedAt: vendureProduct.updatedAt,
        deletedAt: null,
        name: name as LocaleString,
        code: '',
        translations: [],
        group: {
          deletedAt: null,
          name: property as LocaleString,
          code: '',
          translations: [],
          options: [],
          product: vendureProduct,
          customFields: vendureProduct.customFields,
          id: '',
          createdAt: vendureProduct.createdAt,
          updatedAt: vendureProduct.updatedAt,
        },
        groupId: 0,
        productVariants: [],
        customFields: vendureProduct.customFields,
      })
    );

    optionGroups.push({
      // TODO: fall back values to satisfy type
      deletedAt: null,
      name: property as LocaleString,
      code: '',
      translations: [],
      options: options,
      product: vendureProduct,
      customFields: vendureProduct.customFields,
      id: '',
      createdAt: vendureProduct.createdAt,
      updatedAt: vendureProduct.updatedAt,
    });
  }

  return optionGroups;
}
