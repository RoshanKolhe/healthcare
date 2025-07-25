import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {User, UserRelations, Hospital} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HospitalRepository} from './hospital.repository';

export type Credentials = {
  email?: string;
  password: string;
};

export class UserRepository extends TimeStampRepositoryMixin<
  User,
  typeof User.prototype.id,
  Constructor<
    DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  >
>(DefaultCrudRepository) {

  public readonly hospital: BelongsToAccessor<Hospital, typeof User.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('HospitalRepository') protected hospitalRepositoryGetter: Getter<HospitalRepository>,
  ) {
    super(User, dataSource);
    this.hospital = this.createBelongsToAccessorFor('hospital', hospitalRepositoryGetter,);
    this.registerInclusionResolver('hospital', this.hospital.inclusionResolver);
  }
}
