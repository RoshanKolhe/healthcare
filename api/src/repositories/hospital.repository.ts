import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Hospital, HospitalRelations, Branch} from '../models';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class HospitalRepository extends TimeStampRepositoryMixin<
  Hospital,
  typeof Hospital.prototype.id,
  Constructor<
    DefaultCrudRepository<Hospital, typeof Hospital.prototype.id, HospitalRelations>
  >
>(DefaultCrudRepository) {
  
  public readonly branches: HasManyRepositoryFactory<
    Branch,
    typeof Hospital.prototype.id
  >;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>,
  ) {
    super(Hospital, dataSource);
    this.branches = this.createHasManyRepositoryFactoryFor(
      'branches',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branches', this.branches.inclusionResolver);
  }
}
