import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {ReferalManagement, ReferalManagementRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class ReferalManagementRepository extends TimeStampRepositoryMixin<
  ReferalManagement,
  typeof ReferalManagement.prototype.id,
  Constructor<
    DefaultCrudRepository<ReferalManagement, typeof ReferalManagement.prototype.id, ReferalManagementRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(ReferalManagement, dataSource);
  }
}
