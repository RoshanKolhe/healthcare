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
import {Branch, Clinic} from '../models';
import {
  BranchDoctorRepository,
  BranchRepository,
  ClinicRepository,
  DoctorRepository,
} from '../repositories';

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
  ) {}

  @get('/branches/by-specialization/{specializationId}/{city}', {
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
    @param.path.number('specializationId') specializationId: number,
    @param.path.string('city') city: string,
  ): Promise<Clinic[] | {message: string}> {
    // Step 1: Get doctors with that specialization
    const doctors = await this.doctorRepository.find({
      where: {specializationId},
      fields: ['id'], // Get doctor IDs instead of branchId
    });
    if (!doctors.length) {
      return {message: `No clinic found at ${city}`};
    }
    // Step 2: Get branch-doctor relationships for these doctors
    const doctorIds = doctors
      .map(d => d.id)
      .filter((id): id is number => id !== undefined && id !== null);
    const branchDoctors = await this.branchDoctorRepository.find({
      where: {
        doctorId: {inq: doctorIds},
      },
      fields: ['branchId'],
    });
    if (!branchDoctors.length) {
      return {message: `No clinic found at ${city}`};
    }
    // Step 3: Get unique branch IDs
    const branchIds = [
      ...new Set(
        branchDoctors
          .map(bd => bd.branchId)
          .filter((id): id is number => id !== undefined && id !== null),
      ),
    ];
    if (!branchIds.length) {
      return {message: `No clinic found at ${city}`};
    }
    // Step 4: Filter those branches by city
    const branchesInCity = await this.branchRepository.find({
      where: {
        id: {inq: branchIds},
        city: city,
      },
      fields: ['id', 'clinicId'],
    });
    if (!branchesInCity.length) {
      return {message: `No clinic found at ${city}`};
    }
    const branchIdsInCity = branchesInCity
      .map(b => b.id)
      .filter((id): id is number => id !== undefined && id !== null);

    const clinicIds = [
      ...new Set(
        branchesInCity
          .map(b => b.clinicId)
          .filter((id): id is number => id !== undefined && id !== null),
      ),
    ];
    if (!clinicIds.length) {
      return {message: `No clinic found at ${city}`};
    }
    // Step 5: Fetch clinics with only matching branches
    const clinics = await this.clinicRepository.find({
      where: {id: {inq: clinicIds}},
      include: [
        {
          relation: 'branches',
          scope: {
            where: {
              id: {inq: branchIdsInCity},
              city: city,
            },
          },
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
