import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {ClinicType, ClinicTypeRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class ClinicTypeRepository extends TimeStampRepositoryMixin<
  ClinicType,
  typeof ClinicType.prototype.id,
  Constructor<
    DefaultCrudRepository<ClinicType, typeof ClinicType.prototype.id, ClinicTypeRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(ClinicType, dataSource);
  }
}
