// types.ts

// Note: we are using a deep import here, rather than importing from `@vendure/core` due to
// a possible bug in TypeScript (https://github.com/microsoft/TypeScript/issues/46617) which
// causes issues when multiple plugins extend the same custom fields interface.
import {
  CustomProductFields,
  CustomProductVariantFields,
} from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
  interface CustomProductFields {
    keycrm: {
      id: number;
      created_at: Date;
      updated_at: Date;
    };
  }

  interface CustomProductVariantFields {
    keycrm: {
      id: number;
      product_id: number;
      created_at: Date;
      updated_at: Date;
    };
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

export type ProductListKeycrm = {
  total: number;
  current_page: number;
  per_page: number;
  items: Array<ProductKeycrm>;
};
