import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { schemaUser, UserContext, UserModel } from "./user.js";

test("user", async () => {
  const createUserSource = `
    mutation ($input: UserInput!) {
      createUser(user: $input)
    }
  `;
  const getUserSource = `
    query ($key: Int!) {
      user(key: $key) {
        name, email
      }
    }
  `;

  const context: UserContext = {
    lastKey: 0,
  };

  {
    const result = await graphql({
      contextValue: context,
      schema: schemaUser,
      source: createUserSource,
      variableValues: {
        input: {
          name: "Elmer",
          email: "elmer@luvdasun.com",
        } satisfies UserModel,
      },
    });
    assert.deepEqual(result, { data: { createUser: 1 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: schemaUser,
      source: createUserSource,
      variableValues: {
        input: {
          name: "Gijs",
          email: null,
        } satisfies UserModel,
      },
    });
    assert.deepEqual(result, { data: { createUser: 2 } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: schemaUser,
      source: getUserSource,
      variableValues: {
        key: 1,
      },
    });
    assert.deepEqual(result, { data: { user: { name: "Elmer", email: "elmer@luvdasun.com" } } });
  }

  {
    const result = await graphql({
      contextValue: context,
      schema: schemaUser,
      source: getUserSource,
      variableValues: {
        key: 2,
      },
    });
    assert.deepEqual(result, { data: { user: { name: "Gijs", email: null } } });
  }
});
