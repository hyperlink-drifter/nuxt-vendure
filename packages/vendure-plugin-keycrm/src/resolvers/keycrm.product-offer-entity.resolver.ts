import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductOfferKeycrm } from '../types';

@Resolver('KeycrmProductOffer')
export class KeycrmProductOfferEntityResolver {
  @ResolveField()
  properties_agg(@Parent() product: ProductOfferKeycrm): Promise<
    | Array<{
        name: string;
        values: Array<string>;
      }>
    | []
  > {
    const agg: Array<{
      name: string;
      values: Array<string>;
    }> = [];

    for (const prop in product.properties_agg) {
      agg.push({
        name: prop,
        values: product.properties_agg[prop],
      });
    }

    return Promise.resolve(agg);
  }
}
