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
import {ClinicService} from '../models';
import {ClinicServiceRepository} from '../repositories';

export class ClinicServiceController {
  constructor(
    @repository(ClinicServiceRepository)
    public clinicServiceRepository : ClinicServiceRepository,
  ) {}

  @post('/clinic-services')
  @response(200, {
    description: 'ClinicService model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClinicService)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClinicService, {
            title: 'NewClinicService',
            exclude: ['id'],
          }),
        },
      },
    })
    clinicService: Omit<ClinicService, 'id'>,
  ): Promise<ClinicService> {
    return this.clinicServiceRepository.create(clinicService);
  }

  @get('/clinic-services')
  @response(200, {
    description: 'Array of ClinicService model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClinicService, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ClinicService) filter?: Filter<ClinicService>,
  ): Promise<ClinicService[]> {
    return this.clinicServiceRepository.find(filter);
  }

  @get('/clinic-services/{id}')
  @response(200, {
    description: 'ClinicService model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClinicService, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ClinicService, {exclude: 'where'}) filter?: FilterExcludingWhere<ClinicService>
  ): Promise<ClinicService> {
    return this.clinicServiceRepository.findById(id, filter);
  }

  @patch('/clinic-services/{id}')
  @response(204, {
    description: 'ClinicService PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClinicService, {partial: true}),
        },
      },
    })
    clinicService: ClinicService,
  ): Promise<void> {
    await this.clinicServiceRepository.updateById(id, clinicService);
  }

  @del('/clinic-services/{id}')
  @response(204, {
    description: 'ClinicService DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clinicServiceRepository.deleteById(id);
  }
}
