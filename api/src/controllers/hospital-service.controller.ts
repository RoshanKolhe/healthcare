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
import {HospitalService} from '../models';
import {HospitalServiceRepository} from '../repositories';

export class HospitalServiceController {
  constructor(
    @repository(HospitalServiceRepository)
    public hospitalServiceRepository : HospitalServiceRepository,
  ) {}

  @post('/hospital-services')
  @response(200, {
    description: 'HospitalService model instance',
    content: {'application/json': {schema: getModelSchemaRef(HospitalService)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HospitalService, {
            title: 'NewHospitalService',
            exclude: ['id'],
          }),
        },
      },
    })
    hospitalService: Omit<HospitalService, 'id'>,
  ): Promise<HospitalService> {
    return this.hospitalServiceRepository.create(hospitalService);
  }

  @get('/hospital-services')
  @response(200, {
    description: 'Array of HospitalService model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(HospitalService, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(HospitalService) filter?: Filter<HospitalService>,
  ): Promise<HospitalService[]> {
    return this.hospitalServiceRepository.find(filter);
  }

  @get('/hospital-services/{id}')
  @response(200, {
    description: 'HospitalService model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(HospitalService, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(HospitalService, {exclude: 'where'}) filter?: FilterExcludingWhere<HospitalService>
  ): Promise<HospitalService> {
    return this.hospitalServiceRepository.findById(id, filter);
  }

  @patch('/hospital-services/{id}')
  @response(204, {
    description: 'HospitalService PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HospitalService, {partial: true}),
        },
      },
    })
    hospitalService: HospitalService,
  ): Promise<void> {
    await this.hospitalServiceRepository.updateById(id, hospitalService);
  }

  @del('/hospital-services/{id}')
  @response(204, {
    description: 'HospitalService DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hospitalServiceRepository.deleteById(id);
  }
}
