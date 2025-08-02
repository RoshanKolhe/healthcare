import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Doctor, DoctorRelations, Hospital, Branch, Specialization} from '../models';
import {HospitalRepository} from './hospital.repository';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {SpecializationRepository} from './specialization.repository';

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

  public readonly specialization: BelongsToAccessor<Specialization, typeof Doctor.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('HospitalRepository')
    protected hospitalRepositoryGetter: Getter<HospitalRepository>,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('SpecializationRepository') protected specializationRepositoryGetter: Getter<SpecializationRepository>,
  ) {
    super(Doctor, dataSource);
    this.specialization = this.createBelongsToAccessorFor('specialization', specializationRepositoryGetter,);
    this.registerInclusionResolver('specialization', this.specialization.inclusionResolver);
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
