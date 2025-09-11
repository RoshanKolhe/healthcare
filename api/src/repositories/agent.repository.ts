import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Agent, AgentRelations, AgentPlan} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class AgentRepository extends TimeStampRepositoryMixin<
  Agent,
  typeof Agent.prototype.id,
  Constructor<
    DefaultCrudRepository<Agent, typeof Agent.prototype.id, AgentRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Agent, dataSource);
  }
}
