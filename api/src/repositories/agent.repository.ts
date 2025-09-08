import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Agent, AgentRelations} from '../models';
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
