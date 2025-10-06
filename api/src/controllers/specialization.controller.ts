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
    public specializationRepository: SpecializationRepository,
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

  @get('/specializations')
  @response(200, {
    description: 'Array of Specialization model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              specializationId: {type: 'number'},
              specializationName: {type: 'string'},
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Specialization) filter?: Filter<Specialization>,
  ): Promise<{specializationId: number; specializationName: string}[]> {
    const mergedFilter = {
      ...filter,
      fields: {
        id: true,
        specialization: true,
      },
    };

    const specializations =
      await this.specializationRepository.find(mergedFilter);

    return specializations
      .filter(spec => spec.id !== undefined) // Filter out any without id
      .map(spec => ({
        specializationId: spec.id as number, // Type assertion
        specializationName: spec.specialization,
      }));
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
    @param.filter(Specialization, {exclude: 'where'})
    filter?: FilterExcludingWhere<Specialization>,
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

  @del('/specializations/{id}')
  @response(204, {
    description: 'Specialization DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.specializationRepository.deleteById(id);
  }
}
