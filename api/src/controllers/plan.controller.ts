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
import {Plan} from '../models';
import {PlanRepository} from '../repositories';
import {PermissionKeys} from '../authorization/permission-keys';
import {authenticate} from '@loopback/authentication';

export class PlanController {
  constructor(
    @repository(PlanRepository)
    public planRepository: PlanRepository,
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
    description: 'Array of Plan model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Plan, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Plan) filter?: Filter<Plan>): Promise<Plan[]> {
    return this.planRepository.find(filter);
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
