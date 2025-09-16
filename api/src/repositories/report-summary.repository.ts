import {inject, Getter, Constructor} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {ReportSummary, ReportSummaryRelations, PatientBooking} from '../models';
import {PatientBookingRepository} from './patient-booking.repository';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class ReportSummaryRepository extends TimeStampRepositoryMixin<
  ReportSummary,
  typeof ReportSummary.prototype.id,
  Constructor<
    DefaultCrudRepository<ReportSummary, typeof ReportSummary.prototype.id, ReportSummaryRelations>
  >
>(DefaultCrudRepository) {

  public readonly patientBooking: BelongsToAccessor<PatientBooking, typeof ReportSummary.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('PatientBookingRepository') protected patientBookingRepositoryGetter: Getter<PatientBookingRepository>,
  ) {
    super(ReportSummary, dataSource);
    this.patientBooking = this.createBelongsToAccessorFor('patientBooking', patientBookingRepositoryGetter,);
    this.registerInclusionResolver('patientBooking', this.patientBooking.inclusionResolver);
  }
}
