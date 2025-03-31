import { gql } from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const shopApiExtensions: DocumentNode = gql`
  type KeycrmProduct {
    id: Int!
    name: String!
  }

  extend type Product {
    keycrm: KeycrmProduct!
  }
`;
