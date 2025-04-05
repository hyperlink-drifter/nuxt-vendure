import { Inject } from '@nestjs/common';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { OfferKeycrm, PluginInitOptions, ProductKeycrm } from './types';
import { $Fetch, ofetch } from 'ofetch';

type QueryOffers = {
  sort?: 'id' | '-id';
  limit?: number;
  include?: 'product';
  'filter[product_id]'?: string;
};

export class KeycrmClient {
  readonly $fetch: $Fetch;

  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions
  ) {
    this.$fetch = ofetch.create({
      baseURL: 'https://openapi.keycrm.app/v1/',
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        accept: 'application/json',
      },
    });
  }

  async getProduct(product_id: string): Promise<ProductKeycrm> {
    return await this.$fetch(`products/${product_id}`);
  }

  async getOffers(
    query: QueryOffers = {
      sort: 'id',
      limit: 15,
    }
  ): Promise<Array<OfferKeycrm>> {
    const { data: offers } = await this.$fetch<{ data: Array<OfferKeycrm> }>(
      `offers`,
      {
        query,
      }
    );

    return offers;
  }
}
