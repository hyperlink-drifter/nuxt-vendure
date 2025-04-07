import { Args, Query, Resolver } from '@nestjs/graphql';
import { Scalars } from '@vendure/core';
import { KeycrmClient } from '../keycrm.client';
import { ProductKeycrm, ProductListKeycrm, ProductOfferKeycrm } from '../types';

type QueryKeycrmProductArgs = {
  id: Scalars['ID'];
};

type QueryKeycrmProductsArgs = {
  options: {
    limit?: Scalars['Int'];
    page?: Scalars['Int'];
    filter?: {
      product_id?: Scalars['String'];
      category_id?: Scalars['String'];
      is_archived?: Scalars['Boolean'];
    };
  };
};

@Resolver()
export class ShopKeycrmProductResolver {
  constructor(private keycrmClient: KeycrmClient) {}

  @Query()
  async keycrmProducts(
    @Args() args: QueryKeycrmProductsArgs
  ): Promise<ProductListKeycrm> {
    const { options } = args;
    const { limit, page, filter } = options ?? {};
    const { product_id, category_id, is_archived } = filter ?? {};
    const keycrmProductList = await this.keycrmClient.getProducts({
      ...(limit && { limit }),
      ...(page && { page }),
      ...(product_id && { 'filter[product_id]': product_id }),
      ...(category_id && { 'filter[category_id]': category_id }),
      ...(is_archived && { 'filter[is_archived]': is_archived }),
    });
    return keycrmProductList;
  }

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
