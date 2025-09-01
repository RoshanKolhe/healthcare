import {
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
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {PatientBooking} from '../models';
import {
  DoctorTimeSlotRepository,
  PatientBookingRepository,
  PatientRepository,
} from '../repositories';
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PatientBookingController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,

    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,

    @repository(PatientRepository)
    public patientRepository: PatientRepository,

    @repository(DoctorTimeSlotRepository)
    public doctorTimeSlotRepository: DoctorTimeSlotRepository,
  ) {}

  @post('/patient-bookings')
  @response(200, {
    description: 'PatientBooking model instance',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['date', 'startTime', 'endTime'],
            properties: {
              ...getModelSchemaRef(PatientBooking, {
                title: 'NewPatientBooking',
                exclude: ['id'],
              }).definitions?.PatientBooking?.properties,

              date: {
                type: 'string',
                format: 'date',
              },
              startTime: {
                type: 'string',
              },
              endTime: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    patientBooking: Omit<
      PatientBooking,
      'id' | 'date' | 'startTime' | 'endTime'
    > & {
      date: string;
      startTime: string;
      endTime: string;
    },
  ): Promise<PatientBooking> {
    const repo = new DefaultTransactionalRepository(
      PatientBooking,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const dateString = String(patientBooking.date);
      const startTimeStr = String(patientBooking.startTime);
      const endTimeStr = String(patientBooking.endTime);
      const date = new Date(dateString);
      const startTime = new Date(`${dateString}T${startTimeStr}:00`);
      console.log('start time', patientBooking.startTime, startTime);
      const endTime = new Date(`${dateString}T${endTimeStr}:00`);

      // 1️⃣ Check if slot is already booked
      const slot = await this.doctorTimeSlotRepository.findById(
        patientBooking.doctorTimeSlotId,
      );
      if (slot.isBooked) {
        throw new Error('This slot is already booked.');
      }
      // 2️⃣ Check if patient exists (by email or phoneNo) using PatientRepository
      let patient = await this.patientRepository.findOne({
        where: {
          or: [
            {email: (patientBooking.patientFullDetail as any)?.email},
            {phoneNo: (patientBooking.patientFullDetail as any)?.phoneNo},
          ],
        },
      });

      // 3️⃣ If patient does not exist, create new
      if (!patient) {
        patient = await this.patientRepository.create(
          {
            patientName: (patientBooking.patientFullDetail as any)?.patientName,
            phoneNo: (patientBooking.patientFullDetail as any)?.phoneNo,
            email: (patientBooking.patientFullDetail as any)?.email,
            age: (patientBooking.patientFullDetail as any)?.age,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          },
          {transaction: tx},
        );
      }
      // 4️⃣ Set patientId and store full patient details in booking
      patientBooking.patientId = patient.id!;
      patientBooking.patientFullDetail = {
        patientName: patient.patientName,
        phoneNo: patient.phoneNo,
        email: patient.email,
        age: patient.age,
        gender:
          (patientBooking.patientFullDetail as any)?.gender || 'Not Specified',
      };
      patientBooking.date = date.toUTCString();
      patientBooking.startTime = startTime.toUTCString();
      patientBooking.endTime = endTime.toUTCString();

      // 5️⃣ Create booking
      const booking = await this.patientBookingRepository.create(
        patientBooking,
        {
          transaction: tx,
        },
      );

      // 6️⃣ Mark slot as booked
      await this.doctorTimeSlotRepository.updateById(
        patientBooking.doctorTimeSlotId,
        {isBooked: true},
        {transaction: tx},
      );

      // 7️⃣ Commit transaction
      await tx.commit();

      return booking;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @get('/patient-bookings')
  @response(200, {
    description: 'Array of PatientBooking model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PatientBooking, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PatientBooking) filter?: Filter<PatientBooking>,
  ): Promise<PatientBooking[]> {
    return this.patientBookingRepository.find(filter);
  }

  @get('/patient-bookings/{id}')
  @response(200, {
    description: 'PatientBooking model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PatientBooking, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PatientBooking, {exclude: 'where'})
    filter?: FilterExcludingWhere<PatientBooking>,
  ): Promise<PatientBooking> {
    return this.patientBookingRepository.findById(id, filter);
  }

  @patch('/patient-bookings/{id}')
  @response(200, {
    description: 'PatientBooking PATCH success',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(PatientBooking, {partial: true}).definitions
                ?.PatientBooking?.properties,
              date: {type: 'string', format: 'date'},
              startTime: {type: 'string'},
               endTime: {type: 'string'},
            },
          },
        },
      },
    })
    patientBooking: Partial<
      Omit<PatientBooking, 'date' | 'startTime' | 'endTime'>
    > & {
      date?: string;
      startTime?: string;
      endTime?: string;
    },
  ): Promise<PatientBooking> {
    const repo = new DefaultTransactionalRepository(
      PatientBooking,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // 1️⃣ Find the existing booking
      const existingBooking = await this.patientBookingRepository.findById(id);
      if (!existingBooking) throw new Error(`Booking with id ${id} not found`);

      // 2️⃣ Convert date/time strings to UTC if provided
      if (patientBooking.date) {
        const dateString = patientBooking.date;
        const startTimeStr = patientBooking.startTime || '00:00';
        const endTimeStr = patientBooking.endTime || '23:59';

        patientBooking.date = new Date(dateString).toUTCString();
        patientBooking.startTime = new Date(
          `${dateString}T${startTimeStr}:00`,
        ).toUTCString();
        patientBooking.endTime = new Date(
          `${dateString}T${endTimeStr}:00`,
        ).toUTCString();
      }

      // 3️⃣ If updating slot, check if new slot is free
      if (
        patientBooking.doctorTimeSlotId &&
        patientBooking.doctorTimeSlotId !== existingBooking.doctorTimeSlotId
      ) {
        const newSlot = await this.doctorTimeSlotRepository.findById(
          patientBooking.doctorTimeSlotId,
        );
        if (newSlot.isBooked) throw new Error('This slot is already booked.');

        // free old slot
        await this.doctorTimeSlotRepository.updateById(
          existingBooking.doctorTimeSlotId,
          {isBooked: false},
          {transaction: tx},
        );

        // mark new slot as booked
        await this.doctorTimeSlotRepository.updateById(
          patientBooking.doctorTimeSlotId,
          {isBooked: true},
          {transaction: tx},
        );
      }

      // 4️⃣ Update booking with new details
      await this.patientBookingRepository.updateById(id, patientBooking, {
        transaction: tx,
      });

      // 5️⃣ Commit transaction
      await tx.commit();

      // 6️⃣ Return updated booking
      return this.patientBookingRepository.findById(id);
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @del('/patient-bookings/{id}')
  @response(204, {
    description: 'PatientBooking DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientBookingRepository.deleteById(id);
  }
}
