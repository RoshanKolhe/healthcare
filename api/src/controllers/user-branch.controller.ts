import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  User,
  Branch,
} from '../models';
import {UserRepository} from '../repositories';

export class UserBranchController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/branch', {
    responses: {
      '200': {
        description: 'Branch belonging to User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Branch),
          },
        },
      },
    },
  })
  async getBranch(
    @param.path.number('id') id: typeof User.prototype.id,
  ): Promise<Branch> {
    return this.userRepository.branch(id);
  }
}
