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
import {ClinicType} from '../models';
import {ClinicTypeRepository} from '../repositories';

export class ClinicTypeController {
  constructor(
    @repository(ClinicTypeRepository)
    public clinicTypeRepository : ClinicTypeRepository,
  ) {}

  @post('/clinic-types')
  @response(200, {
    description: 'ClinicType model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClinicType)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClinicType, {
            title: 'NewClinicType',
            exclude: ['id'],
          }),
        },
      },
    })
    clinicType: Omit<ClinicType, 'id'>,
  ): Promise<ClinicType> {
    return this.clinicTypeRepository.create(clinicType);
  }

  @get('/clinic-types')
  @response(200, {
    description: 'Array of ClinicType model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClinicType, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ClinicType) filter?: Filter<ClinicType>,
  ): Promise<ClinicType[]> {
    return this.clinicTypeRepository.find(filter);
  }

  @get('/clinic-types/{id}')
  @response(200, {
    description: 'ClinicType model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClinicType, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ClinicType, {exclude: 'where'}) filter?: FilterExcludingWhere<ClinicType>
  ): Promise<ClinicType> {
    return this.clinicTypeRepository.findById(id, filter);
  }

  @patch('/clinic-types/{id}')
  @response(204, {
    description: 'ClinicType PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClinicType, {partial: true}),
        },
      },
    })
    clinicType: ClinicType,
  ): Promise<void> {
    await this.clinicTypeRepository.updateById(id, clinicType);
  }

  @del('/clinic-types/{id}')
  @response(204, {
    description: 'ClinicType DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clinicTypeRepository.deleteById(id);
  }
}
