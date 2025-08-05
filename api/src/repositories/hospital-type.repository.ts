import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {HospitalType, HospitalTypeRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class HospitalTypeRepository extends TimeStampRepositoryMixin<
  HospitalType,
  typeof HospitalType.prototype.id,
  Constructor<
    DefaultCrudRepository<HospitalType, typeof HospitalType.prototype.id, HospitalTypeRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(HospitalType, dataSource);
  }
}
