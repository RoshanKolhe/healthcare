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
import {Hospital} from '../models';
import {HospitalRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class HospitalController {
  constructor(
    @repository(HospitalRepository)
    public hospitalRepository: HospitalRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/hospitals')
  @response(200, {
    description: 'Hospital model instance',
    content: {'application/json': {schema: getModelSchemaRef(Hospital)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hospital, {
            title: 'NewHospital',
            exclude: ['id'],
          }),
        },
      },
    })
    hospital: Omit<Hospital, 'id'>,
  ): Promise<Hospital> {
    return this.hospitalRepository.create(hospital);
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/hospitals')
  @response(200, {
    description: 'Array of Hospital model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hospital, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Hospital) filter?: Filter<Hospital>,
  ): Promise<Hospital[]> {
    return this.hospitalRepository.find({
      ...filter,
      include: [{relation: 'branches'}],
    });
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/hospitals/{id}')
  @response(200, {
    description: 'Hospital model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hospital, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Hospital, {exclude: 'where'})
    filter?: FilterExcludingWhere<Hospital>,
  ): Promise<Hospital> {
    return this.hospitalRepository.findById(id, {
      ...filter,
      include: [{relation: 'branches'}],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/hospitals/{id}')
  @response(204, {
    description: 'Hospital PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hospital, {partial: true}),
        },
      },
    })
    hospital: Hospital,
  ): Promise<void> {
    console.log(hospital);
    await this.hospitalRepository.updateById(id, hospital);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/hospitals/{id}')
  @response(204, {
    description: 'Hospital DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hospitalRepository.deleteById(id);
  }
}
