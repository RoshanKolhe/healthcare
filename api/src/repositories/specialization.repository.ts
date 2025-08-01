import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Specialization, SpecializationRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class SpecializationRepository extends TimeStampRepositoryMixin<
  Specialization,
  typeof Specialization.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Specialization,
      typeof Specialization.prototype.id,
      SpecializationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(Specialization, dataSource);
  }
}
