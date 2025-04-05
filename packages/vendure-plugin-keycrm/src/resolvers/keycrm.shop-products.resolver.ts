import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryProductArgs } from '@vendure/common/lib/generated-shop-types';
import {
  Ctx,
  RequestContext,
  Product,
  ProductService,
  Relations,
  RelationPaths,
  UserInputError,
} from '@vendure/core';
import { KeycrmService } from './../keycrm.service';
import { ProductPicked } from '../types';

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
  ): Promise<ProductPicked | undefined> {
    let result: ProductPicked | undefined;
    if (args.id) {
      result = (await this.productService.findOne(
        ctx,
        args.id,
        relations
      )) as ProductPicked;
    } else if (args.slug) {
      result = (await this.productService.findOneBySlug(
        ctx,
        args.slug,
        relations
      )) as ProductPicked;
    } else {
      throw new UserInputError('error.product-id-or-slug-must-be-provided');
    }

    if (!result) {
      return;
    }

    if (result.enabled === false) {
      return;
    }

    result.keycrm = await this.keycrmService.getProduct(result);

    return result;
  }
}
