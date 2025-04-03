import { Inject, Injectable } from '@nestjs/common';
import {
  RequestContext,
  Product,
  Translated,
  TranslatorService,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmClient } from './keycrm.client';
import { toVendureProduct } from './keycrm.helpers';

@Injectable()
export class KeycrmService {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private keycrmClient: KeycrmClient,
    private translator: TranslatorService
  ) {}

  async getProduct(
    ctx: RequestContext,
    product: Product
  ): Promise<Translated<Product>> {
    const keycrmId = product.customFields.KeycrmId;
    const keycrm = await this.keycrmClient.getProduct(keycrmId);
    const vendure = toVendureProduct(keycrm, product);
    return this.translator.translate(vendure, ctx);
  }
}
