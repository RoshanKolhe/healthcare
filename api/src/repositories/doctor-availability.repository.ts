import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {DoctorAvailability, DoctorAvailabilityRelations, BranchDoctor, Clinic, DoctorTimeSlot} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {BranchDoctorRepository} from './branch-doctor.repository';
import {ClinicRepository} from './clinic.repository';
import {DoctorTimeSlotRepository} from './doctor-time-slot.repository';

export class DoctorAvailabilityRepository extends TimeStampRepositoryMixin<
  DoctorAvailability,
  typeof DoctorAvailability.prototype.id,
  Constructor<
    DefaultCrudRepository<DoctorAvailability, typeof DoctorAvailability.prototype.id, DoctorAvailabilityRelations>
  >
>(DefaultCrudRepository) {

  public readonly branchDoctor: BelongsToAccessor<BranchDoctor, typeof DoctorAvailability.prototype.id>;

  public readonly clinic: BelongsToAccessor<Clinic, typeof DoctorAvailability.prototype.id>;

  public readonly doctorTimeSlots: HasManyRepositoryFactory<DoctorTimeSlot, typeof DoctorAvailability.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('BranchDoctorRepository') protected branchDoctorRepositoryGetter: Getter<BranchDoctorRepository>, @repository.getter('ClinicRepository') protected clinicRepositoryGetter: Getter<ClinicRepository>, @repository.getter('DoctorTimeSlotRepository') protected doctorTimeSlotRepositoryGetter: Getter<DoctorTimeSlotRepository>,
  ) {
    super(DoctorAvailability, dataSource);
    this.doctorTimeSlots = this.createHasManyRepositoryFactoryFor('doctorTimeSlots', doctorTimeSlotRepositoryGetter,);
    this.registerInclusionResolver('doctorTimeSlots', this.doctorTimeSlots.inclusionResolver);
    this.clinic = this.createBelongsToAccessorFor('clinic', clinicRepositoryGetter,);
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
    this.branchDoctor = this.createBelongsToAccessorFor('branchDoctor', branchDoctorRepositoryGetter,);
    this.registerInclusionResolver('branchDoctor', this.branchDoctor.inclusionResolver);
  }
}
