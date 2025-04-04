import { Inject, Injectable } from '@nestjs/common';
import {
  RequestContext,
  Product,
  Translated,
  TranslatorService,
  InternalServerError,
  ProductOptionGroup,
  ProductVariant,
} from '@vendure/core';
import { KEYCRM_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions, ProductKeycrm } from './types';
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
    private keycrmClient: KeycrmClient,
    private translator: TranslatorService
  ) {}

  async getProduct(
    ctx: RequestContext,
    product: Product
  ): Promise<Translated<Product & Pick<ProductKeycrm, 'has_offers'>>> {
    const keycrmId = product.customFields.KeycrmId;
    const keycrm = await this.keycrmClient.getProduct(keycrmId);
    const vendure = toVendureProduct(keycrm, product);
    return this.translator.translate(vendure, ctx);
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
