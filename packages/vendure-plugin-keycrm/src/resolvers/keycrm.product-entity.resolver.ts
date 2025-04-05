import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  Product,
  InternalServerError,
  ProductOptionGroup,
  ProductVariant,
} from '@vendure/core';
import { KeycrmService } from './../keycrm.service';
import { AssetPicked } from '../types';

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
  featuredAsset(@Parent() product: Product): Promise<AssetPicked | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.featuredAsset);
  }

  @ResolveField()
  async assets(@Parent() product: Product): Promise<AssetPicked[] | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else {
      return Promise.resolve(product.keycrm.assets.map((asset) => asset));
    }
  }
}
