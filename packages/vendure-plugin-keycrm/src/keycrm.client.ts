import { Inject } from '@nestjs/common';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { $Fetch, ofetch } from 'ofetch';

export class KeycrmClient {
  readonly $fetch: $Fetch;

  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions
  ) {
    this.$fetch = ofetch.create({
      baseURL: this.options.baseURL,
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        accept: 'application/json',
      },
    });
  }

  async getProduct(product_id: string) {
    return await this.$fetch(`products/${product_id}`);
  }
}
