import { Inject, Injectable } from '@nestjs/common';
import {
  Product,
  InternalServerError,
  ProductOptionGroup,
  ProductVariant,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import {
  PluginInitOptions,
  ProductKeycrmToVendure,
  ProductPicked,
} from './types';
import { KeycrmClient } from './keycrm.client';
import {
  toVendureProductOptionGroup,
  toVendureProduct,
  toVendureVariants,
} from './keycrm.helpers';

@Injectable()
export class KeycrmService {
  constructor(
    @Inject(KEYCRM_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private keycrmClient: KeycrmClient
  ) {}

  async getProduct(product: ProductPicked): Promise<ProductKeycrmToVendure> {
    const keycrmId = product.customFields.KeycrmId;
    const keycrmProduct = await this.keycrmClient.getProduct(keycrmId);
    const vendureProduct = toVendureProduct(keycrmProduct, product);
    return vendureProduct;
  }

  async getProductOptionGroups(
    product: Product
  ): Promise<Array<ProductOptionGroup>> {
    if (!product.keycrm) {
      throw new InternalServerError('error.product.has-no-property-keycrm');
    }

    const offers = await this.keycrmClient.getOffers({
      sort: 'id',
      include: 'product',
      limit: 1,
      'filter[product_id]': product.keycrm.id.toString(),
    });

    const offer = offers.at(0);
    if (!offer) {
      throw new InternalServerError('error.keycrm.offers.no-offer-available');
    }

    const properties_agg = offer.product.properties_agg;

    if (!properties_agg) {
      return Promise.resolve([]);
    }

    const optionGroups = toVendureProductOptionGroup(properties_agg, product);

    return Promise.resolve(optionGroups);
  }

  async getVariants(product: Product): Promise<Array<ProductVariant>> {
    if (!product.keycrm) {
      throw new InternalServerError('error.product.has-no-property-keycrm');
    }

    const offers = await this.keycrmClient.getOffers({
      sort: 'id',
      include: 'product',
      limit: 50,
      'filter[product_id]': product.keycrm.id.toString(),
    });

    try {
      const variants = toVendureVariants(offers, product);
      return Promise.resolve(variants);
    } catch (e) {
      console.error({ e });
      return Promise.resolve([]);
    }
  }
}
