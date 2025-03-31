import {
  PluginCommonModule,
  Type,
  VendurePlugin,
  mergeConfig,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmService } from './services/keycrm.service';
import { ProductEntityResolver } from './api/keycrm-admin.resolver';
import { shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    { provide: KEYCRM_PLUGIN_OPTIONS, useFactory: () => KeycrmPlugin.options },
    KeycrmService,
  ],
  configuration: (config) => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    return mergeConfig(config, {
      customFields: {
        Product: [{ name: 'KeycrmId', type: 'string', nullable: true }],
      },
    });
  },
  compatibility: '^3.0.0',
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ProductEntityResolver],
  },
})
export class KeycrmPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<KeycrmPlugin> {
    this.options = options;
    return KeycrmPlugin;
  }
}
