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
import {Branch, Clinic, Doctor} from '../models';
import {
  BranchDoctorRepository,
  BranchRepository,
  ClinicRepository,
  DoctorRepository,
  UserRepository,
} from '../repositories';
import {UserProfile} from '@loopback/security';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {PermissionKeys} from '../authorization/permission-keys';

export class BranchController {
  constructor(
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
    @repository(ClinicRepository)
    public clinicRepository: ClinicRepository,
    @repository(BranchDoctorRepository)
    public branchDoctorRepository: BranchDoctorRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/branches/by-specialization', {
    responses: {
      '200': {
        description:
          'Get clinics (with branches) based on specialization and city',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  type: 'array',
                  items: getModelSchemaRef(Clinic, {includeRelations: true}),
                },
                {type: 'object', properties: {message: {type: 'string'}}},
              ],
            },
          },
        },
      },
    },
  })
  async getClinicsWithBranchesBySpecializationAndCity(
    @param.query.number('specializationId') specializationId: number,
    @param.query.string('city') city: string,
  ): Promise<Clinic[] | {message: string}> {
    const doctors = await this.doctorRepository.find({
      where: {specializationId},
      fields: ['id'],
    });
    if (!doctors.length) {
      return {message: `No clinic found at ${city}`};
    }

    const doctorIds = doctors.map(d => d.id!).filter(Boolean);
    const branchDoctors = await this.branchDoctorRepository.find({
      where: {doctorId: {inq: doctorIds}},
      fields: ['branchId'],
    });
    if (!branchDoctors.length) {
      return {message: `No clinic found at ${city}`};
    }

    const branchIds = [
      ...new Set(branchDoctors.map(bd => bd.branchId!).filter(Boolean)),
    ];
    const branchesInCity = await this.branchRepository.find({
      where: {id: {inq: branchIds}, city},
      fields: ['id', 'clinicId'],
    });
    if (!branchesInCity.length) {
      return {message: `No clinic found at ${city}`};
    }

    const branchIdsInCity = branchesInCity.map(b => b.id!).filter(Boolean);
    const clinicIds = [
      ...new Set(branchesInCity.map(b => b.clinicId!).filter(Boolean)),
    ];

    const clinics = await this.clinicRepository.find({
      where: {id: {inq: clinicIds}},
      include: [
        {
          relation: 'branches',
          scope: {where: {id: {inq: branchIdsInCity}, city}},
        },
      ],
    });

    if (!clinics.length) {
      return {message: `No clinic found at ${city}`};
    }
    return clinics;
  }

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

  @get('/doctors/by-specialization-and-branch', {
    responses: {
      '200': {
        description: 'Get doctors by specialization and branch',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  type: 'array',
                  items: getModelSchemaRef(Doctor, {includeRelations: true}),
                },
                {type: 'object', properties: {message: {type: 'string'}}},
              ],
            },
          },
        },
      },
    },
  })
  async getDoctorsBySpecializationAndBranch(
    @param.query.number('specializationId') specializationId: number,
    @param.query.number('branchId') branchId: number,
  ): Promise<Doctor[] | {message: string}> {
    // Step 1: Get doctors matching the specialization
    const doctorsWithSpecialization = await this.doctorRepository.find({
      where: {specializationId},
      fields: ['id'],
    });
    if (!doctorsWithSpecialization.length) {
      return {
        message: `No doctors found for specialization ${specializationId}`,
      };
    }

    const doctorIds = doctorsWithSpecialization.map(d => d.id!).filter(Boolean);

    // Step 2: Find doctors linked to the branch
    const branchDoctorLinks = await this.branchDoctorRepository.find({
      where: {branchId, doctorId: {inq: doctorIds}},
      fields: ['doctorId'],
    });
    if (!branchDoctorLinks.length) {
      return {message: `No doctors found for this branch`};
    }

    const matchedDoctorIds = [
      ...new Set(branchDoctorLinks.map(link => link.doctorId!).filter(Boolean)),
    ];

    // Step 3: Get full doctor details
    const doctors = await this.doctorRepository.find({
      where: {id: {inq: matchedDoctorIds}},
      // include: [{relation: 'branches'}], // optional if you want branch info
    });

    return doctors.length
      ? doctors
      : {message: `No doctors found for given criteria`};
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLINIC],
    },
  })
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
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(Branch) filter?: Filter<Branch>,
  ): Promise<Branch[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [{relation: 'clinic'}],
    };
    const currentUserPermission = currentUser.permissions;

    const userDetails: any = await this.userRepository.findById(
      currentUser.id,
      {
        include: ['clinic', 'branch'],
      },
    );
    console.log('userDetails', userDetails);

    if (currentUserPermission.includes(PermissionKeys.SUPER_ADMIN)) {
      return this.branchRepository.find(filter);
    }

    if (currentUserPermission.includes(PermissionKeys.CLINIC)) {
      return this.branchRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          clinicId: userDetails.clinicId,
        },
      });
    }
    return [];
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
