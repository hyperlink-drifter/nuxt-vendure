import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger, RequestContext } from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { PluginInitOptions } from './types';

@Injectable()
export class KeycrmService implements OnApplicationBootstrap {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions
  ) {}

  async getKeycrm(ctx: RequestContext, KeycrmId: string) {
    // Add your method logic here
    Logger.info(`KeycrmId: ${KeycrmId}`, loggerCtx);

    return {
      id: KeycrmId,
      name: 'this-is-democracy-manifest-t-shirt',
    };
  }

  async onApplicationBootstrap() {
    Logger.info(`Api Key: ${this.options.apiKey}`, loggerCtx);
  }
}
