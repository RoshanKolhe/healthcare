import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Doctor, DoctorRelations, Clinic, Branch, Specialization, BranchDoctor} from '../models';
import { ClinicRepository } from './clinic.repository';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {SpecializationRepository} from './specialization.repository';
import {BranchDoctorRepository} from './branch-doctor.repository';

export class DoctorRepository extends TimeStampRepositoryMixin<
  Doctor,
  typeof Doctor.prototype.id,
  Constructor<
    DefaultCrudRepository<Doctor, typeof Doctor.prototype.id, DoctorRelations>
  >
>(DefaultCrudRepository) {
  public readonly clinic: BelongsToAccessor<
    Clinic,
    typeof Doctor.prototype.id
  >;


  public readonly specialization: BelongsToAccessor<Specialization, typeof Doctor.prototype.id>;

  public readonly branches: HasManyThroughRepositoryFactory<Branch, typeof Branch.prototype.id,
          BranchDoctor,
          typeof Doctor.prototype.id
        >;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('ClinicRepository')
    protected clinicRepositoryGetter: Getter<ClinicRepository>,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('SpecializationRepository') protected specializationRepositoryGetter: Getter<SpecializationRepository>, @repository.getter('BranchDoctorRepository') protected branchDoctorRepositoryGetter: Getter<BranchDoctorRepository>,
  ) {
    super(Doctor, dataSource);
    this.branches = this.createHasManyThroughRepositoryFactoryFor('branches', branchRepositoryGetter, branchDoctorRepositoryGetter,);
    this.registerInclusionResolver('branches', this.branches.inclusionResolver);
    this.specialization = this.createBelongsToAccessorFor('specialization', specializationRepositoryGetter,);
    this.registerInclusionResolver('specialization', this.specialization.inclusionResolver);
    this.clinic = this.createBelongsToAccessorFor(
      'clinic',
      clinicRepositoryGetter,
    );
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
  }
}
