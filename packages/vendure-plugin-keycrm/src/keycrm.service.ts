import { Inject, Injectable } from '@nestjs/common';
import { RequestContext, Product } from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmClient } from './keycrm.client';

@Injectable()
export class KeycrmService {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private keycrmClient: KeycrmClient
  ) {}

  async getProduct(ctx: RequestContext, KeycrmId: string) {
    const product = await this.keycrmClient.getProduct(KeycrmId);
    return product;
  }
}
