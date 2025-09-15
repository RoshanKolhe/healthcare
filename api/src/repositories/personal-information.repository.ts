import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {PersonalInformation, PersonalInformationRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class PersonalInformationRepository extends TimeStampRepositoryMixin<
  PersonalInformation,
  typeof PersonalInformation.prototype.id,
  Constructor<
    DefaultCrudRepository<PersonalInformation, typeof PersonalInformation.prototype.id, PersonalInformationRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
  ) {
    super(PersonalInformation, dataSource);
  }
}
