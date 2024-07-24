import { GraphQLBoolean, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

export const schemaHello = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "root_query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: (parent, args, context, info) => {
          return `${context.hello} ${parent.name}${args.exclamationMark ? "!" : ""}`;
        },
        args: {
          exclamationMark: { defaultValue: false, type: GraphQLBoolean },
        },
      },
    },
  }),
});
