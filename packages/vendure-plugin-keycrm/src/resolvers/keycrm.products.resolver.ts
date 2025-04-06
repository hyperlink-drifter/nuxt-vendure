import { Args, Query, Resolver } from '@nestjs/graphql';
import { Scalars } from '@vendure/core';
import { KeycrmClient } from '../keycrm.client';
import { ProductKeycrm, ProductOfferKeycrm } from '../types';

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

  @Query()
  async keycrmProductOffer(
    @Args() args: QueryKeycrmProductArgs
  ): Promise<ProductOfferKeycrm> {
    const keycrmOffers = await this.keycrmClient.getOffers({
      'filter[product_id]': args.id,
      include: 'product',
    });
    const offer = keycrmOffers.at(0);
    const productOffer = offer!.product;
    productOffer.offers = keycrmOffers;
    return productOffer;
  }
}
