import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Branch, BranchRelations, Hospital} from '../models';
import {HospitalRepository} from './hospital.repository';

export class BranchRepository extends DefaultCrudRepository<
  Branch,
  typeof Branch.prototype.id,
  BranchRelations
> {

  public readonly hospital: BelongsToAccessor<Hospital, typeof Branch.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('HospitalRepository') protected hospitalRepositoryGetter: Getter<HospitalRepository>,
  ) {
    super(Branch, dataSource);
    this.hospital = this.createBelongsToAccessorFor('hospital', hospitalRepositoryGetter,);
    this.registerInclusionResolver('hospital', this.hospital.inclusionResolver);
  }
}
