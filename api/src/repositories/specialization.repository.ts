import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Specialization, SpecializationRelations} from '../models';

export class SpecializationRepository extends DefaultCrudRepository<
  Specialization,
  typeof Specialization.prototype.id,
  SpecializationRelations
> {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Specialization, dataSource);
  }
}
