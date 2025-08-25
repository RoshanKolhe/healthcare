import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {DoctorAvailability, DoctorAvailabilityRelations, BranchDoctor, Clinic, DoctorTimeSlot, Branch, Doctor} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {BranchDoctorRepository} from './branch-doctor.repository';
import {ClinicRepository} from './clinic.repository';
import {DoctorTimeSlotRepository} from './doctor-time-slot.repository';
import {BranchRepository} from './branch.repository';
import {DoctorRepository} from './doctor.repository';

export class DoctorAvailabilityRepository extends TimeStampRepositoryMixin<
  DoctorAvailability,
  typeof DoctorAvailability.prototype.id,
  Constructor<
    DefaultCrudRepository<DoctorAvailability, typeof DoctorAvailability.prototype.id, DoctorAvailabilityRelations>
  >
>(DefaultCrudRepository) {

  public readonly doctorTimeSlots: HasManyRepositoryFactory<DoctorTimeSlot, typeof DoctorAvailability.prototype.id>;

  public readonly branch: BelongsToAccessor<Branch, typeof DoctorAvailability.prototype.id>;

  public readonly doctor: BelongsToAccessor<Doctor, typeof DoctorAvailability.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('BranchDoctorRepository') protected branchDoctorRepositoryGetter: Getter<BranchDoctorRepository>, @repository.getter('ClinicRepository') protected clinicRepositoryGetter: Getter<ClinicRepository>, @repository.getter('DoctorTimeSlotRepository') protected doctorTimeSlotRepositoryGetter: Getter<DoctorTimeSlotRepository>, @repository.getter('BranchRepository') protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('DoctorRepository') protected doctorRepositoryGetter: Getter<DoctorRepository>,
  ) {
    super(DoctorAvailability, dataSource);
    this.doctor = this.createBelongsToAccessorFor('doctor', doctorRepositoryGetter,);
    this.registerInclusionResolver('doctor', this.doctor.inclusionResolver);
    this.branch = this.createBelongsToAccessorFor('branch', branchRepositoryGetter,);
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
    this.doctorTimeSlots = this.createHasManyRepositoryFactoryFor('doctorTimeSlots', doctorTimeSlotRepositoryGetter,);
    this.registerInclusionResolver('doctorTimeSlots', this.doctorTimeSlots.inclusionResolver);
  }
}
