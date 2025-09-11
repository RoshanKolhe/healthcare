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
import {Branch, Clinic} from '../models';
import {ClinicRepository, UserRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class ClinicController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
    @repository(ClinicRepository)
    public clinicRepository: ClinicRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/clinics/{id}/branches-by-city')
  async getBranchesByCity(
    @param.path.number('id') clinicId: number,
    @param.query.string('city') city: string,
  ): Promise<Branch[]> {
    return this.clinicRepository.branches(clinicId).find({
      where: {city: city},
    });
  }

  @get('/clinics-by-city')
  async getClinicsWithBranchesByCity(
    @param.query.string('city') city: string,
  ): Promise<(Clinic & {branches: Branch[]})[]> {
    return this.clinicRepository.find({
      include: [
        {
          relation: 'branches',
          scope: {
            where: {
              city: city,
            },
          },
        },
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/clinics')
  @response(200, {
    description: 'Clinic model instance',
    content: {'application/json': {schema: getModelSchemaRef(Clinic)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['clinic', 'branch'],
            properties: {
              clinic: getModelSchemaRef(Clinic, {
                title: 'NewClinic',
                exclude: ['id'],
              }),
              branch: {
                type: 'object',
                required: ['city', 'state', 'fullAddress', 'postalCode'],
                properties: {
                  city: {type: 'string'},
                  state: {type: 'string'},
                  fullAddress: {type: 'string'},
                  postalCode: {type: 'string'},
                },
              },
            },
          },
        },
      },
    })
    requestBody: {
      clinic: Omit<Clinic, 'id'>;
      branch: {
        city: string;
        state: string;
        fullAddress: string;
        postalCode: string;
      };
    },
  ): Promise<Clinic> {
    const {clinic, branch} = requestBody;

    const repo = new DefaultTransactionalRepository(Clinic, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const createdClinic = await this.clinicRepository.create(clinic, {
        transaction: tx,
      });

      const branchName = `${clinic.clinicName} - ${branch.city || 'City'}`;

      await this.clinicRepository.branches(createdClinic.id).create(
        {
          name: branchName,
          city: branch.city,
          state: branch.state,
          fullAddress: branch.fullAddress,
          country: clinic.country,
          postalCode: branch.postalCode,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {transaction: tx},
      );

      await tx.commit();
      return createdClinic;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLINIC,
        PermissionKeys.BRANCH,
      ],
    },
  })
  @get('/clinics')
  @response(200, {
    description: 'Array of Clinic model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Clinic, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(Clinic) filter?: Filter<Clinic>,
  ): Promise<Clinic[]> {
    // return this.clinicRepository.find({
    filter = {
      ...filter,
      include: [
        {relation: 'branches'},
        {relation: 'category'},
        {relation: 'clinicType'},
        {relation: 'clinicService'},
      ],
      order: ['createdAt DESC'],
      // });
    };
    const currentUserPermission = currentUser.permissions;

    // 🔹 Fetch full user details with clinic & branch relation
    const userDetails: any = await this.userRepository.findById(
      currentUser.id,
      {
        include: ['clinic', 'branch'],
      },
    );
    console.log('userDetails', userDetails);

    // SUPER ADMIN → see all clinics
    if (currentUserPermission.includes(PermissionKeys.SUPER_ADMIN)) {
      return this.clinicRepository.find(filter);
    }

    // CLINIC → only their own clinic
    if (currentUserPermission.includes(PermissionKeys.CLINIC)) {
      return this.clinicRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          id: userDetails.clinicId,
        },
      });
    }

    // BRANCH → get the clinic that owns this branch
    if (currentUserPermission.includes(PermissionKeys.BRANCH)) {
      return this.clinicRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          id: userDetails.branch?.clinicId,
        },
      });
    }
    return [];
  }

  @get('/clinics/{id}')
  @response(200, {
    description: 'Clinic model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Clinic, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Clinic, {exclude: 'where'})
    filter?: FilterExcludingWhere<Clinic>,
  ): Promise<Clinic> {
    return this.clinicRepository.findById(id, {
      ...filter,
      include: [
        {relation: 'branches'},
        {relation: 'category'},
        {relation: 'clinicType'},
        {relation: 'clinicService'},
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/clinics/{id}')
  @response(204, {
    description: 'Clinic PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clinic, {partial: true}),
        },
      },
    })
    clinic: Clinic,
  ): Promise<void> {
    console.log(clinic);
    await this.clinicRepository.updateById(id, clinic);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/clinics/{id}')
  @response(204, {
    description: 'Clinic DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clinicRepository.deleteById(id);
  }
}
