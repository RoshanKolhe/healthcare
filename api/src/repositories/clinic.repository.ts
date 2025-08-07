import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Clinic, ClinicRelations, Branch, Category, ClinicService, ClinicType} from '../models';
import {BranchRepository} from './branch.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {CategoryRepository} from './category.repository';
import {ClinicServiceRepository} from './clinic-service.repository';
import {ClinicTypeRepository} from './clinic-type.repository';

export class ClinicRepository extends TimeStampRepositoryMixin<
  Clinic,
  typeof Clinic.prototype.id,
  Constructor<
    DefaultCrudRepository<Clinic, typeof Clinic.prototype.id, ClinicRelations>
  >
>(DefaultCrudRepository) {
  
  public readonly branches: HasManyRepositoryFactory<
    Branch,
    typeof Clinic.prototype.id
  >;

  public readonly category: BelongsToAccessor<Category, typeof Clinic.prototype.id>;

  public readonly clinicService: BelongsToAccessor<ClinicService, typeof Clinic.prototype.id>;

  public readonly clinicType: BelongsToAccessor<ClinicType, typeof Clinic.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('ClinicServiceRepository') protected clinicServiceRepositoryGetter: Getter<ClinicServiceRepository>, @repository.getter('ClinicTypeRepository') protected clinicTypeRepositoryGetter: Getter<ClinicTypeRepository>,
  ) {
    super(Clinic, dataSource);
    this.clinicType = this.createBelongsToAccessorFor('clinicType', clinicTypeRepositoryGetter,);
    this.registerInclusionResolver('clinicType', this.clinicType.inclusionResolver);
    this.clinicService = this.createBelongsToAccessorFor('clinicService', clinicServiceRepositoryGetter,);
    this.registerInclusionResolver('clinicService', this.clinicService.inclusionResolver);
    this.category = this.createBelongsToAccessorFor('category', categoryRepositoryGetter,);
    this.registerInclusionResolver('category', this.category.inclusionResolver);
    this.branches = this.createHasManyRepositoryFactoryFor(
      'branches',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branches', this.branches.inclusionResolver);
  }
}
