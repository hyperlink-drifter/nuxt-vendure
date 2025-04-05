import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { InternalServerError } from '@vendure/core';
import { KeycrmService } from './../keycrm.service';
import {
  AssetPicked,
  ProductOptionGroupKeycrmToVendure,
  ProductPicked,
  ProductVariantKeycrmToVendure,
} from '../types';

@Resolver('Product')
export class ProductEntityResolver {
  constructor(private keycrmService: KeycrmService) {}

  @ResolveField()
  name(@Parent() product: ProductPicked): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.name);
  }

  @ResolveField()
  slug(@Parent() product: ProductPicked): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.slug);
  }

  @ResolveField()
  description(@Parent() product: ProductPicked): Promise<string> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.description);
  }

  @ResolveField()
  async variants(
    @Parent() product: ProductPicked
  ): Promise<Array<ProductVariantKeycrmToVendure>> {
    return await this.keycrmService.getVariants(product);
  }

  @ResolveField()
  async optionGroups(
    @Parent() product: ProductPicked
  ): Promise<Array<ProductOptionGroupKeycrmToVendure>> {
    return await this.keycrmService.getProductOptionGroups(product);
  }

  @ResolveField()
  featuredAsset(
    @Parent() product: ProductPicked
  ): Promise<AssetPicked | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else return Promise.resolve(product.keycrm.featuredAsset);
  }

  @ResolveField()
  async assets(
    @Parent() product: ProductPicked
  ): Promise<AssetPicked[] | undefined> {
    if (!product.keycrm) {
      throw new InternalServerError('error.entity-has-no-field-keycrm');
    } else {
      return Promise.resolve(product.keycrm.assets.map((asset) => asset));
    }
  }

  @ResolveField()
  languageCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product.language-code.field-not-supported'
    );
  }
}
