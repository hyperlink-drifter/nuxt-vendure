import {
  PluginCommonModule,
  Type,
  VendurePlugin,
  Logger,
  EventBus,
  RequestContextService,
  ProcessContext,
} from '@vendure/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { PLUGIN_INIT_OPTIONS, loggerCtx } from './constants';
import { PluginInitOptions, Job } from './types';
import { CronJob } from 'cron';
import { CronEvent } from './cron.event';

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
  /** @internal */
  constructor(
    private eventBus: EventBus,
    private requestContextService: RequestContextService,
    private processContext: ProcessContext
  ) {}

  static options: PluginInitOptions = { cron: [], logEvents: false };

  static init(options: PluginInitOptions): Type<CronPlugin> {
    this.options = options;
    return CronPlugin;
  }

  async onApplicationBootstrap() {
    if (this.processContext.isWorker) {
      Logger.info('Hello World... this is Plugin', loggerCtx);
      const ctx = await this.requestContextService.create({
        apiType: 'admin',
      });

      setTimeout(() => {
        this.eventBus.publish(new CronEvent(ctx, 'xyz'));
      }, 2000);

      this.eventBus.ofType(CronEvent).subscribe((event) => {
        Logger.info(`Cron Event "${event.taskId}" fired`, loggerCtx);
      });
    }
  }
}
