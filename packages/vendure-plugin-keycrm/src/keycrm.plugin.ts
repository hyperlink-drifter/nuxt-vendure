import {
  mergeConfig,
  PluginCommonModule,
  Type,
  VendurePlugin,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmClient } from './keycrm.client';
import { KeycrmSyncService } from './keycrm.sync.service';
import { KeycrmSyncController } from './keycrm.sync.controller';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    { provide: KEYCRM_PLUGIN_OPTIONS, useFactory: () => KeycrmPlugin.options },
    KeycrmClient,
    KeycrmSyncService,
  ],
  controllers: [KeycrmSyncController],
  configuration: (config) => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    return mergeConfig(config, {
      customFields: {
        Product: [
          {
            name: 'keycrm_id',
            type: 'int',
            nullable: true,
          },
          {
            name: 'keycrm_created_at',
            type: 'datetime',
            nullable: true,
          },
          {
            name: 'keycrm_updated_at',
            type: 'datetime',
            nullable: true,
          },
        ],
        ProductVariant: [
          {
            name: 'keycrm_id',
            type: 'int',
            nullable: true,
          },
          {
            name: 'keycrm_product_id',
            type: 'int',
            nullable: true,
          },
          {
            name: 'keycrm_created_at',
            type: 'datetime',
            nullable: true,
          },
          {
            name: 'keycrm_updated_at',
            type: 'datetime',
            nullable: true,
          },
        ],
      },
    });
  },
  compatibility: '^3.2.2',
  shopApiExtensions: {
    resolvers: [],
  },
})
export class KeycrmPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<KeycrmPlugin> {
    this.options = options;
    return KeycrmPlugin;
  }
}
