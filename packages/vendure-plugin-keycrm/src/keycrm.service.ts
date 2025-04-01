import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger, RequestContext } from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmClient } from './keycrm.client';

@Injectable()
export class KeycrmService implements OnApplicationBootstrap {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private keycrmClient: KeycrmClient
  ) {}

  async getProduct(ctx: RequestContext, KeycrmId: string) {
    // Add your method logic here
    Logger.info(`KeycrmId: ${KeycrmId}`, loggerCtx);

    const product = await this.keycrmClient.getProduct(KeycrmId);

    Logger.info(`Keycrm Product: ${JSON.stringify(product)}`, loggerCtx);

    return {
      id: KeycrmId,
      name: 'this-is-democracy-manifest-t-shirt',
    };
  }

  async onApplicationBootstrap() {
    Logger.info(`Api Key: ${this.options.apiKey}`, loggerCtx);
  }
}
