import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Hospital, HospitalRelations, Branch, Category, HospitalService, HospitalType} from '../models';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {CategoryRepository} from './category.repository';
import {HospitalServiceRepository} from './hospital-service.repository';
import {HospitalTypeRepository} from './hospital-type.repository';

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

  public readonly category: BelongsToAccessor<Category, typeof Hospital.prototype.id>;

  public readonly hospitalService: BelongsToAccessor<HospitalService, typeof Hospital.prototype.id>;

  public readonly hospitalType: BelongsToAccessor<HospitalType, typeof Hospital.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('HospitalServiceRepository') protected hospitalServiceRepositoryGetter: Getter<HospitalServiceRepository>, @repository.getter('HospitalTypeRepository') protected hospitalTypeRepositoryGetter: Getter<HospitalTypeRepository>,
  ) {
    super(Hospital, dataSource);
    this.hospitalType = this.createBelongsToAccessorFor('hospitalType', hospitalTypeRepositoryGetter,);
    this.registerInclusionResolver('hospitalType', this.hospitalType.inclusionResolver);
    this.hospitalService = this.createBelongsToAccessorFor('hospitalService', hospitalServiceRepositoryGetter,);
    this.registerInclusionResolver('hospitalService', this.hospitalService.inclusionResolver);
    this.category = this.createBelongsToAccessorFor('category', categoryRepositoryGetter,);
    this.registerInclusionResolver('category', this.category.inclusionResolver);
    this.branches = this.createHasManyRepositoryFactoryFor(
      'branches',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branches', this.branches.inclusionResolver);
  }
}
