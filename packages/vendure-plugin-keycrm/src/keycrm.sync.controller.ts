import { Controller, Inject, Post } from '@nestjs/common';
import {
  Allow,
  Ctx,
  Permission,
  RequestContext,
  UserService,
} from '@vendure/core';
import { KeycrmSyncService } from './keycrm.sync.service';
import { PluginInitOptions } from './types';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';

@Controller('sync')
export class KeycrmSyncController {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private keycrmSyncService: KeycrmSyncService,
    private userService: UserService
  ) {}

  // https://docs.vendure.io/reference/typescript-api/request/allow-decorator/
  @Allow(Permission.Owner)
  @Post()
  async sync(@Ctx() ctx: RequestContext) {
    const userId = ctx.activeUserId;
    if (userId) {
      const user = await this.userService.getUserById(ctx, userId);
      if (user) {
        const isSynchronizer = user.roles.some(
          (role) => role.code === this.options.synchronizerCode
        );
        if (isSynchronizer) {
          return this.keycrmSyncService.sync(ctx);
        }
      }
    }
  }
}
