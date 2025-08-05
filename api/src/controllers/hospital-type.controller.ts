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
import {HospitalType} from '../models';
import {HospitalTypeRepository} from '../repositories';

export class HospitalTypeController {
  constructor(
    @repository(HospitalTypeRepository)
    public hospitalTypeRepository : HospitalTypeRepository,
  ) {}

  @post('/hospital-types')
  @response(200, {
    description: 'HospitalType model instance',
    content: {'application/json': {schema: getModelSchemaRef(HospitalType)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HospitalType, {
            title: 'NewHospitalType',
            exclude: ['id'],
          }),
        },
      },
    })
    hospitalType: Omit<HospitalType, 'id'>,
  ): Promise<HospitalType> {
    return this.hospitalTypeRepository.create(hospitalType);
  }

  @get('/hospital-types')
  @response(200, {
    description: 'Array of HospitalType model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(HospitalType, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(HospitalType) filter?: Filter<HospitalType>,
  ): Promise<HospitalType[]> {
    return this.hospitalTypeRepository.find(filter);
  }

  @get('/hospital-types/{id}')
  @response(200, {
    description: 'HospitalType model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(HospitalType, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(HospitalType, {exclude: 'where'}) filter?: FilterExcludingWhere<HospitalType>
  ): Promise<HospitalType> {
    return this.hospitalTypeRepository.findById(id, filter);
  }

  @patch('/hospital-types/{id}')
  @response(204, {
    description: 'HospitalType PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HospitalType, {partial: true}),
        },
      },
    })
    hospitalType: HospitalType,
  ): Promise<void> {
    await this.hospitalTypeRepository.updateById(id, hospitalType);
  }

  @del('/hospital-types/{id}')
  @response(204, {
    description: 'HospitalType DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hospitalTypeRepository.deleteById(id);
  }
}
