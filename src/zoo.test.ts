import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { NewZooModel, ZooContext, ZooModel, zooSchema } from "./zoo.js";

test("zoo", async () => {
  const insertZooSource = `
    mutation ($model: NewZooModel!) {
      insertZoo(model: $model)
    }
  `;
  const getZooSource = `
    query ($key: Int!) {
      getZoo(key: $key) {
        name
      }
    }
  `;

  const context = new ZooContext();

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: insertZooSource,
      variableValues: {
        model: {
          name: "Blijdorp",
        } satisfies NewZooModel,
      },
    });
    assert.deepEqual(result, { data: { insertZoo: 1 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: insertZooSource,
      variableValues: {
        model: {
          name: "Artis",
        } satisfies NewZooModel,
      },
    });
    assert.deepEqual(result, { data: { insertZoo: 2 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: getZooSource,
      variableValues: {
        key: 1,
      },
    });
    assert.deepEqual(result, {
      data: {
        getZoo: { name: "Blijdorp" } satisfies ZooModel,
      },
    });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: getZooSource,
      variableValues: {
        key: 2,
      },
    });
    assert.deepEqual(result, {
      data: {
        getZoo: { name: "Artis" } satisfies ZooModel,
      },
    });
  }
});
