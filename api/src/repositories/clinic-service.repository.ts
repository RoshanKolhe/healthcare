import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {ClinicService, ClinicServiceRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class ClinicServiceRepository extends TimeStampRepositoryMixin<
  ClinicService,
  typeof ClinicService.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ClinicService,
      typeof ClinicService.prototype.id,
      ClinicServiceRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(ClinicService, dataSource);
  }
}
