import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {HealthcareDataSource} from '../datasources';
import {Plan, PlanRelations, ClinicSubscription} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ClinicSubscriptionRepository} from './clinic-subscription.repository';

export class PlanRepository extends TimeStampRepositoryMixin<
  Plan,
  typeof Plan.prototype.id,
  Constructor<
    DefaultCrudRepository<Plan, typeof Plan.prototype.id, PlanRelations>
  >
>(DefaultCrudRepository) {

  public readonly clinicSubscriptions: HasManyRepositoryFactory<ClinicSubscription, typeof Plan.prototype.id>;

  constructor(
    @inject('datasources.healthcare') dataSource: HealthcareDataSource, @repository.getter('ClinicSubscriptionRepository') protected clinicSubscriptionRepositoryGetter: Getter<ClinicSubscriptionRepository>,
  ) {
    super(Plan, dataSource);
    this.clinicSubscriptions = this.createHasManyRepositoryFactoryFor('clinicSubscriptions', clinicSubscriptionRepositoryGetter,);
    this.registerInclusionResolver('clinicSubscriptions', this.clinicSubscriptions.inclusionResolver);
  }
}
