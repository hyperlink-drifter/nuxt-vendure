// types.ts

// Note: we are using a deep import here, rather than importing from `@vendure/core` due to
// a possible bug in TypeScript (https://github.com/microsoft/TypeScript/issues/46617) which
// causes issues when multiple plugins extend the same custom fields interface.
import { Asset, ID, Translation, VendureEntity } from '@vendure/core';
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
    keycrm: ProductKeycrmToVendure;
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

export type ProductKeycrmToVendure = {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  featuredAsset: Partial<Asset>;
  assets: Partial<Asset>[];
  translations: Array<Translation<VendureEntity>>;
};
