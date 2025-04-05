import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductVariant } from '@vendure/core';

@Resolver('ProductVariant')
export class ProductVariantEntityResolver {
  @ResolveField()
  async price(@Parent() productVariant: ProductVariant): Promise<number> {
    return Promise.resolve(productVariant.price);
  }
}
