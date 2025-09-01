import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Patient, PatientRelations, PatientBooking} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {PatientBookingRepository} from './patient-booking.repository';

export class PatientRepository extends TimeStampRepositoryMixin<
  Patient,
  typeof Patient.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Patient,
      typeof Patient.prototype.id,
      PatientRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly patientBookings: HasManyRepositoryFactory<PatientBooking, typeof Patient.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientBookingRepository') protected patientBookingRepositoryGetter: Getter<PatientBookingRepository>,
  ) {
    super(Patient, dataSource);
    this.patientBookings = this.createHasManyRepositoryFactoryFor('patientBookings', patientBookingRepositoryGetter,);
    this.registerInclusionResolver('patientBookings', this.patientBookings.inclusionResolver);
  }
}
