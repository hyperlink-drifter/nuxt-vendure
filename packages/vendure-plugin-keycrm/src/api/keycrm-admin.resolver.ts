import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Product } from '@vendure/core';
import { KeycrmService } from '../services/keycrm.service';

@Resolver('Product')
export class ProductEntityResolver {
  constructor(private keycrmService: KeycrmService) {}

  @ResolveField()
  keycrm(@Ctx() ctx: RequestContext, @Parent() product: Product) {
    return this.keycrmService.getKeycrm(ctx, product.customFields.KeycrmId);
  }
}
