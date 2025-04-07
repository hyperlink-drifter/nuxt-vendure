// types.ts

// Note: we are using a deep import here, rather than importing from `@vendure/core` due to
// a possible bug in TypeScript (https://github.com/microsoft/TypeScript/issues/46617) which
// causes issues when multiple plugins extend the same custom fields interface.
import {
  Asset,
  Product,
  ProductOption,
  ProductOptionGroup,
  ProductVariant,
  StockLevel,
  StockLocation,
} from '@vendure/core';
import { CustomProductFields } from '@vendure/core/dist/entity/custom-entity-fields';
declare module '@vendure/core/dist/entity/custom-entity-fields' {
  interface CustomProductFields {
    KeycrmId: string;
  }
}

declare module '@vendure/core' {
  interface Product {
    /**
     * A Keycrm Product mapped to Vendure's Product Fields
     */
    keycrm: ProductKeycrmToVendure | undefined;
  }
}

/**
 * @description
 * The plugin can be configured using the following options:
 */
export interface PluginInitOptions {
  /**
   * Private API key from your Keycrm Account
   */
  apiKey: string;
}

export type CategoryKeycrm = {
  id: number;
  name: string;
  parent_id: number | null;
};

export type ProductListKeycrm = {
  total: number;
  current_page: number;
  per_page: number;
  items: Array<ProductKeycrm>;
};

export type ProductKeycrm = {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  attachments_data: [] | string[];
  quantity: number;
  sku?: string;
  min_price: number;
  max_price: number;
  has_offers: boolean;
  is_archived: boolean;
  category_id: number | null;
  created_at: Date;
  updated_at: Date;
};
export type ProductPicked = Pick<
  Product,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'slug'
  | 'description'
  | 'enabled'
  | 'customFields'
  | 'keycrm'
>;
export type AssetPicked = Pick<Asset, 'source'>;
export type ProductKeycrmToVendure = ProductPicked & {
  featuredAsset: AssetPicked;
  assets: Array<AssetPicked>;
};

export type ProductOptionPicked = Pick<ProductOption, 'name'>;

export type ProductOptionKeycrmToVendure = ProductOptionPicked & {
  group: ProductOptionGroupPicked;
};

export type ProductOptionGroupPicked = Pick<ProductOptionGroup, 'name'>;

export type ProductOptionGroupKeycrmToVendure = ProductOptionGroupPicked & {
  options: Array<ProductOptionPicked>;
};

export type ProductOfferKeycrm = ProductKeycrm & {
  properties_agg?: Record<string, string[]>;
  offers: Array<OfferKeycrm>;
};

export type WarehouseKeycrm = {
  id: number;
  name: string;
  quantity: number;
  reserve: number;
};

export type OfferStocksKeycrm = {
  id: number;
  sku: string;
  price: number;
  purchased_price: number;
  quantity: number;
  reserve: number;
  warehouse?: WarehouseKeycrm;
};

export type OfferKeycrm = {
  id: number;
  product_id: number;
  sku: string | null;
  barcode: string | null;
  thumbnail_url: string | null;
  price: number;
  purchased_price: number;
  quantity: number;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  properties: Array<{ name: string; value: string }>;
  product: ProductOfferKeycrm;
};

export type StockLevelPicked = Pick<
  StockLevel,
  'productVariantId' | 'stockLocationId' | 'stockOnHand' | 'stockAllocated'
>;

export type StockLocationPicked = Pick<StockLocation, 'name'>;

export type StockLevelKeycrmToVendure = StockLevelPicked & {
  productVariant: ProductVariantKeycrmToVendure;
  stockLocation: StockLocationPicked;
};

export type ProductVariantPicked = Pick<
  ProductVariant,
  'id' | 'productId' | 'sku' | 'listPrice' | 'price'
>;

export type ProductVariantKeycrmToVendure = ProductVariantPicked & {
  featuredAsset: AssetPicked;
  stockLevels: Array<StockLevelKeycrmToVendure>;
  options: Array<ProductOptionKeycrmToVendure>;
};
