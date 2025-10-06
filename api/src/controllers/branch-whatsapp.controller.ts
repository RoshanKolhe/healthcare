import {
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
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {BranchWhatsapp} from '../models';
import {BranchWhatsappRepository} from '../repositories';

export class BranchWhatsappController {
  constructor(
    @repository(BranchWhatsappRepository)
    public branchWhatsappRepository: BranchWhatsappRepository,
  ) {}

  @post('/branch-whatsapps')
  @response(200, {
    description: 'BranchWhatsapp model instance',
    content: {'application/json': {schema: getModelSchemaRef(BranchWhatsapp)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BranchWhatsapp, {
            title: 'NewBranchWhatsapp',
            exclude: ['id'],
          }),
        },
      },
    })
    branchWhatsapp: Omit<BranchWhatsapp, 'id'>,
  ): Promise<BranchWhatsapp> {
    const existingRecord = await this.branchWhatsappRepository.findOne({
      where: {phoneNo: branchWhatsapp.phoneNo},
    });

    if (existingRecord) {
      throw new HttpErrors.BadRequest(
        `Phone number ${branchWhatsapp.phoneNo} already exists`,
      );
    }
    return this.branchWhatsappRepository.create(branchWhatsapp);
  }

  @get('/branch-whatsapps')
  @response(200, {
    description: 'Array of BranchWhatsapp model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BranchWhatsapp, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BranchWhatsapp) filter?: Filter<BranchWhatsapp>,
  ): Promise<BranchWhatsapp[]> {
    return this.branchWhatsappRepository.find(filter);
  }

  @get('/branch-whatsapps/{id}')
  @response(200, {
    description: 'BranchWhatsapp model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BranchWhatsapp, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BranchWhatsapp, {exclude: 'where'})
    filter?: FilterExcludingWhere<BranchWhatsapp>,
  ): Promise<BranchWhatsapp> {
    return this.branchWhatsappRepository.findById(id, filter);
  }

  @patch('/branch-whatsapps/{id}')
  @response(204, {
    description: 'BranchWhatsapp PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BranchWhatsapp, {partial: true}),
        },
      },
    })
    branchWhatsapp: BranchWhatsapp,
  ): Promise<void> {
    await this.branchWhatsappRepository.updateById(id, branchWhatsapp);
  }

  @del('/branch-whatsapps/{id}')
  @response(204, {
    description: 'BranchWhatsapp DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.branchWhatsappRepository.deleteById(id);
  }

  @post('/branch-whatsapps/find-by-phone')
  @response(200, {
    description: 'Find BranchWhatsapp by phone number',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BranchWhatsapp, {includeRelations: true}),
      },
    },
  })
  async findByPhone(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phoneNo: {type: 'string'},
            },
            required: ['phoneNo'],
          },
        },
      },
    })
    body: {
      phoneNo: string;
    },
  ): Promise<any> {
    const branchWhatsapp: any = await this.branchWhatsappRepository.findOne({
      where: {phoneNo: body.phoneNo},
      include: [{relation: 'branch'}],
    });

    if (!branchWhatsapp) {
      return null;
    }

    return {
      branchId: branchWhatsapp.branchId,
      branchName: branchWhatsapp.branch?.name,
    };
  }
}
