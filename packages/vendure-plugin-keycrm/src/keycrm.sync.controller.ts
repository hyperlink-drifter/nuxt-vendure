import { Controller, Post } from '@nestjs/common';
import { Ctx, RequestContext } from '@vendure/core';
import { KeycrmSyncService } from './keycrm.sync.service';

@Controller('sync')
export class KeycrmSyncController {
  constructor(private keycrmSyncService: KeycrmSyncService) {}

  // TODO: @Allow(Permission.Entity)
  // https://docs.vendure.io/reference/typescript-api/request/allow-decorator/
  @Post()
  sync(@Ctx() ctx: RequestContext) {
    return this.keycrmSyncService.sync(ctx);
  }
}
