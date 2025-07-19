import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export type Credentials = {
  email?: string;
  password: string;
};

export class UsersRepository extends TimeStampRepositoryMixin<
  Users,
  typeof Users.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Users,
      typeof Users.prototype.id,
      UsersRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.healthcare') dataSource: HealthcareDataSource) {
    super(Users, dataSource);
  }
}

