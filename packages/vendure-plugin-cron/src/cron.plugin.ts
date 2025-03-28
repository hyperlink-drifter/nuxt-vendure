import { PluginCommonModule, Type, VendurePlugin, Logger } from '@vendure/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { PLUGIN_INIT_OPTIONS, loggerCtx } from './constants';
import { PluginInitOptions } from './types';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    {
      provide: PLUGIN_INIT_OPTIONS,
      useFactory: () => CronPlugin.options,
    },
  ],
  configuration: (config) => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    return config;
  },
  compatibility: '^3.0.0',
})
export class CronPlugin implements OnApplicationBootstrap {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<CronPlugin> {
    this.options = options;
    return CronPlugin;
  }

  async onApplicationBootstrap() {
    Logger.info(`Cron Plugin is doing something!`, loggerCtx);
  }
}
