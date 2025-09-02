import {inject, Getter, Constructor} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {PatientBookingHistory, PatientBookingHistoryRelations, PatientBooking, DoctorTimeSlot} from '../models';
import {PatientBookingRepository} from './patient-booking.repository';
import {DoctorTimeSlotRepository} from './doctor-time-slot.repository';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class PatientBookingHistoryRepository extends TimeStampRepositoryMixin<
  PatientBookingHistory,
  typeof PatientBookingHistory.prototype.id,
  Constructor<
    DefaultCrudRepository<PatientBookingHistory, typeof PatientBookingHistory.prototype.id, PatientBookingHistoryRelations>
  >
>(DefaultCrudRepository) {

  public readonly patientBooking: BelongsToAccessor<PatientBooking, typeof PatientBookingHistory.prototype.id>;

  public readonly doctorTimeSlot: BelongsToAccessor<DoctorTimeSlot, typeof PatientBookingHistory.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientBookingRepository') protected patientBookingRepositoryGetter: Getter<PatientBookingRepository>, @repository.getter('DoctorTimeSlotRepository') protected doctorTimeSlotRepositoryGetter: Getter<DoctorTimeSlotRepository>,
  ) {
    super(PatientBookingHistory, dataSource);
    this.doctorTimeSlot = this.createBelongsToAccessorFor('doctorTimeSlot', doctorTimeSlotRepositoryGetter,);
    this.registerInclusionResolver('doctorTimeSlot', this.doctorTimeSlot.inclusionResolver);
    this.patientBooking = this.createBelongsToAccessorFor('patientBooking', patientBookingRepositoryGetter,);
    this.registerInclusionResolver('patientBooking', this.patientBooking.inclusionResolver);
  }
}
