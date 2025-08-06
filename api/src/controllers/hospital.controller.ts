import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
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
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class HospitalController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
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
          schema: {
            type: 'object',
            required: ['hospital', 'branch'],
            properties: {
              hospital: getModelSchemaRef(Hospital, {
                title: 'NewHospital',
                exclude: ['id'],
              }),
              branch: {
                type: 'object',
                required: ['city', 'state', 'fullAddress' , 'postalCode'],
                properties: {
                  city: {type: 'string'},
                  state: {type: 'string'},
                  fullAddress: {type: 'string'},
                  postalCode: {type: 'number'},
                },
              },
            },
          },
        },
      },
    })
    requestBody: {
      hospital: Omit<Hospital, 'id'>;
      branch: {
        city: string;
        state: string;
        fullAddress: string;
        postalCode: number;
      };
    },
  ): Promise<Hospital> {
    const {hospital, branch} = requestBody;

    const repo = new DefaultTransactionalRepository(Hospital, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const createdHospital = await this.hospitalRepository.create(hospital, {
        transaction: tx,
      });

      const branchName = `${hospital.hospitalName} - ${branch.city || 'City'}`;

      await this.hospitalRepository.branches(createdHospital.id).create(
        {
          name: branchName,
          city: branch.city,
          state: branch.state,
          fullAddress: branch.fullAddress,
          country: hospital.country,
          postalCode: branch.postalCode,  
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {transaction: tx},
      );

      await tx.commit();
      return createdHospital;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

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
      include: [
        {relation: 'branches'},
        {relation: 'category'},
        {relation: 'hospitalType'},
        {relation: 'hospitalService'},
      ],
      order: ['createdAt DESC'],
    });
  }

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
      include: [
        {relation: 'branches'},
        {relation: 'category'},
        {relation: 'hospitalType'},
        {relation: 'hospitalService'},
      ],
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
