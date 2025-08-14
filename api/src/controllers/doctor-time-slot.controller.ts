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
import {DoctorTimeSlot} from '../models';
import {DoctorTimeSlotRepository} from '../repositories';

export class DoctorTimeSlotController {
  constructor(
    @repository(DoctorTimeSlotRepository)
    public doctorTimeSlotRepository: DoctorTimeSlotRepository,
  ) {}

  @post('/doctor-time-slots')
  @response(200, {
    description: 'DoctorTimeSlot model instance',
    content: {'application/json': {schema: getModelSchemaRef(DoctorTimeSlot)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DoctorTimeSlot, {
            title: 'NewDoctorTimeSlot',
            exclude: ['id'],
          }),
        },
      },
    })
    doctorTimeSlot: Omit<DoctorTimeSlot, 'id'>,
  ): Promise<DoctorTimeSlot> {
    return this.doctorTimeSlotRepository.create(doctorTimeSlot);
  }

  @get('/doctor-time-slots')
  @response(200, {
    description: 'Array of DoctorTimeSlot model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DoctorTimeSlot, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(DoctorTimeSlot) filter?: Filter<DoctorTimeSlot>,
  ): Promise<DoctorTimeSlot[]> {
    return this.doctorTimeSlotRepository.find({
      ...filter,
      include: [{relation: 'doctorAvailability'}],
    });
  }

  @get('/doctor-time-slots/{id}')
  @response(200, {
    description: 'DoctorTimeSlot model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DoctorTimeSlot, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(DoctorTimeSlot, {exclude: 'where'})
    filter?: FilterExcludingWhere<DoctorTimeSlot>,
  ): Promise<DoctorTimeSlot> {
    return this.doctorTimeSlotRepository.findById(id, {
      ...filter,
      include: [{relation: 'doctorAvailability'}],
    });
  }

  @patch('/doctor-time-slots/{id}')
  @response(204, {
    description: 'DoctorTimeSlot PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DoctorTimeSlot, {partial: true}),
        },
      },
    })
    doctorTimeSlot: DoctorTimeSlot,
  ): Promise<void> {
    await this.doctorTimeSlotRepository.updateById(id, doctorTimeSlot);
  }

  @del('/doctor-time-slots/{id}')
  @response(204, {
    description: 'DoctorTimeSlot DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.doctorTimeSlotRepository.deleteById(id);
  }
}
