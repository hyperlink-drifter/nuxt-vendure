import { gql } from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const shopApiExtensions: DocumentNode = gql`
  type ProductKeycrmToVendure {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    slug: String
    description: String
    enabled: Boolean!
    featuredAsset: Asset
    assets: [Asset]
  }

  extend type Product {
    keycrm: ProductKeycrmToVendure!
  }
`;
