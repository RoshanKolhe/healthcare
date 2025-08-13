import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Branch, BranchRelations, Clinic} from '../models';
import { ClinicRepository } from './clinic.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class BranchRepository extends TimeStampRepositoryMixin<
  Branch,
  typeof Branch.prototype.id,
  Constructor<
    DefaultCrudRepository<Branch, typeof Branch.prototype.id, BranchRelations>
  >
>(DefaultCrudRepository) {
  public readonly clinic: BelongsToAccessor<
    Clinic,
    typeof Branch.prototype.id
  >;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('ClinicRepository')
    protected clinicRepositoryGetter: Getter<ClinicRepository>,
  ) {
    super(Branch, dataSource);
    this.clinic = this.createBelongsToAccessorFor(
      'clinic',
      clinicRepositoryGetter,
    );
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
  }
}
