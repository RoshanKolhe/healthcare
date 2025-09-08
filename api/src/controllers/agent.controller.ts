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
import {Agent} from '../models';
import {AgentRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class AgentController {
  constructor(
    @repository(AgentRepository)
    public agentRepository: AgentRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @post('/agents')
  @response(200, {
    description: 'Agent model instance',
    content: {'application/json': {schema: getModelSchemaRef(Agent)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agent, {
            title: 'NewAgent',
            exclude: ['id'],
          }),
        },
      },
    })
    agent: Omit<Agent, 'id'>,
  ): Promise<Agent> {
    return this.agentRepository.create(agent);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @get('/agents')
  @response(200, {
    description: 'Array of Agent model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Agent, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Agent) filter?: Filter<Agent>): Promise<Agent[]> {
    return this.agentRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @get('/agents/{id}')
  @response(200, {
    description: 'Agent model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Agent, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Agent, {exclude: 'where'})
    filter?: FilterExcludingWhere<Agent>,
  ): Promise<Agent> {
    return this.agentRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @patch('/agents/{id}')
  @response(204, {
    description: 'Agent PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agent, {partial: true}),
        },
      },
    })
    agent: Agent,
  ): Promise<void> {
    await this.agentRepository.updateById(id, agent);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/agents/{id}')
  @response(204, {
    description: 'Agent DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.agentRepository.deleteById(id);
  }
}
