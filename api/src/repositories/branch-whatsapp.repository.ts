import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {BranchWhatsapp, BranchWhatsappRelations, Branch} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {BranchRepository} from './branch.repository';

export class BranchWhatsappRepository extends TimeStampRepositoryMixin<
  BranchWhatsapp,
  typeof BranchWhatsapp.prototype.id,
  Constructor<
    DefaultCrudRepository<BranchWhatsapp, typeof BranchWhatsapp.prototype.id, BranchWhatsappRelations>
  >
>(DefaultCrudRepository) {

  public readonly branch: BelongsToAccessor<Branch, typeof BranchWhatsapp.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('BranchRepository') protected branchRepositoryGetter: Getter<BranchRepository>,
  ) {
    super(BranchWhatsapp, dataSource);
    this.branch = this.createBelongsToAccessorFor('branch', branchRepositoryGetter,);
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
  }
}
