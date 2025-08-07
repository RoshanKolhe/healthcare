import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  relation,
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
import {Branch} from '../models';
import {BranchRepository} from '../repositories';

export class BranchController {
  constructor(
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
  ) {}

  @post('/branches')
  @response(200, {
    description: 'Branch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Branch)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Branch, {
            title: 'NewBranch',
            exclude: ['id'],
          }),
        },
      },
    })
    branch: Omit<Branch, 'id'>,
  ): Promise<Branch> {
    return this.branchRepository.create(branch);
  }


  @get('/branches')
  @response(200, {
    description: 'Array of Branch model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Branch, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Branch) filter?: Filter<Branch>): Promise<Branch[]> {
    return this.branchRepository.find(filter);
  }


  @get('/branches/{id}')
  @response(200, {
    description: 'Branch model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Branch, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Branch, {exclude: 'where'})
    filter?: FilterExcludingWhere<Branch>,
  ): Promise<Branch> {
    return this.branchRepository.findById(id, {
      ...filter,
      include: [{relation: 'clinic'}],
    });
  }

  @patch('/branches/{id}')
  @response(204, {
    description: 'Branch PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Branch, {partial: true}),
        },
      },
    })
    branch: Branch,
  ): Promise<void> {
    await this.branchRepository.updateById(id, branch);
  }

  @del('/branches/{id}')
  @response(204, {
    description: 'Branch DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.branchRepository.deleteById(id);
  }
}
