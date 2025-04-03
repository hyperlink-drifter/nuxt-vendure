import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryProductArgs } from '@vendure/common/lib/generated-shop-types';
import {
  Ctx,
  RequestContext,
  Product,
  ProductService,
  Relations,
  Translated,
  RelationPaths,
  UserInputError,
} from '@vendure/core';
import { KeycrmService } from './keycrm.service';

@Resolver()
export class ShopProductsResolver {
  constructor(
    private productService: ProductService,
    private keycrmService: KeycrmService
  ) {}

  @Query()
  async product(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryProductArgs,
    @Relations({ entity: Product, omit: ['variants', 'assets'] })
    relations: RelationPaths<Product>
  ): Promise<Translated<Product> | undefined> {
    let result: Translated<Product> | undefined;
    if (args.id) {
      result = await this.productService.findOne(ctx, args.id, relations);
    } else if (args.slug) {
      result = await this.productService.findOneBySlug(
        ctx,
        args.slug,
        relations
      );
    } else {
      throw new UserInputError('error.product-id-or-slug-must-be-provided');
    }

    if (!result) {
      return;
    }

    if (result.enabled === false) {
      return;
    }

    result.facetValues = result.facetValues?.filter(
      (fv) => !fv.facet.isPrivate
    ) as any;

    result.keycrm = await this.keycrmService.getProduct(ctx, result);

    return result;
  }
}
