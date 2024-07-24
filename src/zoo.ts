import { GraphQLFloat, GraphQLInt, printSchema } from "graphql";
import "reflect-metadata";
import {
  Arg,
  buildSchema,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  InterfaceType,
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
  constructor(interior?: ZooModel) {
    Object.assign(this, interior);
  }

  @Field(() => GraphQLInt)
  key!: number;

  @Field()
  name!: string;

  @Field(() => [AnimalModel])
  animals!: AnimalModel[];
}

@InterfaceType()
export class AnimalModel {
  constructor(interior?: AnimalModel) {
    Object.assign(this, interior);
  }

  @Field()
  name!: string;
}

@ObjectType({ implements: AnimalModel })
export class LionModel extends AnimalModel {
  constructor(interior?: LionModel) {
    super();

    Object.assign(this, interior);
  }

  @Field(() => GraphQLFloat)
  walkSpeed!: number;

  @Field(() => GraphQLFloat)
  runSpeed!: number;
}

@ObjectType({ implements: AnimalModel })
export class SharkModel extends AnimalModel {
  constructor(interior?: SharkModel) {
    super();

    Object.assign(this, interior);
  }

  @Field(() => GraphQLFloat)
  swimSpeed!: number;
}

//#endregion

//#region write models

@InputType()
export class NewZooModel {
  constructor(interior?: NewZooModel) {
    Object.assign(this, interior);
  }

  @Field()
  name!: string;
}

@InputType()
export class NewAnimalModel {
  constructor(interior?: NewAnimalModel) {
    Object.assign(this, interior);
  }

  @Field()
  name!: string;
}

@InputType()
export class NewLionModel extends NewAnimalModel {
  constructor(interior?: NewLionModel) {
    super();

    Object.assign(this, interior);
  }

  @Field(() => GraphQLFloat)
  walkSpeed!: number;

  @Field(() => GraphQLFloat)
  runSpeed!: number;
}

@InputType()
export class NewSharkModel extends NewAnimalModel {
  constructor(interior?: NewSharkModel) {
    super();

    Object.assign(this, interior);
  }

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

    const model = new ZooModel({
      key: row.key,
      name: row.name,
      animals: [],
    });
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
          const model = new LionModel({
            name: row.name,
            walkSpeed: row.walkSpeed ?? 0,
            runSpeed: row.runSpeed ?? 0,
          });
          return model;
        }

        case "shark": {
          const model = new SharkModel({
            name: row.name,
            swimSpeed: row.swimSpeed ?? 0,
          });
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
        const model = new LionModel({
          name: row.name,
          walkSpeed: row.walkSpeed ?? 0,
          runSpeed: row.runSpeed ?? 0,
        });
        return model;
      }

      case "shark": {
        const model = new SharkModel({
          name: row.name,
          swimSpeed: row.swimSpeed ?? 0,
        });
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

console.log(printSchema(zooSchema));
