import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {User, UserRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export type Credentials = {
  email?: string;
  password: string;
};

export class UserRepository extends TimeStampRepositoryMixin<
  User,
  typeof User.prototype.id,
  Constructor<
    DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(User, dataSource);
  }
}
