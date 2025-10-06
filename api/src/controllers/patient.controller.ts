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
} from '@loopback/rest';
import {Patient} from '../models';
import {PatientBookingRepository, PatientRepository} from '../repositories';
import moment from 'moment-timezone';

export class PatientController {
  constructor(
    @repository(PatientRepository)
    public patientRepository: PatientRepository,

    @repository('PatientBookingRepository')
    public patientBookingRepository: PatientBookingRepository,
  ) {}

  @post('/patient-bookings/by-phone')
  @response(200, {
    description: 'Get upcoming bookings by phone number',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              patientBookingId: {type: 'number'},
              startDate: {type: 'string'},
              startTime: {type: 'string'},
              status: {type: 'number'},
            },
          },
        },
      },
    },
  })
  async getUpcomingBookingsByPhone(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['phoneNo'],
            properties: {
              phoneNo: {type: 'string'},
              status: {type: 'number'},
            },
          },
        },
      },
    })
    body: {
      phoneNo: string;
      status?: number;
    },
  ): Promise<any[]> {
    const {phoneNo, status} = body;

    // 1️⃣ Find patient by phoneNo
    const patient = await this.patientRepository.findOne({
      where: {phoneNo},
    });

    if (!patient) return [];

    const now = new Date();

    // 2️⃣ Get all bookings of this patient including doctorTimeSlot
    const bookings = await this.patientBookingRepository.find({
      where: {patientId: patient.id},
      include: [
        {
          relation: 'doctorTimeSlot',
        },
      ],
    });

    let upcoming = bookings.filter((b: any) => {
      const slot = b.doctorTimeSlot;
      if (!slot?.slotStart) return false;

      const bookingDateTime = new Date(slot.slotStart);
      return bookingDateTime >= now;
    });

    if (typeof status !== 'undefined') {
      upcoming = upcoming.filter((b: any) => b.status === status);
    }

    // 4️⃣ Return simplified data
    return upcoming.map((b: any) => {
      const slotStart = b.doctorTimeSlot?.slotStart
        ? moment(b.doctorTimeSlot.slotStart).tz('Asia/Kolkata')
        : null;

      return {
        patientBookingId: b.id,
        startDate: slotStart ? slotStart.format('YYYY-MM-DD') : null,
        startTime: slotStart ? slotStart.format('HH:mm') : null,
      };
    });
  }

  @get('/patients')
  @response(200, {
    description: 'Array of Patient model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Patient, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Patient) filter?: Filter<Patient>,
  ): Promise<Patient[]> {
    return this.patientRepository.find(filter);
  }

  @get('/patients/{id}')
  @response(200, {
    description: 'Patient model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Patient, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Patient, {exclude: 'where'})
    filter?: FilterExcludingWhere<Patient>,
  ): Promise<Patient> {
    return this.patientRepository.findById(id, filter);
  }

  @patch('/patients/{id}')
  @response(204, {
    description: 'Patient PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {partial: true}),
        },
      },
    })
    patient: Patient,
  ): Promise<void> {
    await this.patientRepository.updateById(id, patient);
  }

  @del('/patients/{id}')
  @response(204, {
    description: 'Patient DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientRepository.deleteById(id);
  }
}
