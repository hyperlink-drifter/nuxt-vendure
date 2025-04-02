import { AssetType } from '@vendure/core';
import type {
  LocaleString,
  Product,
  Translation,
  VendureEntity,
} from '@vendure/core';
import { ProductKeycrm } from './types';

export function toVendureProduct(
  keycrmProduct: ProductKeycrm,
  vendureProduct: Product
): Product & { translations: Array<Translation<VendureEntity>> } {
  const product: Product & { translations: Array<Translation<VendureEntity>> } =
    {
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
    };

  return product;
}
