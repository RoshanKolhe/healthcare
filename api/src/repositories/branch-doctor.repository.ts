import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {BranchDoctor, BranchDoctorRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';


export class BranchDoctorRepository extends TimeStampRepositoryMixin<
  BranchDoctor,
  typeof BranchDoctor.prototype.id,
  Constructor<
    DefaultCrudRepository<BranchDoctor, typeof BranchDoctor.prototype.id, BranchDoctorRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(BranchDoctor, dataSource);
  }
}
