import { GraphQLFloat, GraphQLInt } from "graphql";
import "reflect-metadata";
import {
  Arg,
  buildSchema,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";

//#region context

export class ZooContext {
  private lastKey = 0;
  private readonly zooTable = new Array<ZooRow>();
  private readonly animalTable = new Array<AnimalRow>();

  public nextKey() {
    const key = ++this.lastKey;
    return key;
  }

  public getZooRow(key: number) {
    return this.zooTable.find((row) => row.key === key);
  }

  public getAnimalRow(key: number) {
    return this.animalTable.find((row) => row.key === key);
  }

  public getAnimalRowsByZoo(zooKey: number) {
    return this.animalTable.filter((model) => model.zooKey === zooKey);
  }

  public insertZooRow(row: ZooRow) {
    this.zooTable.push(row);
  }

  public insertAnimalRow(row: AnimalRow) {
    this.animalTable.push(row);
  }
}

interface ZooRow {
  key: number;
  name: string;
}

interface AnimalRow {
  zooKey: number;
  key: number;
  name: string;
  type: "lion" | "shark";
  walkSpeed?: number;
  runSpeed?: number;
  swimSpeed?: number;
}

//#endregion

//#region read models

@ObjectType()
export class ZooModel {
  @Field(() => GraphQLInt)
  key!: number;

  @Field()
  name!: string;

  @Field(() => [AnimalModel])
  animals!: AnimalModel[];
}

@ObjectType()
export class AnimalModel {
  @Field()
  name!: string;
}

@ObjectType()
export class LionModel extends AnimalModel {
  @Field(() => GraphQLFloat)
  walkSpeed!: number;

  @Field(() => GraphQLFloat)
  runSpeed!: number;
}

@ObjectType()
export class SharkModel extends AnimalModel {
  @Field(() => GraphQLFloat)
  swimSpeed!: number;
}

//#endregion

//#region write models

@InputType()
export class NewZooModel {
  @Field()
  name!: string;
}

@InputType()
export class NewAnimalModel {
  @Field()
  name!: string;
}

@InputType()
export class NewLionModel extends NewAnimalModel {
  @Field(() => GraphQLFloat)
  walkSpeed!: number;

  @Field(() => GraphQLFloat)
  runSpeed!: number;
}

@InputType()
export class NewSharkModel extends NewAnimalModel {
  @Field(() => GraphQLFloat)
  swimSpeed!: number;
}

//#endregion

//#region resolvers

@Resolver(() => ZooModel)
class ZooResolver {
  @Query(() => ZooModel)
  getZoo(@Ctx() context: ZooContext, @Arg("key", () => GraphQLInt) key: number): ZooModel | null {
    const row = context.getZooRow(key);
    if (row == null) {
      return null;
    }

    const model = {
      key: row.key,
      name: row.name,
      animals: [],
    } satisfies ZooModel;
    return model;
  }

  @Mutation(() => GraphQLInt)
  async insertZoo(@Ctx() context: ZooContext, @Arg("model") model: NewZooModel): Promise<number> {
    const key = context.nextKey();
    const row = {
      key,
      name: model.name,
    } satisfies ZooRow;
    context.insertZooRow(row);
    return key;
  }

  @FieldResolver()
  async animals(@Ctx() context: ZooContext, @Root() parent: ZooModel): Promise<AnimalModel[]> {
    const animalRows = context.getAnimalRowsByZoo(parent.key);
    const animalModels = animalRows.map((row) => {
      switch (row.type) {
        case "lion": {
          const model = {
            name: row.name,
            walkSpeed: row.walkSpeed ?? 0,
            runSpeed: row.runSpeed ?? 0,
          } satisfies LionModel;
          return model;
        }

        case "shark": {
          const model = {
            name: row.name,
            swimSpeed: row.swimSpeed ?? 0,
          } satisfies SharkModel;
          return model;
        }
      }
    });
    return animalModels;
  }
}

@Resolver()
class AnimalResolver {
  @Query(() => AnimalModel)
  getAnimal(
    @Ctx() context: ZooContext,
    @Arg("key", () => GraphQLInt) key: number,
  ): AnimalModel | null {
    const row = context.getAnimalRow(key);
    if (row == null) {
      return null;
    }

    switch (row.type) {
      case "lion": {
        const model = {
          name: row.name,
          walkSpeed: row.walkSpeed ?? 0,
          runSpeed: row.runSpeed ?? 0,
        } satisfies LionModel;
        return model;
      }

      case "shark": {
        const model = {
          name: row.name,
          swimSpeed: row.swimSpeed ?? 0,
        } satisfies SharkModel;
        return model;
      }
    }
  }
}

@Resolver()
class LionResolver {
  @Mutation(() => GraphQLInt)
  async insertLion(
    @Ctx() context: ZooContext,
    @Arg("zooKey", () => GraphQLInt) zooKey: number,
    @Arg("model") model: NewLionModel,
  ): Promise<number> {
    const key = context.nextKey();
    const row = {
      type: "lion",
      zooKey,
      key,
      name: model.name,
      walkSpeed: model.walkSpeed,
      runSpeed: model.runSpeed,
    } satisfies AnimalRow;
    context.insertAnimalRow(row);
    return key;
  }
}

@Resolver()
class SharkResolver {
  @Mutation(() => GraphQLInt)
  async insertShark(
    @Ctx() context: ZooContext,
    @Arg("zooKey", () => GraphQLInt) zooKey: number,
    @Arg("model") model: NewSharkModel,
  ): Promise<number> {
    const key = context.nextKey();
    const row = {
      type: "shark",
      zooKey,
      key,
      name: model.name,
      swimSpeed: model.swimSpeed,
    } satisfies AnimalRow;
    context.insertAnimalRow(row);
    return key;
  }
}

//#endregion

export const zooSchema = await buildSchema({
  resolvers: [ZooResolver, AnimalResolver, LionResolver, SharkResolver],
});
