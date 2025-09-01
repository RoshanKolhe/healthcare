import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {PatientBooking, PatientBookingRelations, Patient, Doctor, DoctorTimeSlot} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {PatientRepository} from './patient.repository';
import {DoctorRepository} from './doctor.repository';
import {DoctorTimeSlotRepository} from './doctor-time-slot.repository';

export class PatientBookingRepository extends TimeStampRepositoryMixin<
  PatientBooking,
  typeof PatientBooking.prototype.id,
  Constructor<
    DefaultCrudRepository<PatientBooking, typeof PatientBooking.prototype.id, PatientBookingRelations>
  >
>(DefaultCrudRepository) {

  public readonly patient: BelongsToAccessor<Patient, typeof PatientBooking.prototype.id>;

  public readonly doctor: BelongsToAccessor<Doctor, typeof PatientBooking.prototype.id>;

  public readonly doctorTimeSlot: BelongsToAccessor<DoctorTimeSlot, typeof PatientBooking.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientRepository') protected patientRepositoryGetter: Getter<PatientRepository>, @repository.getter('DoctorRepository') protected doctorRepositoryGetter: Getter<DoctorRepository>, @repository.getter('DoctorTimeSlotRepository') protected doctorTimeSlotRepositoryGetter: Getter<DoctorTimeSlotRepository>,
  ) {
    super(PatientBooking, dataSource);
    this.doctorTimeSlot = this.createBelongsToAccessorFor('doctorTimeSlot', doctorTimeSlotRepositoryGetter,);
    this.registerInclusionResolver('doctorTimeSlot', this.doctorTimeSlot.inclusionResolver);
    this.doctor = this.createBelongsToAccessorFor('doctor', doctorRepositoryGetter,);
    this.registerInclusionResolver('doctor', this.doctor.inclusionResolver);
    this.patient = this.createBelongsToAccessorFor('patient', patientRepositoryGetter,);
    this.registerInclusionResolver('patient', this.patient.inclusionResolver);
  }
}
