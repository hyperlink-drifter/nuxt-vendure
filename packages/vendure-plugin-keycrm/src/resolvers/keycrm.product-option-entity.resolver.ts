import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductOptionPicked } from '../types';

@Resolver('ProductOption')
export class ProductOptionEntityResolver {
  @ResolveField()
  name(@Parent() productOption: ProductOptionPicked): Promise<string> {
    return Promise.resolve(productOption.name);
  }
}
