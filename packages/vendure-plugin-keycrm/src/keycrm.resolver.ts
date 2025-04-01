import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Product } from '@vendure/core';
import { KeycrmService } from './keycrm.service';

@Resolver('Product')
export class ProductEntityResolver {
  constructor(private keycrmService: KeycrmService) {}

  @ResolveField()
  keycrm(@Ctx() ctx: RequestContext, @Parent() product: Product) {
    return this.keycrmService.getProduct(ctx, product.customFields.KeycrmId);
  }
}
