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
  InternalServerError,
  Asset,
  ProductOptionGroup,
  ProductVariant,
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

@Resolver('ProductVariant')
export class ProductVariantEntityResolver {
  @ResolveField()
  async price(@Parent() productVariant: ProductVariant): Promise<number> {
    return Promise.resolve(productVariant.price);
  }
}

@Resolver('Product')
export class ProductEntityResolver {
  constructor(private keycrmService: KeycrmService) {}

  @ResolveField()
  name(@Parent() product: Product): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.name);
  }

  @ResolveField()
  slug(@Parent() product: Product): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.slug);
  }

  @ResolveField()
  description(@Parent() product: Product): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.description);
  }

  @ResolveField()
  async variants(@Parent() product: Product): Promise<Array<ProductVariant>> {
    return await this.keycrmService.getVariants(product);
  }

  @ResolveField()
  async optionGroups(
    @Parent() product: Product
  ): Promise<Array<ProductOptionGroup>> {
    return await this.keycrmService.getProductOptionGroups(product);
  }

  @ResolveField()
  featuredAsset(@Parent() product: Product): Promise<Asset | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.featuredAsset);
  }

  @ResolveField()
  async assets(@Parent() product: Product): Promise<Asset[] | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else {
      return Promise.resolve(product.keycrm.assets.map(({ asset }) => asset));
    }
  }
}
