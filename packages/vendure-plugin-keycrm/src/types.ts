// types.ts

// Note: we are using a deep import here, rather than importing from `@vendure/core` due to
// a possible bug in TypeScript (https://github.com/microsoft/TypeScript/issues/46617) which
// causes issues when multiple plugins extend the same custom fields interface.
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
    keycrm: (Product & Pick<ProductKeycrm, 'has_offers'>) | undefined;
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
  baseURL: string;
}

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

export type ProductOfferKeycrm = ProductKeycrm & {
  properties_agg?: Record<string, string[]>;
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
