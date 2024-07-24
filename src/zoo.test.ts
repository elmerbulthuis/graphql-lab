import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import {
  NewLionModel,
  NewSharkModel,
  NewZooModel,
  ZooContext,
  ZooModel,
  zooSchema,
} from "./zoo.js";

test("zoo", async () => {
  const getZooSource = `
    query ($key: Int!) {
      getZoo(key: $key) {
        name
        animals {
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
      source: insertLionSource,
      variableValues: {
        zooKey: 1,
        model: {
          name: "Simba",
          walkSpeed: 1.0,
          runSpeed: 2.0,
        } satisfies NewLionModel,
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
        model: {
          name: "Jaws",
          swimSpeed: 0.5,
        } satisfies NewSharkModel,
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
              name: "Simba",
            },
          ],
        } satisfies ZooModel,
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
              name: "Jaws",
            },
          ],
        } satisfies ZooModel,
      },
    });
  }
});
