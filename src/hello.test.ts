import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { schemaHello } from "./hello.js";

test("schema", async () => {
  const source = "{ hello }";
  const result = await graphql({ schema: schemaHello, source, contextValue: { hello: "hello1" } });
  assert.deepEqual(result, { data: { hello: "hello1" } });
});
