import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductOptionPicked } from '../types';
import { InternalServerError } from '@vendure/core';

@Resolver('ProductOption')
export class ProductOptionEntityResolver {
  @ResolveField()
  name(@Parent() productOption: ProductOptionPicked): Promise<string> {
    return Promise.resolve(productOption.name);
  }

  @ResolveField()
  languageCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-option.language-code.field-not-supported'
    );
  }
}
