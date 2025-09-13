import {
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
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
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {DoctorTimeSlot, PatientBooking} from '../models';
import {
  DoctorRepository,
  DoctorTimeSlotRepository,
  PatientBookingHistoryRepository,
  PatientBookingRepository,
  PatientRepository,
  UserRepository,
} from '../repositories';
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {UserProfile} from '@loopback/security';

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

    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
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
            properties: {
              ...getModelSchemaRef(PatientBooking, {
                title: 'NewPatientBooking',
                exclude: ['id'],
              }).definitions?.PatientBooking?.properties,
              doctorId: {type: 'number'},
              doctorTimeSlotId: {type: 'number'},
              patientFullDetail: {
                type: 'object',
                properties: {
                  patientName: {type: 'string'},
                  phoneNo: {type: 'string'},
                  email: {type: 'string'},
                  age: {type: 'number'},
                  gender: {type: 'string'},
                },
              },
            },
          },
        },
      },
    })
    patientBooking: Omit<PatientBooking, 'id'> & {
      patientFullDetail?: {
        patientName: string;
        phoneNo: string;
        email: string;
        age: number;
        gender?: string;
      };
    },
  ): Promise<PatientBooking> {
    const repo = new DefaultTransactionalRepository(
      PatientBooking,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // 1️⃣ Check if slot is already booked
      const slot: any = await this.doctorTimeSlotRepository.findById(
        patientBooking.doctorTimeSlotId,
        {
          include: [
            {
              relation: 'doctorAvailability',
              scope: {
                include: [
                  {
                    relation: 'branch',
                  },
                ],
              },
            },
          ],
        },
      );
      if (slot.isBooked) {
        throw new Error('This slot is already booked.');
      }
      const clinicId = slot.doctorAvailability?.branch?.clinicId;
      const branchId = slot.doctorAvailability?.branchId;

      // 2️⃣ Check if patient exists (by email or phoneNo)
      let patient = await this.patientRepository.findOne({
        where: {
          or: [{phoneNo: patientBooking.patientFullDetail?.phoneNo}],
        },
      });

      // 3️⃣ If patient does not exist, create new
      if (!patient) {
        patient = await this.patientRepository.create(
          {
            patientName: patientBooking.patientFullDetail?.patientName,
            phoneNo: patientBooking.patientFullDetail?.phoneNo,
            email: patientBooking.patientFullDetail?.email,
            age: patientBooking.patientFullDetail?.age,
          },
          {transaction: tx},
        );
      }

      // 4️⃣ Set patientId and store full patient details in booking
      const patientBookingData: PatientBooking = {
        ...patientBooking,
        patientId: patient.id!,
        clinicId,
        branchId,
        patientFullDetail: {
          patientName: patientBooking.patientFullDetail?.patientName,
          phoneNo: patientBooking.patientFullDetail?.phoneNo,
          email: patientBooking.patientFullDetail?.email,
          age: patientBooking.patientFullDetail?.age,
          gender: patientBooking.patientFullDetail?.gender || 'Not Specified',
        },
        status: 0,
      };

      // 5️⃣ Create booking
      const booking = await this.patientBookingRepository.create(
        patientBookingData,
        {
          transaction: tx,
        },
      );

      // 6️⃣ Create history snapshot ✅
      await this.patientBookingHistoryRepository.create(
        {
          patientBookingId: booking.id!,
          doctorTimeSlotId: booking.doctorTimeSlotId,
        },
        {transaction: tx},
      );

      // 7️⃣ Mark slot as booked
      await this.doctorTimeSlotRepository.updateById(
        patientBooking.doctorTimeSlotId,
        {isBooked: 1},
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

  @get('/patient-bookings/all')
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
  async findall(
    @param.filter(PatientBooking) filter?: Filter<PatientBooking>,
  ): Promise<PatientBooking[]> {
    return this.patientBookingRepository.find({
      ...filter,
      include: [
        {
          relation: 'doctorTimeSlot',
          scope: {
            include: [{relation: 'doctorAvailability'}],
          },
        },
        {
          relation: 'referalManagement',
        }
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLINIC,
        PermissionKeys.BRANCH,
        PermissionKeys.DOCTOR,
      ],
    },
  })
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(PatientBooking) filter?: Filter<PatientBooking>,
  ): Promise<PatientBooking[]> {
    filter = {
      ...filter,
      include: [
        {
          relation: 'doctorTimeSlot',
          scope: {
            include: [
              {
                relation: 'doctorAvailability',
              },
            ],
          },
        },
        {
          relation: 'referalManagement',
        }
      ],
      order: ['createdAt DESC'],
    };

    const currentUserPermission = currentUser.permissions;
    const userDetails = await this.userRepository.findById(currentUser.id, {
      include: ['clinic', 'branch'], // <-- make sure User model has these relations
    });

    // SUPER ADMIN → all bookings
    if (currentUserPermission.includes(PermissionKeys.SUPER_ADMIN)) {
      return this.patientBookingRepository.find(filter);
    }

    // CLINIC → filter by clinicId
    if (currentUserPermission.includes(PermissionKeys.CLINIC)) {
      return this.patientBookingRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          clinicId: userDetails.clinicId,
        },
      });
    }

    // BRANCH → filter by branchId
    if (currentUserPermission.includes(PermissionKeys.BRANCH)) {
      return this.patientBookingRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          branchId: userDetails.branchId, // assuming currentUser.id = branchId
        },
      });
    }

    // DOCTOR → filter by doctorId
    console.log('currentUser', currentUser);
    if (currentUserPermission.includes(PermissionKeys.DOCTOR)) {
      return this.patientBookingRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          doctorId: currentUser.id, // assuming currentUser.id = doctorId
        },
      });
    }

    // default empty if no match
    return [];
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
    return this.patientBookingRepository.findById(id, {
      ...filter,
      include: [
        {
          relation: 'doctorTimeSlot',
          scope: {
            include: [{relation: 'doctorAvailability'}],
          },
        },
        {
          relation: 'patientBookingHistories',
        },
        {
          relation: 'referalManagement',
        },
      ],
    });
  }

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
              patientFullDetail: {
                type: 'object',
                properties: {
                  patientName: {type: 'string'},
                  email: {type: 'string'},
                  age: {type: 'number'},
                  gender: {type: 'string'},
                },
                additionalProperties: false,
              },
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
              doctorId: {type: 'number'},
              doctorTimeSlotId: {type: 'number'},
            },
            required: ['doctorId', 'doctorTimeSlotId'],
            additionalProperties: false,
          },
        },
      },
    })
    bookingUpdate: {
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
        {isBooked: 0},
        {transaction: tx},
      );

      // 5️⃣ Update booking with new slot and times
      await this.patientBookingRepository.updateById(
        id,
        {
          doctorId: bookingUpdate.doctorId,
          doctorTimeSlotId: bookingUpdate.doctorTimeSlotId,
          updatedAt: new Date(),
        },
        {transaction: tx},
      );

      // 6️⃣ Mark new slot as booked
      await this.doctorTimeSlotRepository.updateById(
        bookingUpdate.doctorTimeSlotId,
        {isBooked: 1},
        {transaction: tx},
      );

      // 7️⃣ Create history entry
      await this.patientBookingHistoryRepository.create(
        {
          patientBookingId: id,
          doctorTimeSlotId: bookingUpdate.doctorTimeSlotId,
          status: 1,
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

  @patch('/patient-bookings/{id}/cancel')
  @response(200, {
    description: 'Cancel a PatientBooking',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async cancelBooking(
    @param.path.number('id') bookingId: number,
  ): Promise<PatientBooking> {
    // Find booking
    const booking = await this.patientBookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpErrors.NotFound('Booking not found');
    }

    // Check if already cancelled
    if (booking.status === 2) {
      throw new HttpErrors.BadRequest('This booking is already cancelled.');
    }

    // Update booking status to Cancelled (2 in booking table)
    await this.patientBookingRepository.updateById(bookingId, {
      status: 2,
    });

    // Insert a history entry with status = 3 (cancelled in history table)
    await this.patientBookingHistoryRepository.create({
      patientBookingId: booking.id!,
      doctorTimeSlotId: booking.doctorTimeSlotId,
      status: 3, // cancelled in history
    });

    // Free the doctor’s slot again
    await this.doctorTimeSlotRepository.updateById(booking.doctorTimeSlotId, {
      isBooked: 0,
    });

    // Return updated booking
    return this.patientBookingRepository.findById(bookingId);
  }

  @del('/patient-bookings/{id}')
  @response(204, {
    description: 'PatientBooking DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientBookingRepository.deleteById(id);
  }

  // @get('/patient-bookings/reminders')
  // @response(200, {
  //   description: 'Get bookings for reminders',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(PatientBooking, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async getUpcomingBookingsForReminders(): Promise<PatientBooking[]> {
  //   const now = new Date().getTime();
  //   const pollingWindowMs = 5 * 60 * 1000;

  //   // Fetch bookings with related slot + availability
  //   const bookings = await this.patientBookingRepository.find({
  //     where: {status: 0}, // pending bookings only
  //     include: [
  //       {
  //         relation: 'doctorTimeSlot',
  //         scope: {include: ['doctorAvailability']},
  //       },
  //     ],
  //   });

  //   const filtered = bookings.filter((booking: any) => {
  //     const slot = booking.doctorTimeSlot;
  //     if (!slot || !slot.slotStart) return false;

  //     const startTime = new Date(slot.slotStart).getTime();
  //     const endTime = new Date(slot.slotEnd || startTime).getTime();

  //     const diffToStart = startTime - now;
  //     const diffToEnd = now - endTime;

  //     // Strict 1-hour before start (exact window: 1h ±10min)
  //     const is1HrBefore =
  //       diffToStart >=  60 * 60 * 1000 - pollingWindowMs &&
  //       diffToStart <=  60 * 60 * 1000 + pollingWindowMs;

  //     // Strict 1-day before start (exact window: 24h ±10min)
  //     const is1DayBefore =
  //       diffToStart >= 24 * 60 * 60 * 1000 - pollingWindowMs &&
  //       diffToStart <= 24 * 60 * 60 * 1000 + pollingWindowMs;

  //     // Strict 1-hour after end (exact window: 1h ±10min)
  //     const is1HrAfterEnd =
  //       diffToEnd >= 60 * 60 * 1000 - pollingWindowMs &&
  //       diffToEnd <= 60 * 60 * 1000 + pollingWindowMs;

  //     return is1HrBefore || is1DayBefore || is1HrAfterEnd;
  //   });

  //   return filtered;
  // }
  @get('/patient-bookings/reminders')
  @response(200, {
    description: 'Get bookings for reminders',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PatientBooking, {includeRelations: true}),
        },
      },
    },
  })
  async getUpcomingBookingsForReminders(
    @param.filter(PatientBooking) filter?: Filter<PatientBooking>,
    @param.query.string('reminderType')
    reminderType?: '1hrBefore' | '1dayBefore' | '1hrAfter',
  ): Promise<PatientBooking[]> {
    const now = new Date();
    const pollingWindowMs = 5 * 60 * 1000;

    const windows = {
      '1hrBefore': {
        min: new Date(now.getTime() + 60 * 60 * 1000 - pollingWindowMs),
        max: new Date(now.getTime() + 60 * 60 * 1000 + pollingWindowMs),
        field: 'slotStart',
      },
      '1dayBefore': {
        min: new Date(now.getTime() + 24 * 60 * 60 * 1000 - pollingWindowMs),
        max: new Date(now.getTime() + 24 * 60 * 60 * 1000 + pollingWindowMs),
        field: 'slotStart',
      },
      '1hrAfter': {
        min: new Date(now.getTime() - 60 * 60 * 1000 - pollingWindowMs),
        max: new Date(now.getTime() - 60 * 60 * 1000 + pollingWindowMs),
        field: 'slotEnd',
      },
    };

    // Merge default filter
    const finalFilter: Filter<PatientBooking> = {
      ...filter,
      where: {
        ...filter?.where,
        status: 0,
      },
      include: [
        {
          relation: 'doctorTimeSlot',
          scope: {include: ['doctorAvailability']},
        },
      ],
    };

    const bookings = await this.patientBookingRepository.find(finalFilter);

    // Filter based on query param
    const filtered = bookings.filter(
      (booking: PatientBooking & {doctorTimeSlot?: DoctorTimeSlot}) => {
        const slot = booking.doctorTimeSlot;
        if (!slot || !slot.slotStart) return false;

        if (!reminderType || !windows[reminderType]) {
          // If no param passed, return all 3 conditions
          const slotStart = new Date(slot.slotStart).getTime();
          const slotEnd = slot.slotEnd
            ? new Date(slot.slotEnd).getTime()
            : slotStart;

          const is1HrBefore =
            slotStart >= windows['1hrBefore'].min.getTime() &&
            slotStart <= windows['1hrBefore'].max.getTime();
          const is1DayBefore =
            slotStart >= windows['1dayBefore'].min.getTime() &&
            slotStart <= windows['1dayBefore'].max.getTime();
          const is1HrAfterEnd =
            slotEnd >= windows['1hrAfter'].min.getTime() &&
            slotEnd <= windows['1hrAfter'].max.getTime();

          return is1HrBefore || is1DayBefore || is1HrAfterEnd;
        }

        // If param passed, filter only for that type
        const window = windows[reminderType];
        const time =
          window.field === 'slotStart'
            ? new Date(slot.slotStart).getTime()
            : slot.slotEnd
              ? new Date(slot.slotEnd).getTime()
              : new Date(slot.slotStart).getTime();

        return time >= window.min.getTime() && time <= window.max.getTime();
      },
    );

    return filtered;
  }
}
