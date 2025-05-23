import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class MysqldbRepository<Entity> {
  constructor(public repository: Repository<Entity>) {}

  async create(entityLike: DeepPartial<Entity>): Promise<Entity> {
    return await this.repository.create(entityLike);
  }

  async withTnx(
    runInTransaction: (manager: EntityManager) => any,
  ): Promise<any> {
    const manager = this.repository.manager;

    return await manager.transaction(runInTransaction);
  }

  async findById(
    id: string,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const result = await this.repository.findOne({
      ...options,
      where: { id } as any,
    });

    return result;
  }

  async findOne(
    where: FindOptionsWhere<Entity>,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const result = await this.repository.findOne({
      ...options,
      where,
    });

    return result;
  }

  async find(
    where?: FindOptionsWhere<Entity>,
    options?: FindManyOptions<Entity>,
  ): Promise<Entity[]> {
    const results = await this.repository.find({
      ...options,
      where,
    });

    return results;
  }

  async findWithTnx(
    entityManager: EntityManager,
    options: FindManyOptions<Entity>,
  ): Promise<Entity[]> {
    const results = await entityManager.find(this.repository.target, options);

    return results;
  }

  async findAndCount(
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    options?: FindManyOptions<Entity>,
  ): Promise<[Entity[], number]> {
    const results = await this.repository.findAndCount({
      ...options,
      where,
    });

    return results;
  }

  async count(
    where?: FindOptionsWhere<Entity>,
    options?: FindManyOptions<Entity>,
  ): Promise<number> {
    const result = await this.repository.count({
      ...options,
      where,
    });

    return result;
  }

  async save(
    entity: DeepPartial<Entity> | DeepPartial<Entity>[],
  ): Promise<DeepPartial<Entity>[]> {
    let result;
    if (Array.isArray(entity)) {
      result = await this.repository.save(entity);
    } else {
      result = await this.repository.save([entity]);
    }

    return result;
  }

  async saveWithTnx(
    entityManager: EntityManager,
    entity: DeepPartial<Entity>,
  ): Promise<DeepPartial<Entity>> {
    const result = await entityManager.save(this.repository.target, entity);

    return result;
  }

  async saveMultipleWithTnx(
    entityManager: EntityManager,
    entity: DeepPartial<Entity>[],
  ): Promise<DeepPartial<Entity>[]> {
    const result = await entityManager.save(this.repository.target, entity);

    return result;
  }

  async insert(
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ): Promise<InsertResult> {
    const result = await this.repository.insert(entity);

    return result;
  }

  async insertIgnore(
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ) {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .values(entity)
      .orIgnore()
      .execute();

    return result;
  }

  async insertWithTnx(
    entityManager: EntityManager,
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ): Promise<InsertResult> {
    const result = await entityManager.insert(this.repository.target, entity);

    return result;
  }

  async update(
    where: FindOptionsWhere<Entity>,
    update: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    const result = await this.repository.update(where, update as any);

    return result;
  }

  async updateWithTnx(
    entityManager: EntityManager,
    where: FindOptionsWhere<Entity>,
    update: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    const result = await entityManager.update(
      this.repository.target,
      where,
      update,
    );

    return result;
  }

  async updateAndReturn(
    where: FindOptionsWhere<Entity>,
    update: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity> {
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ ...update })
      .where(where)
      .execute()
      .then((response) => {
        return <Entity>response.generatedMaps;
      });

    return result;
  }

  async delete(where: FindOptionsWhere<Entity>): Promise<DeleteResult> {
    const result = await this.repository.softDelete(where);

    return result;
  }

  async hardDelete(where: FindOptionsWhere<Entity>): Promise<DeleteResult> {
    const result = await this.repository.delete(where);

    return result;
  }
}

export type TMysqldbRepository = typeof MysqldbRepository;
