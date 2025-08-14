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
import {DoctorAvailability} from '../models';
import {DoctorAvailabilityRepository} from '../repositories';

export class DoctorAvailabilityController {
  constructor(
    @repository(DoctorAvailabilityRepository)
    public doctorAvailabilityRepository: DoctorAvailabilityRepository,
  ) {}

  @post('/doctor-availabilities')
  @response(200, {
    description: 'DoctorAvailability model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(DoctorAvailability)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DoctorAvailability, {
            title: 'NewDoctorAvailability',
            exclude: ['id'],
          }),
        },
      },
    })
    doctorAvailability: Omit<DoctorAvailability, 'id'>,
  ): Promise<DoctorAvailability> {
    return this.doctorAvailabilityRepository.create(doctorAvailability);
  }

  @get('/doctor-availabilities')
  @response(200, {
    description: 'Array of DoctorAvailability model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DoctorAvailability, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(DoctorAvailability) filter?: Filter<DoctorAvailability>,
  ): Promise<DoctorAvailability[]> {
    return this.doctorAvailabilityRepository.find({
      ...filter,
      include: [
        {relation: 'branchDoctor'},
        {relation: 'clinic'},
        {relation: 'doctorTimeSlots'},
      ],
    });
  }

  @get('/doctor-availabilities/{id}')
  @response(200, {
    description: 'DoctorAvailability model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DoctorAvailability, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(DoctorAvailability, {exclude: 'where'})
    filter?: FilterExcludingWhere<DoctorAvailability>,
  ): Promise<DoctorAvailability> {
    return this.doctorAvailabilityRepository.findById(id, {
      ...filter,
      include: [
        {relation: 'branchDoctor'},
        {relation: 'clinic'},
        {relation: 'doctorTimeSlots'},
      ],
    });
  }

  @patch('/doctor-availabilities/{id}')
  @response(204, {
    description: 'DoctorAvailability PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DoctorAvailability, {partial: true}),
        },
      },
    })
    doctorAvailability: DoctorAvailability,
  ): Promise<void> {
    await this.doctorAvailabilityRepository.updateById(id, doctorAvailability);
  }

  @del('/doctor-availabilities/{id}')
  @response(204, {
    description: 'DoctorAvailability DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.doctorAvailabilityRepository.deleteById(id);
  }
}
