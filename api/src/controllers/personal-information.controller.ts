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
import {PatientBookingRepository, PersonalInformationRepository} from '../repositories';
import { CronJob, cronJob } from '@loopback/cron';
import moment from 'moment-timezone';
import axios from 'axios';

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

@cronJob()
export class PersonalIntakeReminderCron extends CronJob {
  constructor(
    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,
  ) {
    super({
      cronTime: '0 12 * * *',    
      // cronTime: '* * * * *',
      onTick: async () => {
        await this.runJob();
      },
      start: true,
      timeZone: 'Asia/Kolkata',
    });
  }

  async runJob() {
    const WEBHOOK_INTAKE_URL = process.env.WEBHOOK_URL;
    console.log('Webhook URL:', WEBHOOK_INTAKE_URL);
    try {
      const allBookings : any = await this.patientBookingRepository.find({
        include: [
          {
            relation: 'doctorTimeSlot',
            scope: {include: [{relation: 'doctorAvailability'}]},
          },
          {relation: 'personalInformation'},
        ],
      });

      const now = moment().tz('Asia/Kolkata');

      for (const booking of allBookings) {
        const slotStart = booking?.doctorTimeSlot?.slotStart
          ? moment(booking.doctorTimeSlot.slotStart).tz('Asia/Kolkata')
          : null;

        if (!slotStart || slotStart.isBefore(now)) continue;

        if (booking.personalInformation) continue;

        const phoneNo = booking?.patientFullDetail?.phoneNo;
        if (!phoneNo) continue;

        const payload = {
          patientBookingId: booking.id,
          phoneNo,
          message:"You haven't filled the personal intake detail, please fill the intake detail.",
        };

        await axios.post(`${WEBHOOK_INTAKE_URL}/intake_reminder `, payload);
      }

      console.log('Personal intake reminders sent successfully');
    } catch (error) {
      console.error('Error running Personal Intake Reminder cron:', error);
    }
  }
}
