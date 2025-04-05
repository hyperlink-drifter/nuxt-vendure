import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AssetPicked, ProductVariantKeycrmToVendure } from '../types';
import { InternalServerError } from '@vendure/core';

@Resolver('ProductVariant')
export class ProductVariantEntityResolver {
  @ResolveField()
  async price(
    @Parent() productVariant: ProductVariantKeycrmToVendure
  ): Promise<number> {
    return Promise.resolve(productVariant.price);
  }

  @ResolveField()
  async featuredAsset(
    @Parent() productVariant: ProductVariantKeycrmToVendure
  ): Promise<AssetPicked | undefined> {
    if (productVariant.featuredAsset && productVariant.featuredAsset.source) {
      return productVariant.featuredAsset;
    }
    return undefined;
  }

  @ResolveField()
  name() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.name.field-not-supported'
    );
  }

  @ResolveField()
  languageCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.language-code.field-not-supported'
    );
  }

  @ResolveField()
  priceWithTax() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.price-with-tax.field-not-supported'
    );
  }

  @ResolveField()
  currencyCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.currency-code.field-not-supported'
    );
  }

  @ResolveField()
  taxRateApplied() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.tax-rate-applied.field-not-supported'
    );
  }

  @ResolveField()
  product() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.product.field-not-supported'
    );
  }

  @ResolveField()
  assets() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-variant.assets.field-not-supported'
    );
  }
}
