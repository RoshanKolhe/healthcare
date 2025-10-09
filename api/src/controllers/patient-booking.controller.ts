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
  ClinicSubscriptionRepository,
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

    @repository('ClinicSubscriptionRepository')
    public clinicSubscriptionRepository: ClinicSubscriptionRepository,
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
  ): Promise<any> {
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

      const latestSubscription =
        await this.clinicSubscriptionRepository.findOne({
          where: {clinicId},
          order: ['createdAt DESC'], // get latest subscription
        });

      if (latestSubscription) {
        const updatedUsage = (latestSubscription.clinicBookingUsage || 0) + 1;
        const updatedRemaining =
          (latestSubscription.bookingLimit || 0) - updatedUsage;

        await this.clinicSubscriptionRepository.updateById(
          latestSubscription.id!,
          {
            clinicBookingUsage: updatedUsage,
            remainingBookingLimit: updatedRemaining >= 0 ? updatedRemaining : 0,
          },
          {transaction: tx},
        );
      }

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

      // return booking;
      return {
        success: true,
        message: `Your booking created successfully`,
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @patch('/patient-bookings/{id}')
  @response(200, {
    description: 'Update booking status',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async updateStatus(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: {type: 'number'},
            },
          },
        },
      },
    })
    data: {status: number},
  ): Promise<object> {
    await this.patientBookingRepository.updateById(id, data);
    console.log('Updating booking id:', id, 'with data:', data);
    return {success: true, message: 'Booking status updated successfully'};
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
        },
        {
          relation: 'reportSummary',
        },
        {
          relation: 'personalInformation',
        },
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
        },
        {
          relation: 'reportSummary',
        },
        {
          relation: 'personalInformation',
        },
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
        {
          relation: 'personalInformation',
        },
        {
          relation: 'reportSummary',
        },
      ],
    });
  }

  @get('/patient-bookings/{id}/show-doctor-branch')
  @response(200, {
    description: 'Get doctorId and branchId for a patient booking',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            doctorId: {type: 'number'},
            branchId: {type: 'number'},
          },
        },
      },
    },
  })
  async getDoctorAndBranchByBookingId(
    @param.path.number('id') id: number,
  ): Promise<{doctorId: number; branchId: number}> {
    const booking: any = await this.patientBookingRepository.findById(id, {
      include: [
        {
          relation: 'doctorTimeSlot',
          scope: {
            include: [{relation: 'doctorAvailability'}],
          },
        },
      ],
    });

    // branchId can be directly from booking or from doctorAvailability
    const branchId =
      booking.branchId ||
      booking.doctorTimeSlot?.doctorAvailability?.branchId ||
      null;

    return {
      doctorId: booking.doctorId,
      branchId: branchId,
    };
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
  ): Promise<any> {
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
      // return this.patientBookingRepository.findById(id);
      return {
        success: true,
        message: `Your appointment reschedule successfully`,
      };
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
  ): Promise<any> {
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
    // return this.patientBookingRepository.findById(bookingId);
    return {
      success: true,
      message: `Your appointment cancel successfully`,
    };
  }

  @patch('/patient-bookings/{id}/soap-file')
  @response(200, {
    description: 'Update only the file object of a booking',
    content: {'application/json': {schema: getModelSchemaRef(PatientBooking)}},
  })
  async updateBookingFile(
    @param.path.number('id') id: number,
    @requestBody({
      description: 'File object to update',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              file: {type: 'object'},
              soapSummary: {type: 'string'},
            },
            // required: ['file' , 'soapSummary'],
            additionalProperties: false,
          },
        },
      },
    })
    body: {file: object; soapSummary: string},
  ): Promise<PatientBooking> {
    const txRepo = new DefaultTransactionalRepository(
      PatientBooking,
      this.patientBookingRepository.dataSource,
    );
    const tx = await txRepo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const existingBooking = await this.patientBookingRepository.findById(id);
      if (!existingBooking) {
        throw new Error(`Booking with id ${id} not found`);
      }

      await this.patientBookingRepository.updateById(
        id,
        {
          file: body.file,
          soapSummary: body.soapSummary,
          updatedAt: new Date(),
        },
        {transaction: tx},
      );

      // 3️⃣ Commit
      await tx.commit();

      // 4️⃣ Return updated booking
      return this.patientBookingRepository.findById(id);
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  @del('/patient-bookings/{id}')
  @response(204, {
    description: 'PatientBooking DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientBookingRepository.deleteById(id);
  }

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
    reminderType?: '1hrBefore' | '1dayBefore' | '1hrAfter' | '7dayBefore',
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
      '7dayBefore': {
        min: new Date(
          now.getTime() + 24 * 7 * 60 * 60 * 1000 - pollingWindowMs,
        ),
        max: new Date(
          now.getTime() + 24 * 7 * 60 * 60 * 1000 + pollingWindowMs,
        ),
        field: 'slotStart',
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

          const is7DayBefore =
            slotStart >= windows['7dayBefore'].min.getTime() &&
            slotStart <= windows['7dayBefore'].max.getTime();

          return is1HrBefore || is1DayBefore || is1HrAfterEnd || is7DayBefore;
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
