import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const shopApiExtensions: DocumentNode = gql`
  extend type Query {
    keycrmProduct(id: ID): KeycrmProduct
  }
`;
