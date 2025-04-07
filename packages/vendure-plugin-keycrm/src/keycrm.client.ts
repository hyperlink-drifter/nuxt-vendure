import { Inject } from '@nestjs/common';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import {
  CategoryListKeycrm,
  OfferKeycrm,
  OfferStocksKeycrm,
  PluginInitOptions,
  ProductKeycrm,
  ProductListKeycrm,
} from './types';
import { $Fetch, ofetch } from 'ofetch';

type QueryProducts = {
  limit?: number;
  page?: number;
  'filter[product_id]'?: string;
  'filter[category_id]'?: string;
  'filter[is_archived]'?: boolean;
};

type QueryCategories = {
  limit?: number;
  page?: number;
  'filter[category_id]'?: string;
  'filter[parent_id]'?: string;
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

type QueryStocks = {
  limit?: number;
  page?: number;
  'filter[offers_id]'?: string;
  'filter[details]'?: boolean;
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

  async getCategories(
    query: QueryCategories = {
      limit: 12,
      page: 1,
    }
  ): Promise<CategoryListKeycrm> {
    const categories = await this.$fetch<CategoryListKeycrm>(
      'products/categories',
      {
        query,
      }
    );
    return categories;
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

  async getStocks(
    query: QueryStocks = {
      limit: 15,
      page: 1,
      'filter[details]': false,
    }
  ): Promise<Array<OfferStocksKeycrm>> {
    const { data: stocks } = await this.$fetch<{
      data: Array<OfferStocksKeycrm>;
    }>('offers/stocks', {
      query,
    });

    return stocks;
  }
}
