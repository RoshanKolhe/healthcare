import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Branch, BranchRelations, Clinic, BranchWhatsapp} from '../models';
import { ClinicRepository } from './clinic.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {BranchWhatsappRepository} from './branch-whatsapp.repository';

export class BranchRepository extends TimeStampRepositoryMixin<
  Branch,
  typeof Branch.prototype.id,
  Constructor<
    DefaultCrudRepository<Branch, typeof Branch.prototype.id, BranchRelations>
  >
>(DefaultCrudRepository) {
  public readonly clinic: BelongsToAccessor<
    Clinic,
    typeof Branch.prototype.id
  >;

  public readonly branchWhatsapp: HasOneRepositoryFactory<BranchWhatsapp, typeof Branch.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource,
    @repository.getter('ClinicRepository')
    protected clinicRepositoryGetter: Getter<ClinicRepository>, @repository.getter('BranchWhatsappRepository') protected branchWhatsappRepositoryGetter: Getter<BranchWhatsappRepository>,
  ) {
    super(Branch, dataSource);
    this.branchWhatsapp = this.createHasOneRepositoryFactoryFor('branchWhatsapp', branchWhatsappRepositoryGetter);
    this.registerInclusionResolver('branchWhatsapp', this.branchWhatsapp.inclusionResolver);
    this.clinic = this.createBelongsToAccessorFor(
      'clinic',
      clinicRepositoryGetter,
    );
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
  }
}
