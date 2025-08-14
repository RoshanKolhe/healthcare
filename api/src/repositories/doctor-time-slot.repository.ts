import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import { DoctorTimeSlot, DoctorTimeSlotRelations, DoctorAvailability} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {DoctorAvailabilityRepository} from './doctor-availability.repository';

export class DoctorTimeSlotRepository extends TimeStampRepositoryMixin<
  DoctorTimeSlot,
  typeof DoctorTimeSlot.prototype.id,
  Constructor<
    DefaultCrudRepository<DoctorTimeSlot, typeof DoctorTimeSlot.prototype.id, DoctorTimeSlotRelations>
  >
>(DefaultCrudRepository) {

  public readonly doctorAvailability: BelongsToAccessor<DoctorAvailability, typeof DoctorTimeSlot.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('DoctorAvailabilityRepository') protected doctorAvailabilityRepositoryGetter: Getter<DoctorAvailabilityRepository>,
  ) {
    super(DoctorTimeSlot, dataSource);
    this.doctorAvailability = this.createBelongsToAccessorFor('doctorAvailability', doctorAvailabilityRepositoryGetter,);
    this.registerInclusionResolver('doctorAvailability', this.doctorAvailability.inclusionResolver);
  }
}
