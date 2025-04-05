import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  ProductOptionGroupPicked,
  ProductOptionKeycrmToVendure,
} from '../types';
import { InternalServerError } from '@vendure/core';

@Resolver('ProductOption')
export class ProductOptionEntityResolver {
  @ResolveField()
  name(@Parent() productOption: ProductOptionKeycrmToVendure): Promise<string> {
    return Promise.resolve(productOption.name);
  }

  @ResolveField()
  group(
    @Parent() productOption: ProductOptionKeycrmToVendure
  ): Promise<ProductOptionGroupPicked> {
    return Promise.resolve(productOption.group);
  }

  @ResolveField()
  languageCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-option.language-code.field-not-supported'
    );
  }
}
