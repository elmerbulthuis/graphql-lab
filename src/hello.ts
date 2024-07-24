import {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

export const schemaHello = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (parent, args, context, info) => {
          return `${context.hello} ${parent.name}${args.exclamationMark ? "!" : ""}`;
        },
        args: {
          exclamationMark: { defaultValue: false, type: new GraphQLNonNull(GraphQLBoolean) },
        },
      },
    },
  }),
});
