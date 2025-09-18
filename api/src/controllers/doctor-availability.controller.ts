import {
  Count,
  CountSchema,
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
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {DoctorAvailability, DoctorTimeSlot, PatientBooking} from '../models';
import {
  DoctorAvailabilityRepository,
  DoctorTimeSlotRepository,
  PatientBookingHistoryRepository,
  PatientBookingRepository,
} from '../repositories';
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';
import moment from 'moment-timezone';
import axios from 'axios';

export class DoctorAvailabilityController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
    @repository(DoctorAvailabilityRepository)
    public doctorAvailabilityRepository: DoctorAvailabilityRepository,
    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,
    @repository(DoctorTimeSlotRepository)
    public doctorTimeSlotRepository: DoctorTimeSlotRepository,
    @repository(PatientBookingHistoryRepository)
    public patientBookingHistoryRepository: PatientBookingHistoryRepository,
  ) {}

  @post('/doctor-availabilities')
  @response(200, {
    description: 'DoctorAvailability model instances with slots',
  })
  async create(
    @requestBody()
    doctorAvailability: Omit<DoctorAvailability, 'id'> & {
      doctorTimeSlots?: Omit<DoctorTimeSlot, 'id' | 'doctorAvailabilityId'>[];
      customDates?: string[];
    },
  ): Promise<DoctorAvailability[]> {
    const {
      doctorTimeSlots,
      startDate,
      endDate,
      dayOfWeek,
      customDates,
      ...rest
    } = doctorAvailability;

    if (!doctorTimeSlots || doctorTimeSlots.length === 0) {
      throw new HttpErrors.BadRequest(
        'Doctor availability must include at least one time slot',
      );
    }

    const repo = new DefaultTransactionalRepository(
      DoctorAvailability,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const datesToCreate: Date[] = [];

      if (customDates && customDates.length) {
        datesToCreate.push(
          ...customDates.map(d => {
            const dt = moment.tz(d, 'Asia/Kolkata').startOf('day');
            return dt.toDate();
          }),
        );
      } else if (startDate && endDate && dayOfWeek?.length) {
        let current = moment.tz(startDate, 'Asia/Kolkata').startOf('day');
        let end = moment.tz(endDate, 'Asia/Kolkata').endOf('day');

        while (current.isSameOrBefore(end)) {
          const weekday = current.day(); // IST weekday
          if (dayOfWeek.includes(weekday)) {
            datesToCreate.push(current.clone().toDate());
          }
          current.add(1, 'day');
        }
      } else {
        throw new HttpErrors.BadRequest(
          'Either customDates or startDate/endDate with dayOfWeek must be provided',
        );
      }

      if (datesToCreate.length === 0) {
        throw new HttpErrors.BadRequest(
          'No valid dates generated for availability (check dayOfWeek and date range)',
        );
      }

      // Fetch all active availabilities for this doctor
      const existingAvailabilities =
        await this.doctorAvailabilityRepository.find({
          where: {doctorId: rest.doctorId, isActive: true},
          include: [{relation: 'doctorTimeSlots'}],
        });

      const isOverlapping = (
        startA: Date,
        endA: Date,
        startB: Date,
        endB: Date,
      ) => startA < endB && startB < endA;

      for (const date of datesToCreate) {
        for (const slot of doctorTimeSlots) {
          const slotStart = new Date(
            date.toDateString() +
              ' ' +
              new Date(slot.slotStart!).toTimeString(),
          );
          const slotEnd = new Date(
            date.toDateString() + ' ' + new Date(slot.slotEnd!).toTimeString(),
          );

          const formatTimeOnly = (date: Date): string => {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          };

          for (const existing of existingAvailabilities) {
            for (const existingSlot of existing.doctorTimeSlots || []) {
              const existDate = new Date(existing.startDate);
              if (existDate.toDateString() !== date.toDateString()) continue;

              const existSlotStart = new Date(
                existDate.toDateString() +
                  ' ' +
                  new Date(existingSlot.slotStart).toTimeString(),
              );
              const existSlotEnd = new Date(
                existDate.toDateString() +
                  ' ' +
                  new Date(existingSlot.slotEnd).toTimeString(),
              );

              if (
                isOverlapping(slotStart, slotEnd, existSlotStart, existSlotEnd)
              ) {
                throw new HttpErrors.BadRequest(
                  `Doctor already has a slot overlapping on ${date.toDateString()} from ${formatTimeOnly(
                    existSlotStart,
                  )} to ${formatTimeOnly(existSlotEnd)}`,
                );
              }
            }
          }
        }
      }

      const createdAvailabilities: DoctorAvailability[] = [];
      for (const date of datesToCreate) {
        const availability = await this.doctorAvailabilityRepository.create(
          {
            ...rest,
            startDate: date,
            endDate: date,
            dayOfWeek: [moment.tz(date, 'Asia/Kolkata').day()],
          },
          {transaction: tx},
        );

        const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(
          availability.id,
        );
        for (const slot of doctorTimeSlots) {
          await slotsRepo.create(
            {...slot, doctorAvailabilityId: availability.id},
            {transaction: tx},
          );
        }

        createdAvailabilities.push(availability);
      }

      await tx.commit();

      return this.doctorAvailabilityRepository.find({
        where: {id: {inq: createdAvailabilities.map(a => a.id)}},
        include: [{relation: 'doctorTimeSlots'}],
      });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  //needs to check for time zone issues
  // @post('/doctor-availabilities/daily-slots')
  // @response(200, {
  //   description: 'Daily doctor availabilities with nested time slots',
  // })
  // async getDailySlotsPost(
  //   @requestBody({
  //     description: 'Doctor and branch info for fetching daily slots',
  //     required: true,
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             doctorId: {type: 'number'},
  //             branchId: {type: 'number'}, // optional
  //           },
  //           required: ['doctorId'],
  //         },
  //       },
  //     },
  //   })
  //   body: {
  //     doctorId: number;
  //     branchId?: number;
  //   },
  // ): Promise<any> {
  //   const {doctorId, branchId} = body;

  //   const availabilities = await this.doctorAvailabilityRepository.find({
  //     where: {
  //       doctorId,
  //       isActive: true,
  //       ...(branchId ? {branchId} : {}),
  //     },
  //     include: [{relation: 'branch'}, {relation: 'doctorTimeSlots'}],
  //   });

  //   const next3Days = Array.from({length: 3}, (_, i) => {
  //     const d = new Date();
  //     d.setDate(d.getDate() + i);
  //     // ✅ Format in IST instead of UTC
  //     return d.toISOString().split('T')[0];
  //   });

  //   const result: any = {};
  //   availabilities.forEach(avail => {
  //     const bId = avail.branch?.id || 'unknown';
  //     const branchName = avail.branch?.name || '';
  //     const branchAddress = avail.branch?.fullAddress || '';

  //     if (!result[bId]) {
  //       result[bId] = {
  //         branchId: bId,
  //         branchName,
  //         branchAddress,
  //         availableDates: [],
  //       };
  //     }

  //     next3Days.forEach(dateStr => {
  //       const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  //       const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  //       const availStart = new Date(avail.startDate);
  //       const availEnd = new Date(avail.endDate);

  //       if (availEnd < dayStart || availStart > dayEnd) return;

  //       let dateEntry = result[bId].availableDates.find(
  //         (d: {date: string}) => d.date === dateStr,
  //       );
  //       if (!dateEntry) {
  //         dateEntry = {
  //           // date: dateStr,
  //           date: dayStart.toISOString(),
  //           availabilities: [],
  //         };
  //         result[bId].availableDates.push(dateEntry);
  //       }

  //       const slots = (avail.doctorTimeSlots || []).map(slot => ({
  //         slotId: slot.id,
  //         // ✅ convert slot start/end to IST before sending
  //         startTime: new Date(slot.slotStart).toISOString(),
  //         endTime: new Date(slot.slotEnd).toISOString(),
  //         isBooked: slot.isBooked,
  //       }));

  //       dateEntry.availabilities.push({
  //         availabilityId: avail.id,
  //         startDate: new Date(avail.startDate).toISOString(), // ✅ IST
  //         endDate: new Date(avail.endDate).toISOString(), // ✅ IST
  //         doctorId: avail.doctorId,
  //         isActive: avail.isActive,
  //         timeSlots: slots,
  //       });
  //     });
  //   });

  //   return Object.values(result);
  // }

  @post('/doctor-availabilities/daily-slots')
  @response(200, {
    description: 'Daily doctor availabilities with nested time slots',
  })
  async getDailySlotsPost(
    @requestBody({
      description: 'Doctor and branch info for fetching daily slots',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              doctorId: {type: 'number'},
              branchId: {type: 'number'},
            },
            required: ['doctorId'],
          },
        },
      },
    })
    body: {
      doctorId: number;
      branchId?: number;
    },
  ): Promise<any> {
    const {doctorId, branchId} = body;

    const availabilities = await this.doctorAvailabilityRepository.find({
      where: {
        doctorId,
        isActive: true,
        ...(branchId ? {branchId} : {}),
      },
      include: [{relation: 'branch'}, {relation: 'doctorTimeSlots'}],
    });

    const next3Days = Array.from({length: 3}, (_, i) =>
      moment().tz('Asia/Kolkata').startOf('day').add(i, 'days'),
    );

    const result: any = {};

    availabilities.forEach(avail => {
      const bId = avail.branch?.id || 'unknown';
      const branchName = avail.branch?.name || '';
      const branchAddress = avail.branch?.fullAddress || '';

      if (!result[bId]) {
        result[bId] = {
          branchId: bId,
          branchName,
          branchAddress,
          availableDates: [],
        };
      }

      next3Days.forEach(dayMoment => {
        const dayStart = dayMoment.clone().startOf('day').toDate();
        const dayEnd = dayMoment.clone().endOf('day').toDate();

        const availStart = new Date(avail.startDate);
        const availEnd = new Date(avail.endDate);

        if (availEnd < dayStart || availStart > dayEnd) return;

        const dateStr = dayMoment.format('YYYY-MM-DD');

        let dateEntry = result[bId].availableDates.find(
          (d: {date: string}) => d.date === dateStr,
        );
        if (!dateEntry) {
          dateEntry = {
            date: dateStr,
            availabilities: [],
          };
          result[bId].availableDates.push(dateEntry);
        }

        const slots = (avail.doctorTimeSlots || []).map(slot => ({
          slotId: slot.id,
          startTime: moment(slot.slotStart).tz('Asia/Kolkata').toISOString(),
          endTime: moment(slot.slotEnd).tz('Asia/Kolkata').toISOString(),
          isBooked: slot.isBooked,
        }));

        dateEntry.availabilities.push({
          availabilityId: avail.id,
          startDate: moment(avail.startDate).tz('Asia/Kolkata').toISOString(),
          endDate: moment(avail.endDate).tz('Asia/Kolkata').toISOString(),
          doctorId: avail.doctorId,
          isActive: avail.isActive,
          timeSlots: slots,
        });
      });
    });

    return Object.values(result);
  }
  
  @post('/doctor-availabilities/daily-slots-by-date')
  @response(200, {
    description: 'Daily doctor availabilities with nested time slots',
  })
  async getDailySlotsByDatePost(
    @requestBody({
      description: 'Doctor, branch, and date info for fetching daily slots',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              doctorId: {type: 'number'},
              branchId: {type: 'number'},
              date: {type: 'string', format: 'date'}, // <-- date required
            },
            required: ['doctorId', 'date'],
          },
        },
      },
    })
    body: {
      doctorId: number;
      branchId?: number;
      date: string;
    },
  ): Promise<any> {
    const {doctorId, branchId, date} = body;

    const today = moment().tz('Asia/Kolkata').startOf('day');
    const requestedDate = moment(date).tz('Asia/Kolkata').startOf('day');

    // ✅ If requested date is before today, return empty
    if (requestedDate.isBefore(today, 'day')) {
      return [];
    }

    const availabilities = await this.doctorAvailabilityRepository.find({
      where: {
        doctorId,
        isActive: true,
        ...(branchId ? {branchId} : {}),
      },
      include: [{relation: 'branch'}, {relation: 'doctorTimeSlots'}],
    });

    const dayStart = requestedDate.clone().startOf('day').toDate();
    const dayEnd = requestedDate.clone().endOf('day').toDate();
    const nowPlus30 = moment().tz('Asia/Kolkata').add(30, 'minutes'); // ✅ +30 mins buffer

    const result: any = {};

    availabilities.forEach(avail => {
      const availStart = new Date(avail.startDate);
      const availEnd = new Date(avail.endDate);

      if (availEnd < dayStart || availStart > dayEnd) return;

      const bId = avail.branch?.id || 'unknown';
      const branchName = avail.branch?.name || '';
      const branchAddress = avail.branch?.fullAddress || '';

      if (!result[bId]) {
        result[bId] = {
          branchId: bId,
          branchName,
          branchAddress,
          availableDates: [],
        };
      }

      const dateStr = requestedDate.format('YYYY-MM-DD');

      let dateEntry = result[bId].availableDates.find(
        (d: {date: string}) => d.date === dateStr,
      );
      if (!dateEntry) {
        dateEntry = {
          date: dateStr,
          availabilities: [],
        };
        result[bId].availableDates.push(dateEntry);
      }

      let slotsWithMoment = (avail.doctorTimeSlots || []).map(slot => ({
        slotId: slot.id,
        startTime: moment(slot.slotStart).tz('Asia/Kolkata'),
        endTime: moment(slot.slotEnd).tz('Asia/Kolkata'),
        isBooked: slot.isBooked,
      }));

      // ✅ If requested date is today, only include slots after now+30min
      if (requestedDate.isSame(today, 'day')) {
        slotsWithMoment = slotsWithMoment.filter(slot =>
          slot.startTime.isAfter(nowPlus30),
        );
      }

      // ✅ Now convert back to ISO for response
      const slots = slotsWithMoment.map(slot => ({
        slotId: slot.slotId,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        isBooked: slot.isBooked,
      }));

      if (slots.length > 0) {
        dateEntry.availabilities.push({
          availabilityId: avail.id,
          startDate: moment(avail.startDate).tz('Asia/Kolkata').toISOString(),
          endDate: moment(avail.endDate).tz('Asia/Kolkata').toISOString(),
          doctorId: avail.doctorId,
          isActive: avail.isActive,
          timeSlots: slots,
        });
      }
    });

    return Object.values(result);
  }

  @post('/doctor-availabilities/toggle-availability')
  @response(200, {
    description: 'Toggle doctor availability for current date',
  })
  async toggleAvailability(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['doctorId', 'date', 'isAvailable'],
            properties: {
              doctorId: {type: 'number'},
              date: {type: 'string', format: 'date'},
              isAvailable: {type: 'boolean'},
            },
          },
        },
      },
    })
    body: {
      doctorId: number;
      date: string;
      isAvailable: boolean;
    },
  ): Promise<{message: string}> {
    const {doctorId, date, isAvailable} = body;

    const repo = new DefaultTransactionalRepository(
      DoctorAvailability,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    const WEBHOOK_TOGGLE_URL = process.env.WEBHOOK_URL;

    try {
      const startOfDay = moment
        .tz(date, 'Asia/Kolkata')
        .startOf('day')
        .toDate();
      const endOfDay = moment.tz(date, 'Asia/Kolkata').endOf('day').toDate();

      // Find today's availability
      const availability = await this.doctorAvailabilityRepository.findOne({
        where: {
          doctorId,
          startDate: {between: [startOfDay, endOfDay]},
          isActive: true,
        },
        include: [{relation: 'doctorTimeSlots'}],
      });

      if (!availability) {
        throw new HttpErrors.NotFound(
          `No availability found for doctor ${doctorId} on ${date}`,
        );
      }

      const webhookPayload: any[] = [];

      if (isAvailable) {
        // ✅ If doctor is ON => mark all slots as available (0)
        for (const slot of availability.doctorTimeSlots ?? []) {
          await this.doctorTimeSlotRepository.updateById(
            slot.id!,
            {isBooked: 0},
            {transaction: tx},
          );
        }
      } else {
        for (const slot of availability.doctorTimeSlots ?? []) {
          const bookings = await this.patientBookingRepository.find({
            where: {doctorTimeSlotId: slot.id},
          });

          for (const booking of bookings) {
            const phoneNo =
              (booking.patientFullDetail as {phoneNo?: string})?.phoneNo ?? '';

            // cancel booking
            await this.patientBookingRepository.updateById(
              booking.id,
              {status: 2, updatedAt: new Date()},
              {transaction: tx},
            );

            // add to booking history
            await this.patientBookingHistoryRepository.create(
              {
                patientBookingId: booking.id,
                doctorTimeSlotId: booking.doctorTimeSlotId,
                status: 3,
              },
              {transaction: tx},
            );

            // collect webhook payload
            webhookPayload.push({
              bookingId: booking.id,
              phoneNo,
              message:
                'Doctor is not available at ' +
                new Date().toLocaleDateString('en-IN') +
                ' so appointment has been cancelled. Book new appointment',
            });
          }

          // mark slot as cancelled
          await this.doctorTimeSlotRepository.updateById(
            slot.id!,
            {isBooked: 2},
            {transaction: tx},
          );
        }
      }

      await tx.commit();

      if (!isAvailable && webhookPayload.length > 0) {
        await axios.post(
          `${WEBHOOK_TOGGLE_URL}/today-appointment-can`,
          webhookPayload,
        );
      }

      return {
        message: isAvailable
          ? 'Doctor is now available. All slots marked as open '
          : 'The doctor is not available, so your slot has been canceled. Please book a new slot.',
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  @get('/doctor-availabilities/{id}')
  @response(200, {
    description: 'Array of DoctorAvailability model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DoctorAvailability, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async findByDoctorId(
    @param.path.number('id') doctorId: number,
    @param.filter(DoctorAvailability) filter?: Filter<DoctorAvailability>,
  ): Promise<DoctorAvailability[]> {
    return this.doctorAvailabilityRepository.find({
      ...filter,
      where: {
        doctorId: Number(doctorId),
        ...(filter?.where ?? {}),
      },
      include: [
        {relation: 'doctor'},
        {relation: 'branch'},
        {relation: 'doctorTimeSlots'},
      ],
    });
  }

  @patch('/doctor-availabilities/{id}')
  @response(200, {
    description:
      'Update a doctor availability and its slots (transactional with overlap check)',
  })
  async updateDoctorAvailability(
    @param.path.number('id') id: number,
    @requestBody()
    availabilityData: Partial<
      DoctorAvailability & {doctorTimeSlots?: Partial<DoctorTimeSlot>[]}
    >,
  ) {
    const repo = new DefaultTransactionalRepository(
      DoctorAvailability,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {doctorTimeSlots, ...availabilityFields} = availabilityData;

      if (
        availabilityFields.dayOfWeek &&
        !Array.isArray(availabilityFields.dayOfWeek)
      ) {
        availabilityFields.dayOfWeek = [availabilityFields.dayOfWeek];
      }

      const currentAvailability =
        await this.doctorAvailabilityRepository.findById(id);

      if (!currentAvailability) {
        throw new HttpErrors.NotFound('Availability not found');
      }

      const existingAvailabilities =
        await this.doctorAvailabilityRepository.find({
          where: {
            doctorId:
              availabilityFields.doctorId ?? currentAvailability.doctorId,
            isActive: true,
            id: {neq: id},
          },
          include: [{relation: 'doctorTimeSlots'}],
        });

      const isOverlapping = (
        startA: Date,
        endA: Date,
        startB: Date,
        endB: Date,
      ) => startA < endB && startB < endA;

      const formatTimeOnly = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      if (doctorTimeSlots && doctorTimeSlots.length > 0) {
        const targetDate = new Date(
          availabilityFields.startDate ?? currentAvailability.startDate,
        );

        for (const slot of doctorTimeSlots) {
          const slotStart = new Date(
            targetDate.toDateString() +
              ' ' +
              new Date(slot.slotStart!).toTimeString(),
          );
          const slotEnd = new Date(
            targetDate.toDateString() +
              ' ' +
              new Date(slot.slotEnd!).toTimeString(),
          );

          for (const existing of existingAvailabilities) {
            const existDate = new Date(existing.startDate);
            if (existDate.toDateString() !== targetDate.toDateString())
              continue;

            for (const existingSlot of existing.doctorTimeSlots || []) {
              const existSlotStart = new Date(
                existDate.toDateString() +
                  ' ' +
                  new Date(existingSlot.slotStart).toTimeString(),
              );
              const existSlotEnd = new Date(
                existDate.toDateString() +
                  ' ' +
                  new Date(existingSlot.slotEnd).toTimeString(),
              );

              if (
                isOverlapping(slotStart, slotEnd, existSlotStart, existSlotEnd)
              ) {
                throw new HttpErrors.BadRequest(
                  `Doctor already has a slot overlapping on ${targetDate.toDateString()} from ${formatTimeOnly(
                    existSlotStart,
                  )} to ${formatTimeOnly(existSlotEnd)}`,
                );
              }
            }
          }
        }
      }

      await this.doctorAvailabilityRepository.updateById(
        id,
        availabilityFields,
        {
          transaction: tx,
        },
      );

      if (doctorTimeSlots) {
        const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(id);

        await slotsRepo.delete({}, {transaction: tx});

        for (const slot of doctorTimeSlots) {
          await slotsRepo.create(slot, {transaction: tx});
        }
      }
      await tx.commit();

      const updatedAvailability =
        await this.doctorAvailabilityRepository.findById(id, {
          include: [{relation: 'branch'}, {relation: 'doctorTimeSlots'}],
        });

      return {
        success: true,
        availability: updatedAvailability,
        message: 'Doctor availability updated successfully',
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // @del('/doctor-availabilities/{id}')
  // @response(204, {
  //   description: 'DoctorAvailability DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.doctorAvailabilityRepository.deleteById(id);
  // }

  @del('/doctor-availabilities/{id}')
  @response(204, {
    description: 'Delete a doctor availability and cancel all related bookings',
  })
  async deleteAvailability(
    @param.path.number('id') availabilityId: number,
  ): Promise<{message: string}> {
    const repo = new DefaultTransactionalRepository(
      DoctorAvailability,
      this.dataSource,
    );
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // 1️⃣ Get all slots of this availability
      const slots = await this.doctorTimeSlotRepository.find({
        where: {doctorAvailabilityId: availabilityId},
      });

      const slotIds = slots
        .map(s => s.id)
        .filter((id): id is number => id !== undefined);

      if (!slotIds.length) {
        // No slots — just delete the availability
        await this.doctorAvailabilityRepository.deleteById(availabilityId, {
          transaction: tx,
        });
        await tx.commit();
        return {message: 'Availability deleted successfully (no slots found)'};
      }

      // 2️⃣ Get all bookings for these slots
      const bookings = await this.patientBookingRepository.find({
        where: {doctorTimeSlotId: {inq: slotIds}},
      });
      const webhookPayload: any[] = [];
      const WEBHOOK_DEL_URL = process.env.WEBHOOK_URL;

      // 3️⃣ Cancel each booking
      for (const b of bookings) {
        const phoneNo =
          (b.patientFullDetail as {phoneNo?: string})?.phoneNo ?? '';
        await this.patientBookingRepository.updateById(
          b.id,
          {status: 2, updatedAt: new Date()},
          {transaction: tx},
        );

        await this.patientBookingHistoryRepository.create(
          {
            patientBookingId: b.id,
            doctorTimeSlotId: b.doctorTimeSlotId,
            status: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          },
          {transaction: tx},
        );
        webhookPayload.push({
          bookingId: b.id,
          phoneNo,
          message:
            'Doctor is not available at ' +
            new Date().toLocaleDateString('en-IN') +
            ' so appointment has been cancelled. Book new appointment',
        });
      }
      // 4️⃣ Delete all slots
      await this.doctorTimeSlotRepository.deleteAll(
        {doctorAvailabilityId: availabilityId},
        {transaction: tx},
      );

      // 5️⃣ Delete the availability
      await this.doctorAvailabilityRepository.deleteById(availabilityId, {
        transaction: tx,
      });

      // 6️⃣ Commit
      await tx.commit();

      if (webhookPayload.length > 0) {
        await axios.post(
          `${WEBHOOK_DEL_URL}/today-appointment-can`,
          webhookPayload,
        );
      }

      return {
        message:
          'The doctor is not available, so your slot has been canceled. Please book a new slot.',
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}
