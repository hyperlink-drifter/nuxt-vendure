import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductVariantKeycrmToVendure } from '../types';

@Resolver('ProductVariant')
export class ProductVariantEntityResolver {
  @ResolveField()
  async price(
    @Parent() productVariant: ProductVariantKeycrmToVendure
  ): Promise<number> {
    return Promise.resolve(productVariant.price);
  }
}
