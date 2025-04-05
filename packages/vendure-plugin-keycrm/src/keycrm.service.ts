import { Injectable } from '@nestjs/common';
import { InternalServerError } from '@vendure/core';
import type {
  ProductKeycrmToVendure,
  ProductOptionGroupKeycrmToVendure,
  ProductPicked,
  ProductVariantKeycrmToVendure,
  ProductVariantPicked,
  StockLevelKeycrmToVendure,
} from './types';
import { KeycrmClient } from './keycrm.client';
import {
  toVendureProductOptionGroup,
  toVendureProduct,
  toVendureVariants,
  toVendureStockLevel,
} from './keycrm.helpers';

@Injectable()
export class KeycrmService {
  constructor(private keycrmClient: KeycrmClient) {}

  async getProduct(product: ProductPicked): Promise<ProductKeycrmToVendure> {
    const keycrmId = product.customFields.KeycrmId;
    const keycrmProduct = await this.keycrmClient.getProduct(keycrmId);
    const vendureProduct = toVendureProduct(keycrmProduct, product);
    return vendureProduct;
  }

  async getProductOptionGroups(
    product: ProductPicked
  ): Promise<Array<ProductOptionGroupKeycrmToVendure>> {
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

    const optionGroups = toVendureProductOptionGroup(properties_agg);

    return Promise.resolve(optionGroups);
  }

  async getVariants(
    product: ProductPicked
  ): Promise<Array<ProductVariantKeycrmToVendure>> {
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

  async getStockLevel(variant: ProductVariantKeycrmToVendure): Promise<number> {
    const stocks = await this.keycrmClient.getStocks({
      limit: 50,
      'filter[offers_id]': variant.id.toString(),
      'filter[details]': false,
    });

    const stockLevels = toVendureStockLevel(stocks, variant);

    const stockLevel = stockLevels.at(0);

    if (!stockLevel) {
      throw new InternalServerError(
        'error.keycrm-plugin.offer.has-no-stock-level'
      );
    }

    return stockLevel.stockOnHand;
  }
}
