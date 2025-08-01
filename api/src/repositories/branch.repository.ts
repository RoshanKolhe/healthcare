import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Branch, BranchRelations, Hospital} from '../models';
import {HospitalRepository} from './hospital.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class BranchRepository extends TimeStampRepositoryMixin<
  Branch,
  typeof Branch.prototype.id,
  Constructor<
    DefaultCrudRepository<Branch, typeof Branch.prototype.id, BranchRelations>
  >
>(DefaultCrudRepository) {
  public readonly hospital: BelongsToAccessor<
    Hospital,
    typeof Branch.prototype.id
  >;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('HospitalRepository')
    protected hospitalRepositoryGetter: Getter<HospitalRepository>,
  ) {
    super(Branch, dataSource);
    this.hospital = this.createBelongsToAccessorFor(
      'hospital',
      hospitalRepositoryGetter,
    );
    this.registerInclusionResolver('hospital', this.hospital.inclusionResolver);
  }
}
