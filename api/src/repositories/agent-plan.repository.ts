import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {AgentPlan, AgentPlanRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class AgentPlanRepository extends TimeStampRepositoryMixin<
  AgentPlan,
  typeof AgentPlan.prototype.id,
  Constructor<
    DefaultCrudRepository<
      AgentPlan,
      typeof AgentPlan.prototype.id,
      AgentPlanRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(AgentPlan, dataSource);
  }
}
