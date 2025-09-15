import {
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
import {PersonalInformation} from '../models';
import {PersonalInformationRepository} from '../repositories';

export class PersonalInformationController {
  constructor(
    @repository(PersonalInformationRepository)
    public personalInformationRepository: PersonalInformationRepository,
  ) {}

  @post('/personal-informations')
  @response(200, {
    description: 'PersonalInformation model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(PersonalInformation)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [],
            properties: {
              dob: {type: 'string', format: 'date'},
              residentialAddress: {type: 'string'},
              bloodGroup: {type: 'string'},
              chronicIllnesses: {type: 'string'},
              pastSurgeries: {type: 'string'},
              allergies: {type: 'string'},
              currentMedication: {type: 'string'},
              mainSymptoms: {type: 'string'},
              duration: {type: 'string'},
              painLevel: {type: 'string'},
              insuranceProvider: {type: 'string'},
              policyNumber: {type: 'string'},
              validityDate: {type: 'string', format: 'date'},
              emergencyName: {type: 'string'},
              emergencyPhoneNo: {type: 'string'},
              relationship: {type: 'string'},
              patientBookingId: {type: 'number'},
            },
          },
        },
      },
    })
    personalInformation: Omit<PersonalInformation, 'id'>,
  ): Promise<PersonalInformation> {
    return this.personalInformationRepository.create({
      ...personalInformation,
      dob: personalInformation.dob
        ? new Date(personalInformation.dob)
        : undefined,
      validityDate: personalInformation.validityDate
        ? new Date(personalInformation.validityDate)
        : undefined,
    });
  }

  @get('/personal-informations')
  @response(200, {
    description: 'Array of PersonalInformation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PersonalInformation, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(PersonalInformation) filter?: Filter<PersonalInformation>,
  ): Promise<PersonalInformation[]> {
    return this.personalInformationRepository.find(filter);
  }

  @get('/personal-informations/{id}')
  @response(200, {
    description: 'PersonalInformation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PersonalInformation, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PersonalInformation, {exclude: 'where'})
    filter?: FilterExcludingWhere<PersonalInformation>,
  ): Promise<PersonalInformation> {
    return this.personalInformationRepository.findById(id, filter);
  }

  @patch('/personal-informations/{id}')
  @response(204, {
    description: 'PersonalInformation PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PersonalInformation, {partial: true}),
        },
      },
    })
    personalInformation: PersonalInformation,
  ): Promise<void> {
    await this.personalInformationRepository.updateById(
      id,
      personalInformation,
    );
  }

  @del('/personal-informations/{id}')
  @response(204, {
    description: 'PersonalInformation DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.personalInformationRepository.deleteById(id);
  }
}
