import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {HospitalService, HospitalServiceRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class HospitalServiceRepository extends TimeStampRepositoryMixin<
  HospitalService,
  typeof HospitalService.prototype.id,
  Constructor<
    DefaultCrudRepository<
      HospitalService,
      typeof HospitalService.prototype.id,
      HospitalServiceRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(HospitalService, dataSource);
  }
}
