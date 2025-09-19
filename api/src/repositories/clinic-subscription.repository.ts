import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {ClinicSubscription, ClinicSubscriptionRelations, User, Clinic, Plan} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';
import {ClinicRepository} from './clinic.repository';
import {PlanRepository} from './plan.repository';

export class ClinicSubscriptionRepository extends TimeStampRepositoryMixin<
  ClinicSubscription,
  typeof ClinicSubscription.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ClinicSubscription,
      typeof ClinicSubscription.prototype.id,
      ClinicSubscriptionRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly purchasedByUser: BelongsToAccessor<User, typeof ClinicSubscription.prototype.id>;

  public readonly clinic: BelongsToAccessor<Clinic, typeof ClinicSubscription.prototype.id>;

  public readonly plan: BelongsToAccessor<Plan, typeof ClinicSubscription.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ClinicRepository') protected clinicRepositoryGetter: Getter<ClinicRepository>, @repository.getter('PlanRepository') protected planRepositoryGetter: Getter<PlanRepository>,
  ) {
    super(ClinicSubscription, dataSource);
    this.plan = this.createBelongsToAccessorFor('plan', planRepositoryGetter,);
    this.registerInclusionResolver('plan', this.plan.inclusionResolver);
    this.clinic = this.createBelongsToAccessorFor('clinic', clinicRepositoryGetter,);
    this.registerInclusionResolver('clinic', this.clinic.inclusionResolver);
    this.purchasedByUser = this.createBelongsToAccessorFor('purchasedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('purchasedByUser', this.purchasedByUser.inclusionResolver);
  }
}
