import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Prescription, PrescriptionRelations, PatientBooking} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {PatientBookingRepository} from './patient-booking.repository';

export class PrescriptionRepository extends TimeStampRepositoryMixin<
  Prescription,
  typeof Prescription.prototype.id,
  Constructor<
    DefaultCrudRepository<Prescription, typeof Prescription.prototype.id, PrescriptionRelations>
  >
>(DefaultCrudRepository) {

  public readonly patientBooking: BelongsToAccessor<PatientBooking, typeof Prescription.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientBookingRepository') protected patientBookingRepositoryGetter: Getter<PatientBookingRepository>,
  ) {
    super(Prescription, dataSource);
    this.patientBooking = this.createBelongsToAccessorFor('patientBooking', patientBookingRepositoryGetter,);
    this.registerInclusionResolver('patientBooking', this.patientBooking.inclusionResolver);
  }
}
