import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

const userStore = new Map<number, UserModel>();

export interface UserModel {
  name: string;
  email: string | null;
}

export interface UserContext {
  lastKey: 0;
}

export const UserType = new GraphQLObjectType<any, UserContext>({
  name: "User",
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: GraphQLString,
    },
  },
});

export const UserInputType = new GraphQLInputObjectType({
  name: "UserInput",
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: GraphQLString,
    },
  },
});

export const schemaUser = new GraphQLSchema({
  query: new GraphQLObjectType<any, UserContext>({
    name: "Query",
    fields: {
      user: {
        type: UserType,
        resolve: (parent, args, context, info) => {
          return userStore.get(args.key);
        },
        args: {
          key: { type: new GraphQLNonNull(GraphQLInt) },
        },
      },
    },
  }),
  mutation: new GraphQLObjectType<any, UserContext>({
    name: "Mutation",
    fields: {
      createUser: {
        type: GraphQLInt,
        resolve: (parent, args, context, info) => {
          const userKey = ++context.lastKey;
          userStore.set(userKey, args.user);
          return userKey;
        },
        args: {
          user: { type: new GraphQLNonNull(UserInputType) },
        },
      },
    },
  }),
});
