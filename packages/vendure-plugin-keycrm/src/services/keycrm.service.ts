import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  ID,
  Product,
  RequestContext,
  TransactionalConnection,
  Logger,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS, loggerCtx } from '../constants';
import { PluginInitOptions } from '../types';

@Injectable()
export class KeycrmService implements OnApplicationBootstrap {
  constructor(
    private connection: TransactionalConnection,
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions
  ) {}

  async exampleMethod(ctx: RequestContext, id: ID) {
    // Add your method logic here
    const result = await this.connection
      .getRepository(ctx, Product)
      .findOne({ where: { id } });
    return result;
  }

  async onApplicationBootstrap() {
    Logger.info(`Api Key: ${this.options.apiKey}`, loggerCtx);
  }
}
