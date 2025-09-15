import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {PatientBooking, PatientBookingRelations, Patient, Doctor, DoctorTimeSlot, PatientBookingHistory, Clinic, Branch, ReferalManagement, PersonalInformation} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {PatientRepository} from './patient.repository';
import {DoctorRepository} from './doctor.repository';
import {DoctorTimeSlotRepository} from './doctor-time-slot.repository';
import {PatientBookingHistoryRepository} from './patient-booking-history.repository';
import {ClinicRepository} from './clinic.repository';
import {BranchRepository} from './branch.repository';
import {ReferalManagementRepository} from './referal-management.repository';
import {PersonalInformationRepository} from './personal-information.repository';

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

  public readonly patientBookingHistories: HasManyRepositoryFactory<PatientBookingHistory, typeof PatientBooking.prototype.id>;

  public readonly clinic: BelongsToAccessor<Clinic, typeof PatientBooking.prototype.id>;

  public readonly branch: BelongsToAccessor<Branch, typeof PatientBooking.prototype.id>;

  public readonly referalManagement: HasOneRepositoryFactory<ReferalManagement, typeof PatientBooking.prototype.id>;

  public readonly personalInformation: HasOneRepositoryFactory<PersonalInformation, typeof PatientBooking.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientRepository') protected patientRepositoryGetter: Getter<PatientRepository>, @repository.getter('DoctorRepository') protected doctorRepositoryGetter: Getter<DoctorRepository>, @repository.getter('DoctorTimeSlotRepository') protected doctorTimeSlotRepositoryGetter: Getter<DoctorTimeSlotRepository>, @repository.getter('PatientBookingHistoryRepository') protected patientBookingHistoryRepositoryGetter: Getter<PatientBookingHistoryRepository>, @repository.getter('ClinicRepository') protected clinicRepositoryGetter: Getter<ClinicRepository>, @repository.getter('BranchRepository') protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('ReferalManagementRepository') protected referalManagementRepositoryGetter: Getter<ReferalManagementRepository>, @repository.getter('PersonalInformationRepository') protected personalInformationRepositoryGetter: Getter<PersonalInformationRepository>,
  ) {
    super(PatientBooking, dataSource);
    this.personalInformation = this.createHasOneRepositoryFactoryFor('personalInformation', personalInformationRepositoryGetter);
    this.registerInclusionResolver('personalInformation', this.personalInformation.inclusionResolver);
    this.referalManagement = this.createHasOneRepositoryFactoryFor('referalManagement', referalManagementRepositoryGetter);
    this.registerInclusionResolver('referalManagement', this.referalManagement.inclusionResolver);
    this.branch = this.createBelongsToAccessorFor('branch', branchRepositoryGetter,);
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
    this.clinic = this.createBelongsToAccessorFor('clinic', clinicRepositoryGetter,);
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
    this.patientBookingHistories = this.createHasManyRepositoryFactoryFor('patientBookingHistories', patientBookingHistoryRepositoryGetter,);
    this.registerInclusionResolver('patientBookingHistories', this.patientBookingHistories.inclusionResolver);
    this.doctorTimeSlot = this.createBelongsToAccessorFor('doctorTimeSlot', doctorTimeSlotRepositoryGetter,);
    this.registerInclusionResolver('doctorTimeSlot', this.doctorTimeSlot.inclusionResolver);
    this.doctor = this.createBelongsToAccessorFor('doctor', doctorRepositoryGetter,);
    this.registerInclusionResolver('doctor', this.doctor.inclusionResolver);
    this.patient = this.createBelongsToAccessorFor('patient', patientRepositoryGetter,);
    this.registerInclusionResolver('patient', this.patient.inclusionResolver);
  }
}
