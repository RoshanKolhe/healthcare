import {
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
import {ReferalManagement} from '../models';
import {ReferalManagementRepository} from '../repositories';

export class ReferalManagementController {
  constructor(
    @repository(ReferalManagementRepository)
    public referalManagementRepository : ReferalManagementRepository,
  ) {}

  @post('/referal-managements')
  @response(200, {
    description: 'ReferalManagement model instance',
    content: {'application/json': {schema: getModelSchemaRef(ReferalManagement)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReferalManagement, {
            title: 'NewReferalManagement',
            exclude: ['id'],
          }),
        },
      },
    })
    referalManagement: Omit<ReferalManagement, 'id'>,
  ): Promise<ReferalManagement> {
    return this.referalManagementRepository.create(referalManagement);
  }

  @get('/referal-managements')
  @response(200, {
    description: 'Array of ReferalManagement model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ReferalManagement, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ReferalManagement) filter?: Filter<ReferalManagement>,
  ): Promise<ReferalManagement[]> {
    return this.referalManagementRepository.find(filter);
  }

  @get('/referal-managements/{id}')
  @response(200, {
    description: 'ReferalManagement model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ReferalManagement, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ReferalManagement, {exclude: 'where'}) filter?: FilterExcludingWhere<ReferalManagement>
  ): Promise<ReferalManagement> {
    return this.referalManagementRepository.findById(id, filter);
  }

  @patch('/referal-managements/{id}')
  @response(204, {
    description: 'ReferalManagement PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReferalManagement, {partial: true}),
        },
      },
    })
    referalManagement: ReferalManagement,
  ): Promise<void> {
    await this.referalManagementRepository.updateById(id, referalManagement);
  }

  @del('/referal-managements/{id}')
  @response(204, {
    description: 'ReferalManagement DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.referalManagementRepository.deleteById(id);
  }
}
