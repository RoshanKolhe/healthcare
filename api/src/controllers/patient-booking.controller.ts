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
  PatientBookingHistoryRepository,
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

    @repository(PatientBookingHistoryRepository)
    public patientBookingHistoryRepository: PatientBookingHistoryRepository,

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
      const endTime = new Date(`${dateString}T${endTimeStr}:00`);

      // 1️⃣ Check if slot is already booked
      const slot = await this.doctorTimeSlotRepository.findById(
        patientBooking.doctorTimeSlotId,
      );
      if (slot.isBooked) {
        throw new Error('This slot is already booked.');
      }

      // 2️⃣ Check if patient exists (by email or phoneNo)
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

      // 6️⃣ Create history snapshot ✅
      await this.patientBookingHistoryRepository.create(
        {
          patientBookingId: booking.id!,
          doctorTimeSlotId: booking.doctorTimeSlotId,
          date: new Date(dateString).toUTCString(),
          startTime: new Date(`${dateString}T${startTimeStr}:00`).toUTCString(),
          endTime: new Date(`${dateString}T${endTimeStr}:00`).toUTCString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        {transaction: tx},
      );

      // 7️⃣ Mark slot as booked
      await this.doctorTimeSlotRepository.updateById(
        patientBooking.doctorTimeSlotId,
        {isBooked: true},
        {transaction: tx},
      );

      // 8️⃣ Commit transaction
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

  // @patch('/patient-bookings/{id}')
  // @response(200, {
  //   description: 'PatientBooking PATCH success',
  //   content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             ...getModelSchemaRef(PatientBooking, {partial: true}).definitions
  //               ?.PatientBooking?.properties,
  //             date: {type: 'string', format: 'date'},
  //             startTime: {type: 'string'},
  //             endTime: {type: 'string'},
  //           },
  //         },
  //       },
  //     },
  //   })
  //   patientBooking: Partial<
  //     Omit<PatientBooking, 'date' | 'startTime' | 'endTime'>
  //   > & {
  //     date?: string;
  //     startTime?: string;
  //     endTime?: string;
  //   },
  // ): Promise<PatientBooking> {
  //   const repo = new DefaultTransactionalRepository(
  //     PatientBooking,
  //     this.dataSource,
  //   );
  //   const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

  //   try {
  //     // 1️⃣ Find the existing booking
  //     const existingBooking = await this.patientBookingRepository.findById(id);
  //     if (!existingBooking) throw new Error(`Booking with id ${id} not found`);

  //     // 2️⃣ Convert date/time strings to UTC if provided
  //     if (patientBooking.date) {
  //       const dateString = patientBooking.date;
  //       const startTimeStr = patientBooking.startTime || '00:00';
  //       const endTimeStr = patientBooking.endTime || '23:59';

  //       patientBooking.date = new Date(dateString).toUTCString();
  //       patientBooking.startTime = new Date(
  //         `${dateString}T${startTimeStr}:00`,
  //       ).toUTCString();
  //       patientBooking.endTime = new Date(
  //         `${dateString}T${endTimeStr}:00`,
  //       ).toUTCString();
  //     }

  //     // 3️⃣ If updating slot, check if new slot is free
  //     if (
  //       patientBooking.doctorTimeSlotId &&
  //       patientBooking.doctorTimeSlotId !== existingBooking.doctorTimeSlotId
  //     ) {
  //       const newSlot = await this.doctorTimeSlotRepository.findById(
  //         patientBooking.doctorTimeSlotId,
  //       );
  //       if (newSlot.isBooked) throw new Error('This slot is already booked.');

  //       // free old slot
  //       await this.doctorTimeSlotRepository.updateById(
  //         existingBooking.doctorTimeSlotId,
  //         {isBooked: false},
  //         {transaction: tx},
  //       );

  //       // mark new slot as booked
  //       await this.doctorTimeSlotRepository.updateById(
  //         patientBooking.doctorTimeSlotId,
  //         {isBooked: true},
  //         {transaction: tx},
  //       );
  //     }

  //     // 4️⃣ Update booking with new details
  //     await this.patientBookingRepository.updateById(id, patientBooking, {
  //       transaction: tx,
  //     });

  //     // 5️⃣ Commit transaction
  //     await tx.commit();

  //     // 6️⃣ Return updated booking
  //     return this.patientBookingRepository.findById(id);
  //   } catch (err) {
  //     await tx.rollback();
  //     throw err;
  //   }
  // }
  @patch('/patient-bookings/{id}/personal-info')
  @response(200, {
    description: 'Update personal info of a booking',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async updatePersonalInfo(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              purposeOfMeet: {type: 'string'},
              patientFullDetail: {type: 'object'},
            },
            additionalProperties: false, // Only allow these two fields
          },
        },
      },
    })
    bookingUpdate: {
      purposeOfMeet?: string;
      patientFullDetail?: object;
    },
  ): Promise<PatientBooking> {
    const txRepo = new DefaultTransactionalRepository(
      PatientBooking,
      this.dataSource,
    );
    const tx = await txRepo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // 1️⃣ Ensure booking exists
      const existingBooking = await this.patientBookingRepository.findById(id);
      if (!existingBooking) throw new Error(`Booking with id ${id} not found`);

      // 2️⃣ Apply only allowed updates
      const updateData: Partial<PatientBooking> = {};
      if (bookingUpdate.purposeOfMeet) {
        updateData.purposeOfMeet = bookingUpdate.purposeOfMeet;
      }
      if (bookingUpdate.patientFullDetail) {
        updateData.patientFullDetail = bookingUpdate.patientFullDetail;
      }
      updateData.updatedAt = new Date(); // audit timestamp

      // 3️⃣ Update in DB
      await this.patientBookingRepository.updateById(id, updateData, {
        transaction: tx,
      });

      // 4️⃣ Commit
      await tx.commit();

      // 5️⃣ Return updated booking
      return this.patientBookingRepository.findById(id);
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @patch('/patient-bookings/{id}/reschedule')
  @response(200, {
    description: 'Reschedule a patient booking and create history entry',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async rescheduleBooking(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              date: {type: 'string', format: 'date'},
              startTime: {type: 'string'}, // HH:mm
              endTime: {type: 'string'}, // HH:mm
              doctorId: {type: 'number'},
              doctorTimeSlotId: {type: 'number'},
            },
            required: [
              'date',
              'startTime',
              'endTime',
              'doctorId',
              'doctorTimeSlotId',
            ],
            additionalProperties: false,
          },
        },
      },
    })
    bookingUpdate: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: number;
      doctorTimeSlotId: number;
    },
  ): Promise<PatientBooking> {
    const repo = new DefaultTransactionalRepository(
      PatientBooking,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // 1️⃣ Find existing booking
      const existingBooking = await this.patientBookingRepository.findById(id);
      if (!existingBooking) throw new Error(`Booking with id ${id} not found`);

      // 2️⃣ Check if new slot is free
      const newSlot = await this.doctorTimeSlotRepository.findById(
        bookingUpdate.doctorTimeSlotId,
      );
      if (newSlot.isBooked) throw new Error('This slot is already booked.');

      // 3️⃣ Free old slot
      await this.doctorTimeSlotRepository.updateById(
        existingBooking.doctorTimeSlotId,
        {isBooked: false},
        {transaction: tx},
      );

      // 4️⃣ Convert date/time to UTC (same logic as POST)
      const dateString = String(bookingUpdate.date);
      const startTimeStr = String(bookingUpdate.startTime);
      const endTimeStr = String(bookingUpdate.endTime);

      const dateUTC = new Date(dateString).toUTCString();
      const startTimeUTC = new Date(
        `${dateString}T${startTimeStr}:00`,
      ).toUTCString();
      const endTimeUTC = new Date(
        `${dateString}T${endTimeStr}:00`,
      ).toUTCString();

      // 5️⃣ Update booking with new slot and times
      await this.patientBookingRepository.updateById(
        id,
        {
          date: dateUTC,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          doctorId: bookingUpdate.doctorId,
          doctorTimeSlotId: bookingUpdate.doctorTimeSlotId,
          updatedAt: new Date(),
        },
        {transaction: tx},
      );

      // 6️⃣ Mark new slot as booked
      await this.doctorTimeSlotRepository.updateById(
        bookingUpdate.doctorTimeSlotId,
        {isBooked: true},
        {transaction: tx},
      );

      // 7️⃣ Create history entry
      await this.patientBookingHistoryRepository.create(
        {
          patientBookingId: id,
          doctorTimeSlotId: bookingUpdate.doctorTimeSlotId,
          date: dateUTC,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        {transaction: tx},
      );

      // 8️⃣ Commit transaction
      await tx.commit();

      // 9️⃣ Return updated booking
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
