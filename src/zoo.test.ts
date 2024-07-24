import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { NewLionModel, NewSharkModel, NewZooModel, ZooContext, zooSchema } from "./zoo.js";

test("zoo", async () => {
  const getZooSource = `
    query ($key: Int!) {
      getZoo(key: $key) {
        name
        animals {
          __typename
          name
        }
      }
    }
  `;

  const insertZooSource = `
    mutation ($model: NewZooModel!) {
      insertZoo(model: $model)
    }
  `;
  const insertLionSource = `
    mutation ($zooKey: Int!, $model: NewLionModel!) {
      insertLion(zooKey: $zooKey, model: $model)
    }
  `;
  const insertSharkSource = `
    mutation ($zooKey: Int!, $model: NewSharkModel!) {
      insertShark(zooKey: $zooKey, model: $model)
    }
  `;

  const context = new ZooContext();

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: insertZooSource,
      variableValues: {
        model: new NewZooModel({
          name: "Blijdorp",
        }),
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
        model: new NewZooModel({
          name: "Artis",
        }),
      },
    });
    assert.deepEqual(result, { data: { insertZoo: 2 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: insertLionSource,
      variableValues: {
        zooKey: 1,
        model: new NewLionModel({
          name: "Simba",
          walkSpeed: 1.0,
          runSpeed: 2.0,
        }),
      },
    });
    assert.deepEqual(result, { data: { insertLion: 3 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: zooSchema,
      source: insertSharkSource,
      variableValues: {
        zooKey: 2,
        model: new NewSharkModel({
          name: "Jaws",
          swimSpeed: 0.5,
        }),
      },
    });
    assert.deepEqual(result, { data: { insertShark: 4 } });
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
        getZoo: {
          name: "Blijdorp",
          animals: [
            {
              __typename: "LionModel",
              name: "Simba",
            },
          ],
        },
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
        getZoo: {
          name: "Artis",
          animals: [
            {
              __typename: "SharkModel",
              name: "Jaws",
            },
          ],
        },
      },
    });
  }
});
