import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {ClinicSubscription, Plan} from '../models';
import {ClinicSubscriptionRepository, PlanRepository} from '../repositories';
import {PermissionKeys} from '../authorization/permission-keys';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {CurrentUser} from '../types';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class PlanController {
  constructor(
    @repository(PlanRepository)
    public planRepository: PlanRepository,
    @repository('ClinicSubscriptionRepository')
    public clinicSubscriptionRepository: ClinicSubscriptionRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @post('/plans')
  @response(200, {
    description: 'Plan model instance',
    content: {'application/json': {schema: getModelSchemaRef(Plan)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plan, {
            title: 'NewPlan',
            exclude: ['id'],
          }),
        },
      },
    })
    plan: Omit<Plan, 'id'>,
  ): Promise<Plan> {
    return this.planRepository.create(plan);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLINIC],
    },
  })
  @get('/plans')
  @response(200, {
    description: 'Array of plans with clinic subscription detail',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            allOf: [
              getModelSchemaRef(Plan, {includeRelations: true}),
              {
                type: 'object',
                properties: {
                  clinicSubscriptionDetail: getModelSchemaRef(
                    ClinicSubscription,
                    {
                      includeRelations: true,
                    },
                  ),
                },
              },
            ],
          },
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(Plan) filter?: Filter<Plan>,
  ): Promise<
    ({[key: string]: any} & {
      clinicSubscriptionDetail: ClinicSubscription | null;
    })[]
  > {
    const userData = currentUser.id;

    const clinicSubscriptionDetail =
      await this.clinicSubscriptionRepository.findOne({
        where: {clinicId: userData.clinicId},
        order: ['createdAt DESC'],
      });

    const plans = await this.planRepository.find(filter);

    return plans.map(plan => ({
      ...plan.toJSON(), // 👈 convert to plain object
      clinicSubscriptionDetail,
    }));
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLINIC],
    },
  })
  @get('/plans/{id}')
  @response(200, {
    description: 'Plan model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Plan, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Plan, {exclude: 'where'}) filter?: FilterExcludingWhere<Plan>,
  ): Promise<Plan> {
    return this.planRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @patch('/plans/{id}')
  @response(204, {
    description: 'Plan PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plan, {partial: true}),
        },
      },
    })
    plan: Plan,
  ): Promise<void> {
    await this.planRepository.updateById(id, plan);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/plans/{id}')
  @response(204, {
    description: 'Plan DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.planRepository.deleteById(id);
  }
}
