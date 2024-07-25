import "reflect-metadata";
import { buildSchema, Field, ObjectType, Query, Resolver } from "type-graphql";

@ObjectType()
export class HiThereModel {
  constructor(interior?: HiThereModel) {
    Object.assign(this, interior);
  }

  @Field()
  message!: string;
}

@Resolver(HiThereModel)
export class HiThereResolver {
  @Query(() => HiThereModel)
  async hiThere() {
    const model = new HiThereModel({ message: "hi there" });
    return model;
  }
}

export const hiThereSchema = await buildSchema({
  resolvers: [HiThereResolver],
});
