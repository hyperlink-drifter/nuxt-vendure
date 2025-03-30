import {
  PluginCommonModule,
  Type,
  VendurePlugin,
  Logger,
  EventBus,
  RequestContextService,
  ProcessContext,
  VendureEvent,
  RequestContext,
} from '@vendure/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { PLUGIN_INIT_OPTIONS, loggerCtx } from './constants';
import { PluginInitOptions, Job } from './types';
import { CronJob } from 'cron';

export class CronEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public readonly taskId: string) {
    super();
  }
}

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
      CronPlugin.options.cron.forEach((job: Job) => {
        if (!job.task && !job.taskId) {
          Logger.error(
            'Please provide either a task function or a taskId to run a cronjob.',
            loggerCtx
          );
          return;
        }

        CronJob.from({
          cronTime: job.schedule,
          onTick: async () => {
            if (job.task) job.task();
            if (job.taskId) {
              if (CronPlugin.options.logEvents) {
                Logger.info('Firing Event', loggerCtx);
              }
              const ctx = await this.requestContextService.create({
                apiType: 'admin',
              });
              this.eventBus.publish(new CronEvent(ctx, job.taskId));
            }
          },
          start: true,
          timeZone: 'system',
        });

        if (CronPlugin.options.logEvents) {
          this.eventBus.ofType(CronEvent).subscribe((event) => {
            Logger.info(`Cron Event "${event.taskId}" fired`, loggerCtx);
          });
        }
      });
    }
  }
}
