import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import assert from "node:assert";
import test from "node:test";
import { hiThereSchema } from "./hi-there.js";

test("hi-there", async () => {
  const hiThereSource = `
    query {
      hiThere {
        message
      }
    }
  `;

  const controller = new AbortController();
  try {
    const server = new ApolloServer({
      schema: hiThereSchema,
    });
    const { url } = await startStandaloneServer(server, {
      listen: { signal: controller.signal, port: 8080 },
    });

    const response = await fetch(new URL("/graphql", url).toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({ query: hiThereSource }),
    });

    const result = (await response.json()) as any;

    assert.ifError(result.errors);

    assert.deepEqual(result, { data: { hiThere: { message: "hi there" } } });
  } finally {
    controller.abort();
  }
});
