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
    description: 'Prescription model instance',
    content: {'application/json': {schema: getModelSchemaRef(Prescription)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prescription, {
            title: 'NewPrescription',
            exclude: ['id'],
          }),
        },
      },
    })
    prescription: Omit<Prescription, 'id'>,
  ): Promise<Prescription> {
    return this.prescriptionRepository.create(prescription);
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
    const now = moment().tz('Asia/Kolkata');
    const pollingWindowMs = 5 * 60 * 1000;

    console.log('Current time (IST):', now.format('YYYY-MM-DD HH:mm:ss'));

    const finalFilter: Filter<Prescription> = {
      ...filter,
      include: [
        {
          relation: 'patientBooking',
          scope: {
            include: [{relation: 'patient'}],
          },
        },
      ],
    };

    const prescriptions = (await this.prescriptionRepository.find(
      finalFilter,
    )) as any[];

    console.log('Total prescriptions fetched:', prescriptions.length);

    const reminders: any[] = [];

    const checkTime = (timeVal?: string | Date) => {
      if (!timeVal) return false;

      const scheduled = moment(timeVal).utc().tz('Asia/Kolkata');
      console.log(
        ' Checking time:',
        timeVal,
        '| parsed (IST):',
        scheduled.format('YYYY-MM-DD HH:mm:ss'),
      );

      const diff = Math.abs(scheduled.valueOf() - now.valueOf());
      console.log(' Time diff (ms):', diff);

      return diff <= pollingWindowMs;
    };

    for (const p of prescriptions) {
      console.log('---------------------------------------------');
      console.log('Prescription ID:', p.id, '| tabletName:', p.tabletName);

      if (!p.date || !p.days) {
        console.log('Skipped: missing date/days');
        continue;
      }

      const startDate = moment(p.date).tz('Asia/Kolkata');
      const endDate = startDate.clone().add(p.days - 1, 'days');

      console.log('Start Date:', startDate.format('YYYY-MM-DD'));
      console.log('End Date:', endDate.format('YYYY-MM-DD'));

      if (now.isBefore(startDate) || now.isAfter(endDate)) {
        console.log('Skipped: current date not in range');
        continue;
      }

      let matchedTime: string | null = null;
      if (checkTime(p.morningTime)) matchedTime = 'morning';
      else if (checkTime(p.afternoonTime)) matchedTime = 'afternoon';
      else if (checkTime(p.nightTime)) matchedTime = 'night';

      console.log('Matched Time:', matchedTime);

      if (matchedTime) {
        const phoneNo = p.patientBooking?.patient?.phoneNo;
        console.log('Phone:', phoneNo);

        reminders.push({
          phoneNo,
          message: `It's time to take your tablet "${p.tabletName}" for the ${matchedTime} dose (${p.foodTiming}).`,
        });
      }
    }

    console.log('Final reminders:', reminders);

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
