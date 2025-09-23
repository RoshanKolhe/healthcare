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
import {Prescription} from '../models';
import {PrescriptionRepository} from '../repositories';
import moment from 'moment-timezone';

export class PrescriptionController {
  constructor(
    @repository(PrescriptionRepository)
    public prescriptionRepository: PrescriptionRepository,
  ) {}

  @post('/prescriptions')
  @response(200, {
    description: 'Create multiple prescriptions',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Prescription, {
            title: 'NewPrescription',
            exclude: ['id'],
          }),
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Prescription, {
              title: 'NewPrescription',
              exclude: ['id'],
            }),
          },
        },
      },
    })
    prescriptions: Omit<Prescription, 'id'>[],
  ): Promise<Prescription[]> {
    return this.prescriptionRepository.createAll(prescriptions);
  }

  @get('/prescriptions')
  @response(200, {
    description: 'Array of Prescription model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Prescription, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Prescription) filter?: Filter<Prescription>,
  ): Promise<Prescription[]> {
    return this.prescriptionRepository.find(filter);
  }

  @get('/prescriptions/reminder')
  @response(200, {
    description: 'Array of reminder messages with phone numbers',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phoneNo: {type: 'string'},
              message: {type: 'string'},
            },
          },
        },
      },
    },
  })
  async getPrescriptionReminders(
    @param.filter(Prescription) filter?: Filter<Prescription>,
  ): Promise<any[]> {
    const now = new Date();
    const pollingWindowMs = 5 * 60 * 1000;

    const finalFilter: Filter<Prescription> = {
      ...filter,
      include: [
        {
          relation: 'patientBooking',
          scope: {
            include: [
              {
                relation: 'patient',
              },
            ],
          },
        },
      ],
    };

    const prescriptions = (await this.prescriptionRepository.find(
      finalFilter,
    )) as any[];

    const reminders: any[] = [];

    const checkTime = (timeVal?: string | Date) => {
      if (!timeVal) return false;

      let timeStr: string;
      if (timeVal instanceof Date) {
        timeStr = timeVal.toTimeString().slice(0, 5); // HH:mm
      } else {
        timeStr = timeVal;
      }

      const [hh, mm] = timeStr.split(':').map(Number);
      if (isNaN(hh) || isNaN(mm)) return false;

      const scheduled = new Date();
      scheduled.setHours(hh, mm, 0, 0);

      const diff = Math.abs(scheduled.getTime() - now.getTime());
      return diff <= pollingWindowMs;
    };

    for (const p of prescriptions) {
      if (!p.date || !p.days) continue;

      const startDate = new Date(p.date);
      const endDate = new Date(
        startDate.getTime() + (p.days - 1) * 24 * 60 * 60 * 1000,
      );

      if (now < startDate || now > endDate) continue;

      let matchedTime: string | null = null;
      if (checkTime(p.morningTime)) matchedTime = 'morning';
      else if (checkTime(p.afternoonTime)) matchedTime = 'afternoon';
      else if (checkTime(p.nightTime)) matchedTime = 'night';

      if (matchedTime) {
        const phoneNo = p.patientBooking?.patient?.phoneNo;
        reminders.push({
          phoneNo,
          message: `It's time to take your tablet "${p.tabletName}" for the ${matchedTime} dose (${p.foodTiming}).`,
        });
      }
    }

    return reminders;
  }

  @get('/prescriptions/{id}')
  @response(200, {
    description: 'Prescription model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Prescription, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Prescription, {exclude: 'where'})
    filter?: FilterExcludingWhere<Prescription>,
  ): Promise<Prescription> {
    return this.prescriptionRepository.findById(id, filter);
  }

  @patch('/prescriptions/{id}')
  @response(204, {
    description: 'Prescription PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prescription, {partial: true}),
        },
      },
    })
    prescription: Prescription,
  ): Promise<void> {
    await this.prescriptionRepository.updateById(id, prescription);
  }

  @del('/prescriptions/{id}')
  @response(204, {
    description: 'Prescription DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.prescriptionRepository.deleteById(id);
  }
}
