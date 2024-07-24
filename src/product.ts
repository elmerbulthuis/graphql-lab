import { GraphQLFloat, GraphQLInt, GraphQLString } from "graphql";
import "reflect-metadata";
import {
  Arg,
  buildSchema,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

// const productSchema = buildSchema(
//   `
//     type Product {
//       name: String!
//       description: String
//       price: Float!
//     }

//     type Mutation {
//       createProduct(input: Product!): Int
//     }

//     type Query {
//       getProduct(input: Int!): Product
//     }
//   `,
// );

export class ProductContext {
  private lastKey = 0;
  private readonly store = new Map<number, ProductModel>();

  public get(key: number) {
    return this.store.get(key);
  }

  public insert(model: ProductModel): number {
    const key = ++this.lastKey;
    this.store.set(key, model);
    return key;
  }
}

@ObjectType()
export class ProductModel {
  @Field()
  name!: string;

  @Field(() => GraphQLString, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLFloat)
  price!: number;
}

@InputType()
export class ProductInputModel {
  @Field()
  name!: string;

  @Field(() => GraphQLString, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLFloat)
  price!: number;
}

@Resolver(ProductModel)
export class ProductResolver {
  @Query(() => ProductModel)
  async getProduct(@Ctx() context: ProductContext, @Arg("key", () => GraphQLInt) key: number) {
    const model = context.get(key);
    return model;
  }

  @Mutation(() => GraphQLInt)
  async createProduct(
    @Ctx() context: ProductContext,
    @Arg("model") model: ProductInputModel,
  ): Promise<number> {
    const key = context.insert(model);
    return key;
  }
}

export const productSchema = await buildSchema({
  resolvers: [ProductResolver],
});
