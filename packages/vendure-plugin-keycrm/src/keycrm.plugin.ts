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
