import { Args, Query, Resolver } from '@nestjs/graphql';
import { Scalars } from '@vendure/core';
import { KeycrmClient } from '../keycrm.client';
import { ProductKeycrm } from '../types';

type QueryKeycrmProductArgs = {
  id: Scalars['ID'];
};

@Resolver()
export class ShopKeycrmProductResolver {
  constructor(private keycrmClient: KeycrmClient) {}

  @Query()
  async keycrmProduct(
    @Args() args: QueryKeycrmProductArgs
  ): Promise<ProductKeycrm> {
    const keycrmProduct = await this.keycrmClient.getProduct(args.id);
    return keycrmProduct;
  }
}
