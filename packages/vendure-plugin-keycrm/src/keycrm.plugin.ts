import {
  PluginCommonModule,
  Type,
  VendurePlugin,
  mergeConfig,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { KeycrmService } from './keycrm.service';
import { KeycrmClient } from './keycrm.client';
import { ShopProductsResolver } from './resolvers/keycrm.shop-products.resolver';
import { ProductEntityResolver } from './resolvers/keycrm.product-entity.resolver';
import { ProductVariantEntityResolver } from './resolvers/keycrm.product-variant-entity.resolver';
import { ProductOptionGroupEntityResolver } from './resolvers/keycrm.product-option-group-entity.resolver';
import { ProductOptionEntityResolver } from './resolvers/keycrm.product-option-entity.resolver';
import { shopApiExtensions } from './api-extensions';
import { KeycrmProductOfferEntityResolver } from './resolvers/keycrm.product-offer-entity.resolver';
import { ShopKeycrmProductResolver } from './resolvers/keycrm.products.resolver';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    { provide: KEYCRM_PLUGIN_OPTIONS, useFactory: () => KeycrmPlugin.options },
    KeycrmService,
    KeycrmClient,
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
    resolvers: [
      ShopProductsResolver,
      ProductEntityResolver,
      ProductVariantEntityResolver,
      ProductOptionGroupEntityResolver,
      ProductOptionEntityResolver,
      KeycrmProductOfferEntityResolver,
      ShopKeycrmProductResolver,
    ],
  },
})
export class KeycrmPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<KeycrmPlugin> {
    this.options = options;
    return KeycrmPlugin;
  }
}
