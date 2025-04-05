import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductOptionGroupKeycrmToVendure } from '../types';

@Resolver('ProductOptionGroup')
export class ProductOptionGroupEntityResolver {
  @ResolveField()
  name(
    @Parent() optionGroup: ProductOptionGroupKeycrmToVendure
  ): Promise<string> {
    return Promise.resolve(optionGroup.name);
  }
}
