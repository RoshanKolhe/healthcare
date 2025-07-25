import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Hospital, HospitalRelations} from '../models';

export class HospitalRepository extends DefaultCrudRepository<
  Hospital,
  typeof Hospital.prototype.id,
  HospitalRelations
> {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Hospital, dataSource);
  }
}
