import {
  mergeConfig,
  PluginCommonModule,
  Type,
  VendurePlugin,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    { provide: KEYCRM_PLUGIN_OPTIONS, useFactory: () => KeycrmPlugin.options },
  ],
  configuration: (config) => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    return mergeConfig(config, {
      customFields: {
        Product: [
          {
            name: 'keycrm',
            type: 'struct',
            nullable: false,
            fields: [
              { name: 'id', type: 'int' },
              { name: 'created_at', type: 'datetime' },
              { name: 'updated_at', type: 'datetime' },
            ],
          },
        ],
        ProductVariant: [
          {
            name: 'keycrm',
            type: 'struct',
            nullable: false,
            fields: [
              { name: 'id', type: 'int' },
              { name: 'product_id', type: 'int' },
              { name: 'created_at', type: 'datetime' },
              { name: 'updated_at', type: 'datetime' },
            ],
          },
        ],
      },
    });
  },
  compatibility: '^3.0.0',
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
