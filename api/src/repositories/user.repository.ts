import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {User, UserRelations, Hospital, Branch} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HospitalRepository} from './hospital.repository';
import {BranchRepository} from './branch.repository';

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

  public readonly branch: BelongsToAccessor<Branch, typeof User.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('HospitalRepository') protected hospitalRepositoryGetter: Getter<HospitalRepository>, @repository.getter('BranchRepository') protected branchRepositoryGetter: Getter<BranchRepository>,
  ) {
    super(User, dataSource);
    this.branch = this.createBelongsToAccessorFor('branch', branchRepositoryGetter,);
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
    this.hospital = this.createBelongsToAccessorFor('hospital', hospitalRepositoryGetter,);
    this.registerInclusionResolver('hospital', this.hospital.inclusionResolver);
  }
}
