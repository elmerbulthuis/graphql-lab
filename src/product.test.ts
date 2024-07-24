import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { ProductContext, ProductInputModel, ProductModel, productSchema } from "./product.js";

test("product", async () => {
  const createProductSource = `
    mutation ($model: ProductInputModel!) {
      createProduct(model: $model)
    }
  `;
  const getProductSource = `
    query ($key: Int!) {
      getProduct(key: $key) {
        name, description, price
      }
    }
  `;

  const context = new ProductContext();

  {
    const result = await graphql({
      contextValue: context,
      schema: productSchema,
      source: createProductSource,
      variableValues: {
        model: {
          name: "Box",
          description: "lorem ipsum",
          price: 1.0,
        } satisfies ProductInputModel,
      },
    });
    assert.deepEqual(result, { data: { createProduct: 1 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: productSchema,
      source: createProductSource,
      variableValues: {
        model: {
          name: "Triangle",
          description: null,
          price: 2.0,
        } satisfies ProductInputModel,
      },
    });
    assert.deepEqual(result, { data: { createProduct: 2 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: productSchema,
      source: getProductSource,
      variableValues: {
        key: 1,
      },
    });
    assert.deepEqual(result, {
      data: {
        getProduct: { name: "Box", description: "lorem ipsum", price: 1.0 } satisfies ProductModel,
      },
    });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: productSchema,
      source: getProductSource,
      variableValues: {
        key: 2,
      },
    });
    assert.deepEqual(result, {
      data: {
        getProduct: { name: "Triangle", description: null, price: 2.0 } satisfies ProductModel,
      },
    });
  }
});
