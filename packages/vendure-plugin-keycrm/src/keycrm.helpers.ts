import type { LocaleString } from '@vendure/core';
import {
  OfferKeycrm,
  ProductKeycrm,
  ProductKeycrmToVendure,
  ProductOptionGroupKeycrmToVendure,
  ProductOptionPicked,
  ProductPicked,
  ProductVariantKeycrmToVendure,
} from './types';

export function toVendureProduct(
  keycrmProduct: ProductKeycrm,
  vendureProduct: ProductPicked
): ProductKeycrmToVendure {
  const product: ProductKeycrmToVendure = {
    id: keycrmProduct.id,
    createdAt: keycrmProduct.created_at,
    updatedAt: keycrmProduct.updated_at,
    name: keycrmProduct.name as LocaleString,
    slug: vendureProduct.slug,
    description: keycrmProduct.description
      ? (keycrmProduct.description as LocaleString)
      : vendureProduct.description
      ? vendureProduct.description
      : ('' as LocaleString),
    enabled: !keycrmProduct.is_archived,
    featuredAsset: {
      source: keycrmProduct.thumbnail_url ? keycrmProduct.thumbnail_url : '',
    },
    assets: [
      ...keycrmProduct.attachments_data.map((url) => ({
        source: url,
      })),
    ],
    customFields: {
      KeycrmId: vendureProduct.customFields.KeycrmId,
    },
    keycrm: undefined,
  };

  return product;
}

export function toVendureProductOptionGroup(
  keycrmPropertiesAgg: Record<string, string[]>
): Array<ProductOptionGroupKeycrmToVendure> {
  const optionGroups: Array<ProductOptionGroupKeycrmToVendure> = [];

  for (const property in keycrmPropertiesAgg) {
    const options: ProductOptionPicked[] = keycrmPropertiesAgg[property].map(
      (name) => ({
        name: name as LocaleString,
      })
    );

    optionGroups.push({
      name: property as LocaleString,
      options: options,
    });
  }

  return optionGroups;
}

export function toVendureVariants(
  offers: Array<OfferKeycrm>,
  vendureProduct: ProductPicked
): Array<ProductVariantKeycrmToVendure> {
  const variants: Array<ProductVariantKeycrmToVendure> = [];

  for (const offer of offers) {
    variants.push({
      id: offer.id,
      productId: vendureProduct.id,
      sku: offer.sku ? offer.sku : '',
      listPrice: offer.purchased_price,
      price: offer.price,
      featuredAsset: {
        source: offer.thumbnail_url ? offer.thumbnail_url : '',
      },
      stockLevels: [],
    });
  }

  return variants;
}
