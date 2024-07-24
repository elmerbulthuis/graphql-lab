import { buildSchema } from "graphql";

const productSchema = buildSchema(
  `
    type Product {
      name: String!
      description: String
      price: Float!
    }
    
    type Mutation {
      createProduct(input: Product!): Int
    }
    
    type Query {
      getProduct(input: Int!): Product
    }
  `,
);
