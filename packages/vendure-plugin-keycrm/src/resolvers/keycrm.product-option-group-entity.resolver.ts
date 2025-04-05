import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductOptionGroupKeycrmToVendure } from '../types';
import { InternalServerError } from '@vendure/core';

@Resolver('ProductOptionGroup')
export class ProductOptionGroupEntityResolver {
  @ResolveField()
  name(
    @Parent() optionGroup: ProductOptionGroupKeycrmToVendure
  ): Promise<string> {
    return Promise.resolve(optionGroup.name);
  }

  @ResolveField()
  languageCode() {
    throw new InternalServerError(
      'error.keycrm-plugin.product-option-group.language-code.field-not-supported'
    );
  }
}
