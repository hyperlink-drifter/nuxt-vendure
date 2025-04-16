import { Inject } from '@nestjs/common';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import {
  PluginInitOptions,
  ProductListKeycrm,
  ProductOfferListKeycrm,
} from './types';
import { $Fetch, ofetch } from 'ofetch';

type QueryProducts = {
  limit?: number;
  page?: number;
  include?: 'custom_fields';
  'filter[product_id]'?: string;
  'filter[category_id]'?: string;
  'filter[is_archived]'?: boolean;
};

type QueryOffers = {
  sort?: 'id' | '-id';
  limit?: number;
  include?: 'product';
  'filter[id]'?: string;
  'filter[product_id]'?: string;
  'filter[sku]'?: string;
  'filter[is_archived]'?: boolean;
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

  async getProducts(
    query: QueryProducts = {
      limit: 12,
      page: 1,
    }
  ): Promise<ProductListKeycrm> {
    const products = await this.$fetch<ProductListKeycrm>('products', {
      query,
    });

    return products;
  }

  async getOffers(
    query: QueryOffers = {
      sort: 'id',
      limit: 12,
    }
  ): Promise<ProductOfferListKeycrm> {
    const offers = await this.$fetch<ProductOfferListKeycrm>(`offers`, {
      query,
    });

    return offers;
  }
}
