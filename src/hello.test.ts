import { graphql } from "graphql";
import assert from "node:assert";
import test from "node:test";
import { schemaHello } from "./hello.js";

test("schema", async () => {
  const source = "{ hello }";
  const result = await graphql({ schema: schemaHello, source });
  assert.deepEqual(result, { data: { hello: "hello" } });
});
