import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AssetPicked, ProductVariantKeycrmToVendure } from '../types';

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
}
