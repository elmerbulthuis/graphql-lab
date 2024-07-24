import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { schemaHello } from "./hello.js";

test("schema", async () => {
  const source = "{ hello(exclamationMark: true) }";
  const result = await graphql({
    schema: schemaHello,
    source,
    contextValue: { hello: "hello" },
    rootValue: { name: "world" },
  });
  assert.deepEqual(result, { data: { hello: "hello world!" } });
});
