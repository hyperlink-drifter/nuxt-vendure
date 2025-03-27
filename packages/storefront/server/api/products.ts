import { print } from 'graphql';
import { gql } from 'graphql-tag';

export default defineEventHandler(() => {
  const products = gql`
    query products {
      products {
        totalItems
        items {
          id
          name
        }
      }
    }
  `;

  const serializedQuery = print(products);

  return $fetch('http://localhost:3010/shop-api', {
    method: 'POST',
    body: { query: serializedQuery },
  });
});
