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
import {Specialization} from '../models';
import {SpecializationRepository} from '../repositories';

export class SpecializationController {
  constructor(
    @repository(SpecializationRepository)
    public specializationRepository : SpecializationRepository,
  ) {}

  @post('/specializations')
  @response(200, {
    description: 'Specialization model instance',
    content: {'application/json': {schema: getModelSchemaRef(Specialization)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Specialization, {
            title: 'NewSpecialization',
            exclude: ['id'],
          }),
        },
      },
    })
    specialization: Omit<Specialization, 'id'>,
  ): Promise<Specialization> {
    return this.specializationRepository.create(specialization);
  }

  @get('/specializations/count')
  @response(200, {
    description: 'Specialization model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Specialization) where?: Where<Specialization>,
  ): Promise<Count> {
    return this.specializationRepository.count(where);
  }

  @get('/specializations')
  @response(200, {
    description: 'Array of Specialization model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Specialization, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Specialization) filter?: Filter<Specialization>,
  ): Promise<Specialization[]> {
    return this.specializationRepository.find(filter);
  }

  @patch('/specializations')
  @response(200, {
    description: 'Specialization PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Specialization, {partial: true}),
        },
      },
    })
    specialization: Specialization,
    @param.where(Specialization) where?: Where<Specialization>,
  ): Promise<Count> {
    return this.specializationRepository.updateAll(specialization, where);
  }

  @get('/specializations/{id}')
  @response(200, {
    description: 'Specialization model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Specialization, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Specialization, {exclude: 'where'}) filter?: FilterExcludingWhere<Specialization>
  ): Promise<Specialization> {
    return this.specializationRepository.findById(id, filter);
  }

  @patch('/specializations/{id}')
  @response(204, {
    description: 'Specialization PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Specialization, {partial: true}),
        },
      },
    })
    specialization: Specialization,
  ): Promise<void> {
    await this.specializationRepository.updateById(id, specialization);
  }

  @put('/specializations/{id}')
  @response(204, {
    description: 'Specialization PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() specialization: Specialization,
  ): Promise<void> {
    await this.specializationRepository.replaceById(id, specialization);
  }

  @del('/specializations/{id}')
  @response(204, {
    description: 'Specialization DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.specializationRepository.deleteById(id);
  }
}
