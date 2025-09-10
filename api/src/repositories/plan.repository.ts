import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Plan, PlanRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class PlanRepository extends TimeStampRepositoryMixin<
  Plan,
  typeof Plan.prototype.id,
  Constructor<
    DefaultCrudRepository<Plan, typeof Plan.prototype.id, PlanRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Plan, dataSource);
  }
}
