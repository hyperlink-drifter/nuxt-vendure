import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const shopApiExtensions: DocumentNode = gql`
  type KeycrmOfferProperty {
    name: String
    value: String
  }

  type KeycrmOffer {
    id: ID!
    product_id: ID!
    sku: String
    barcode: String
    thumbnail_url: String
    price: Float
    quantity: Int
    weight: Float
    length: Float
    width: Float
    height: Float
    properties: [KeycrmOfferProperty]
  }

  type KeycrmProductOffer implements Node {
    id: ID!
    name: String!
    description: String
    thumbnail_url: String
    attachments_data: [String]
    quantity: Int
    unit_type: String
    currency_code: String
    sku: String
    min_price: Float
    max_price: Float
    weight: Float
    length: Float
    width: Float
    height: Float
    has_offers: Boolean
    is_archived: Boolean
    category_id: ID
    created_at: DateTime!
    updated_at: DateTime!
    offers: [KeycrmOffer]
    properties_agg: [KeycrmOfferPropertyAgg]
  }

  type KeycrmProduct implements Node {
    id: ID!
    name: String!
    description: String
    thumbnail_url: String
    attachments_data: [String]
    quantity: Int
    unit_type: String
    currency_code: String
    sku: String
    min_price: Float
    max_price: Float
    weight: Float
    length: Float
    width: Float
    height: Float
    has_offers: Boolean
    is_archived: Boolean
    category_id: ID
    created_at: DateTime!
    updated_at: DateTime!
  }

  extend type Query {
    keycrmProduct(id: ID): KeycrmProduct
    keycrmProductOffer(id: ID): KeycrmProductOffer
  }
`;
