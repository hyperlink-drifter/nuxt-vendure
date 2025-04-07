import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const shopApiExtensions: DocumentNode = gql`
  type KeycrmCategory {
    id: ID
    name: String
    parent_id: ID
  }

  type KeycrmCategoryList {
    total: Int!
    current_page: Int!
    per_page: Int!
    data: [KeycrmCategory!]!
  }

  input KeycrmCategoryListOptionsFilterParameter {
    category_id: String
    parent_id: String
  }

  input KeycrmCategoryListOptions {
    """
    Maximum number of items in a paginated list. Maximum 50.
    """
    limit: Int
    """
    Specify the page
    """
    page: Int
    """
    Allows the results to be filtered
    """
    filter: KeycrmCategoryListOptionsFilterParameter
  }

  type KeycrmProductList {
    total: Int!
    current_page: Int!
    per_page: Int!
    data: [KeycrmProduct!]!
  }

  input KeycrmProductListOptionsFilterParameter {
    product_id: String
    category_id: String
    is_archived: Boolean
  }

  input KeycrmProductListOptions {
    """
    Maximum number of items in a paginated list. Maximum 50.
    """
    limit: Int
    """
    Specify the page
    """
    page: Int
    """
    Allows the results to be filtered
    """
    filter: KeycrmProductListOptionsFilterParameter
  }

  type KeycrmOfferPropertyAgg {
    name: String
    values: [String]
  }

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
    keycrmProducts(options: KeycrmProductListOptions): KeycrmProductList
    keycrmProduct(id: ID!): KeycrmProduct
    keycrmProductOffer(id: ID!): KeycrmProductOffer
    keycrmCategories(options: KeycrmCategoryListOptions): KeycrmCategoryList
  }
`;
