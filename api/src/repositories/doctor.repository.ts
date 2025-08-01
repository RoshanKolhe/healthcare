import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Doctor, DoctorRelations, Hospital, Branch} from '../models';
import {HospitalRepository} from './hospital.repository';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class DoctorRepository extends TimeStampRepositoryMixin<
  Doctor,
  typeof Doctor.prototype.id,
  Constructor<
    DefaultCrudRepository<Doctor, typeof Doctor.prototype.id, DoctorRelations>
  >
>(DefaultCrudRepository) {
  public readonly hospital: BelongsToAccessor<
    Hospital,
    typeof Doctor.prototype.id
  >;

  public readonly branch: BelongsToAccessor<Branch, typeof Doctor.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('HospitalRepository')
    protected hospitalRepositoryGetter: Getter<HospitalRepository>,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>,
  ) {
    super(Doctor, dataSource);
    this.branch = this.createBelongsToAccessorFor(
      'branch',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
    this.hospital = this.createBelongsToAccessorFor(
      'hospital',
      hospitalRepositoryGetter,
    );
    this.registerInclusionResolver('hospital', this.hospital.inclusionResolver);
  }
}
