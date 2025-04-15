import { Injectable, OnModuleInit } from '@nestjs/common';
import { KeycrmClient } from './keycrm.client';
import {
  JobQueue,
  JobQueueService,
  Logger,
  RequestContext,
  SerializedRequestContext,
} from '@vendure/core';
import { JobState } from '@vendure/common/lib/generated-types';
import { loggerCtx } from './constants';

@Injectable()
export class KeycrmSyncService implements OnModuleInit {
  private jobQueue: JobQueue<{ ctx: SerializedRequestContext }>;

  constructor(
    private keycrmClient: KeycrmClient,
    private jobQueueService: JobQueueService
  ) {}

  async onModuleInit() {
    this.jobQueue = await this.jobQueueService.createQueue({
      name: 'keycrm-sync',
      process: async (job) => {
        const ctx = RequestContext.deserialize(job.data.ctx);
        return await this.keycrmClient.getProducts({ limit: 20 });
      },
    });
  }

  async sync(ctx: RequestContext) {
    const job = await this.jobQueue.add(
      { ctx: ctx.serialize() },
      { retries: 4 }
    );

    job
      .updates()
      .toPromise()
      .then((update: any) => {
        Logger.info(
          `Job ${update.id}: progress: ${update.progress}`,
          loggerCtx
        );
        if (update.state === JobState.COMPLETED) {
          Logger.info(`COMPLETED Job ${update.id}`, loggerCtx);
        }
        return update.result;
      })
      .catch((error: any) => {
        Logger.error(`Error: ${error}`, loggerCtx);
      });

    return { fml: true };
  }
}
