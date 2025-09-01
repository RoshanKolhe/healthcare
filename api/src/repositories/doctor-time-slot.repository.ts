import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import { DoctorTimeSlot, DoctorTimeSlotRelations, DoctorAvailability, PatientBooking} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {DoctorAvailabilityRepository} from './doctor-availability.repository';
import {PatientBookingRepository} from './patient-booking.repository';

export class DoctorTimeSlotRepository extends TimeStampRepositoryMixin<
  DoctorTimeSlot,
  typeof DoctorTimeSlot.prototype.id,
  Constructor<
    DefaultCrudRepository<DoctorTimeSlot, typeof DoctorTimeSlot.prototype.id, DoctorTimeSlotRelations>
  >
>(DefaultCrudRepository) {

  public readonly doctorAvailability: BelongsToAccessor<DoctorAvailability, typeof DoctorTimeSlot.prototype.id>;

  public readonly patientBooking: HasOneRepositoryFactory<PatientBooking, typeof DoctorTimeSlot.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('DoctorAvailabilityRepository') protected doctorAvailabilityRepositoryGetter: Getter<DoctorAvailabilityRepository>, @repository.getter('PatientBookingRepository') protected patientBookingRepositoryGetter: Getter<PatientBookingRepository>,
  ) {
    super(DoctorTimeSlot, dataSource);
    this.patientBooking = this.createHasOneRepositoryFactoryFor('patientBooking', patientBookingRepositoryGetter);
    this.registerInclusionResolver('patientBooking', this.patientBooking.inclusionResolver);
    this.doctorAvailability = this.createBelongsToAccessorFor('doctorAvailability', doctorAvailabilityRepositoryGetter,);
    this.registerInclusionResolver('doctorAvailability', this.doctorAvailability.inclusionResolver);
  }
}
