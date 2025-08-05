import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class CategoryRepository extends TimeStampRepositoryMixin<
  Category,
  typeof Category.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Category,
      typeof Category.prototype.id,
      CategoryRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Category, dataSource);
  }
}
