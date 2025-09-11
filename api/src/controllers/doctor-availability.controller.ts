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
import {DoctorAvailability, DoctorTimeSlot} from '../models';
import {DoctorAvailabilityRepository} from '../repositories';
import {HealthcareDataSource} from '../datasources';
import {inject} from '@loopback/core';
import moment from 'moment-timezone';

export class DoctorAvailabilityController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
    @repository(DoctorAvailabilityRepository)
    public doctorAvailabilityRepository: DoctorAvailabilityRepository,
  ) {}
  //Need to check comented API
  // @post('/doctor-availabilities')
  // @response(200, {
  //   description: 'DoctorAvailability model instance with slots',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(DoctorAvailability, {includeRelations: true}),
  //     },
  //   },
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             ...getModelSchemaRef(DoctorAvailability, {
  //               title: 'NewDoctorAvailability',
  //               exclude: ['id'],
  //             }).definitions?.NewDoctorAvailability?.properties,
  //             doctorTimeSlots: {
  //               type: 'array',
  //               items: getModelSchemaRef(DoctorTimeSlot, {
  //                 exclude: ['id', 'doctorAvailabilityId'],
  //               }),
  //             },
  //           },
  //           required: [
  //             'branchId',
  //             'doctorId',
  //             'dayOfWeek',
  //             'startDate',
  //             'endDate',
  //             'startTime',
  //             'endTime',
  //             'isActive',
  //           ],
  //         },
  //       },
  //     },
  //   })
  //   doctorAvailability: Omit<DoctorAvailability, 'id'> & {
  //     doctorTimeSlots?: Omit<DoctorTimeSlot, 'id' | 'doctorAvailabilityId'>[];
  //   },
  // ): Promise<DoctorAvailability> {
  //   const {doctorTimeSlots, ...availabilityData} = doctorAvailability;

  //   if (!doctorTimeSlots || doctorTimeSlots.length === 0) {
  //     throw new HttpErrors.BadRequest(
  //       'Doctor availability must include at least one time slot',
  //     );
  //   }
  //   const repo = new DefaultTransactionalRepository(
  //     DoctorAvailability,
  //     this.dataSource,
  //   );
  //   const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

  //   try {
  //     // ✅ Create availability inside transaction
  //     const availability = await this.doctorAvailabilityRepository.create(
  //       availabilityData,
  //       {transaction: tx},
  //     );

  //     // ✅ Create slots inside transaction
  //     if (doctorTimeSlots && doctorTimeSlots.length) {
  //       const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(
  //         availability.id,
  //       );

  //       for (const slot of doctorTimeSlots) {
  //         await slotsRepo.create(
  //           {
  //             ...slot,
  //             doctorAvailabilityId: availability.id,
  //           },
  //           {transaction: tx},
  //         );
  //       }
  //     }

  //     await tx.commit();

  //     // ✅ Fetch with relation AFTER commit
  //     return this.doctorAvailabilityRepository.findById(availability.id, {
  //       include: [{relation: 'doctorTimeSlots'}],
  //     });
  //   } catch (err) {
  //     await tx.rollback();
  //     throw err;
  //   }
  // }
  // @post('/doctor-availabilities')
  // @response(200, {
  //   description: 'DoctorAvailability model instances with slots',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(DoctorAvailability, {
  //           includeRelations: true,
  //         }),
  //       },
  //     },
  //   },
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             ...getModelSchemaRef(DoctorAvailability, {
  //               title: 'NewDoctorAvailability',
  //               exclude: ['id'],
  //             }).definitions?.NewDoctorAvailability?.properties,
  //             doctorTimeSlots: {
  //               type: 'array',
  //               items: getModelSchemaRef(DoctorTimeSlot, {
  //                 exclude: ['id', 'doctorAvailabilityId'],
  //               }),
  //             },
  //             customDates: {
  //               type: 'array',
  //               items: {type: 'string', format: 'date'},
  //             },
  //           },
  //           required: [
  //             'branchId',
  //             'doctorId',
  //             'startDate',
  //             'endDate',
  //             'startTime',
  //             'endTime',
  //             'isActive',
  //           ],
  //         },
  //       },
  //     },
  //   })
  //   doctorAvailability: Omit<DoctorAvailability, 'id'> & {
  //     doctorTimeSlots?: Omit<DoctorTimeSlot, 'id' | 'doctorAvailabilityId'>[];
  //     customDates?: string[];
  //   },
  // ): Promise<DoctorAvailability[]> {
  //   const {
  //     doctorTimeSlots,
  //     startDate,
  //     endDate,
  //     dayOfWeek,
  //     customDates,
  //     ...rest
  //   } = doctorAvailability;

  //   if (!doctorTimeSlots || doctorTimeSlots.length === 0) {
  //     throw new HttpErrors.BadRequest(
  //       'Doctor availability must include at least one time slot',
  //     );
  //   }

  //   const repo = new DefaultTransactionalRepository(
  //     DoctorAvailability,
  //     this.dataSource,
  //   );
  //   const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

  //   try {
  //     // Determine dates to create availability for
  //     const datesToCreate: Date[] = [];

  //     if (customDates && customDates.length) {
  //       // Custom selected dates
  //       datesToCreate.push(...customDates.map(d => new Date(d)));
  //     } else if (startDate && endDate && dayOfWeek?.length) {
  //       // Range with selected weekdays
  //       let current = new Date(startDate);
  //       const end = new Date(endDate);

  //       while (current <= end) {
  //         if (dayOfWeek.includes(current.getDay())) {
  //           datesToCreate.push(new Date(current));
  //         }
  //         current.setDate(current.getDate() + 1);
  //       }
  //     } else {
  //       throw new HttpErrors.BadRequest(
  //         'Either customDates or startDate/endDate with dayOfWeek must be provided',
  //       );
  //     }

  //     // Create availability for each date
  //     const createdAvailabilities: DoctorAvailability[] = [];

  //     for (const date of datesToCreate) {
  //       const availability = await this.doctorAvailabilityRepository.create(
  //         {
  //           ...rest,
  //           startDate: date,
  //           endDate: date,
  //           dayOfWeek: [date.getDay()],
  //         },
  //         {transaction: tx},
  //       );

  //       // Create slots for this availability
  //       const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(
  //         availability.id,
  //       );
  //       for (const slot of doctorTimeSlots) {
  //         await slotsRepo.create(
  //           {
  //             ...slot,
  //             doctorAvailabilityId: availability.id,
  //           },
  //           {transaction: tx},
  //         );
  //       }

  //       createdAvailabilities.push(availability);
  //     }

  //     await tx.commit();

  //     // Return all created availabilities with slots
  //     return this.doctorAvailabilityRepository.find({
  //       where: {id: {inq: createdAvailabilities.map(a => a.id)}},
  //       include: [{relation: 'doctorTimeSlots'}],
  //     });
  //   } catch (err) {
  //     await tx.rollback();
  //     throw err;
  //   }
  // }

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

  // @get('/doctor-availabilities/{id}/daily-slots')
  // @response(200, {
  //   description: 'Daily doctor availabilities with nested time slots',
  // })
  // async getDailySlots(
  //   @param.path.number('id') doctorId: number,
  // ): Promise<any> {
  //   const availabilities = await this.doctorAvailabilityRepository.find({
  //     where: {
  //       doctorId,
  //       isActive: true,
  //     },
  //     include: [
  //       {relation: 'branch'},
  //       {relation: 'doctorTimeSlots'},
  //     ],
  //   });

  //   const today = new Date();
  //   const next3Days = Array.from({length: 3}, (_, i) => {
  //     const d = new Date(today);
  //     d.setDate(d.getDate() + i);
  //     return d.toISOString().split('T')[0];
  //   });

  //   // Group by branch and date
  //   const result: any = {};
  //   availabilities.forEach(avail => {
  //     const branchId = avail.branch?.id || 'unknown';
  //     const branchName = avail.branch?.name || '';
  //     const branchAddress = avail.branch?.fullAddress || '';

  //     if (!result[branchId]) {
  //       result[branchId] = {
  //         branchId,
  //         branchName,
  //         branchAddress,
  //         availableDates: [],
  //       };
  //     }

  //     next3Days.forEach(dateStr => {
  //       const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  //       const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  //       // check if this availability overlaps this date
  //       const availStart = new Date(avail.startDate);
  //       const availEnd = new Date(avail.endDate);

  //       if (availEnd < dayStart || availStart > dayEnd) return;

  //       // Create date entry if not exists
  //       let dateEntry = result[branchId].availableDates.find((d: { date: string; }) => d.date === dateStr);
  //       if (!dateEntry) {
  //         dateEntry = {
  //           date: dateStr,
  //           day: dayStart.toLocaleDateString('en-US', {weekday: 'long'}),
  //           availabilities: [],
  //         };
  //         result[branchId].availableDates.push(dateEntry);
  //       }

  //       // Map time slots
  //       const slots = (avail.doctorTimeSlots || []).map(slot => ({
  //         slotId: slot.id,
  //         startTime: slot.slotStart,
  //         endTime: slot.slotEnd,
  //         isBooked: !!slot.isBooked,
  //       }));

  //       dateEntry.availabilities.push({
  //         availabilityId: avail.id,
  //         startDate: avail.startDate,
  //         endDate: avail.endDate,
  //         doctorId: avail.doctorId,
  //         isActive: avail.isActive,
  //         timeSlots: slots,
  //       });
  //     });
  //   });

  //   // Return as array of branches
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
              branchId: {type: 'number'}, // optional
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

    const next3Days = Array.from({length: 3}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // ✅ Format in IST instead of UTC
      return d.toISOString().split('T')[0];
    });

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

      next3Days.forEach(dateStr => {
        const dayStart = new Date(dateStr + 'T00:00:00.000Z');
        const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

        const availStart = new Date(avail.startDate);
        const availEnd = new Date(avail.endDate);

        if (availEnd < dayStart || availStart > dayEnd) return;

        let dateEntry = result[bId].availableDates.find(
          (d: {date: string}) => d.date === dateStr,
        );
        if (!dateEntry) {
          dateEntry = {
            // date: dateStr,
            date: dayStart.toISOString(),
            availabilities: [],
          };
          result[bId].availableDates.push(dateEntry);
        }

        const slots = (avail.doctorTimeSlots || []).map(slot => ({
          slotId: slot.id,
          // ✅ convert slot start/end to IST before sending
          startTime: new Date(slot.slotStart).toISOString(),
          endTime: new Date(slot.slotEnd).toISOString(),
          isBooked: !!slot.isBooked,
        }));

        dateEntry.availabilities.push({
          availabilityId: avail.id,
          startDate: new Date(avail.startDate).toISOString(), // ✅ IST
          endDate: new Date(avail.endDate).toISOString(), // ✅ IST
          doctorId: avail.doctorId,
          isActive: avail.isActive,
          timeSlots: slots,
        });
      });
    });

    return Object.values(result);
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

  // @patch('/doctor-availabilities/{id}')
  // async updateDoctorAvailability(
  //   @param.path.number('id') id: number,
  //   @requestBody()
  //   availabilityData: Partial<
  //     DoctorAvailability & {doctorTimeSlots?: Partial<DoctorTimeSlot>[]}
  //   >,
  // ) {
  //   const repo = new DefaultTransactionalRepository(
  //     DoctorAvailability,
  //     this.dataSource,
  //   );
  //   const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

  //   try {
  //     const {doctorTimeSlots, ...availabilityFields} = availabilityData;

  //     await this.doctorAvailabilityRepository.updateById(
  //       id,
  //       availabilityFields,
  //       {
  //         transaction: tx,
  //       },
  //     );

  //     if (doctorTimeSlots && doctorTimeSlots.length) {
  //       const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(id);

  //       await slotsRepo.delete({}, {transaction: tx});

  //       for (const slot of doctorTimeSlots) {
  //         await slotsRepo.create(slot, {transaction: tx});
  //       }
  //     }

  //     await tx.commit();

  //     const updatedAvailability =
  //       await this.doctorAvailabilityRepository.findById(id, {
  //         include: [{relation: 'doctorTimeSlots'}],
  //       });

  //     return {
  //       success: true,
  //       availability: updatedAvailability,
  //       message: 'Doctor availability updated successfully',
  //     };
  //   } catch (err) {
  //     await tx.rollback();
  //     throw new HttpErrors.InternalServerError(err.message || 'Update failed');
  //   }
  // }
  // @patch('/doctor-availabilities/{id}')
  // @response(200, {
  //   description: 'Update a doctor availability and its slots (transactional)',
  // })
  // async updateDoctorAvailability(
  //   @param.path.number('id') id: number,
  //   @requestBody()
  //   availabilityData: Partial<
  //     DoctorAvailability & {doctorTimeSlots?: Partial<DoctorTimeSlot>[]}
  //   >,
  // ) {
  //   const repo = new DefaultTransactionalRepository(
  //     DoctorAvailability,
  //     this.dataSource,
  //   );
  //   const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

  //   try {
  //     const {doctorTimeSlots, ...availabilityFields} = availabilityData;

  //     // Ensure dayOfWeek is an array
  //     if (
  //       availabilityFields.dayOfWeek &&
  //       !Array.isArray(availabilityFields.dayOfWeek)
  //     ) {
  //       availabilityFields.dayOfWeek = [availabilityFields.dayOfWeek];
  //     }

  //     // 1️⃣ Update main availability
  //     await this.doctorAvailabilityRepository.updateById(
  //       id,
  //       availabilityFields,
  //       {transaction: tx},
  //     );

  //     // 2️⃣ Update nested slots
  //     if (doctorTimeSlots) {
  //       const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(id);

  //       // Delete existing slots
  //       await slotsRepo.delete({}, {transaction: tx});

  //       // Recreate slots
  //       for (const slot of doctorTimeSlots) {
  //         await slotsRepo.create(slot, {transaction: tx});
  //       }
  //     }

  //     // 3️⃣ Commit transaction
  //     await tx.commit();

  //     // 4️⃣ Fetch updated availability including branch and slots
  //     const updatedAvailability =
  //       await this.doctorAvailabilityRepository.findById(id, {
  //         include: [{relation: 'branch'}, {relation: 'doctorTimeSlots'}],
  //       });

  //     // 5️⃣ Prepare response in same format as POST /daily-slots
  //     const next3Days = Array.from({length: 3}, (_, i) => {
  //       const d = new Date();
  //       d.setDate(d.getDate() + i);
  //       return d.toISOString().split('T')[0];
  //     });

  //     const result: any = {};
  //     const bId = updatedAvailability.branch?.id || 'unknown';
  //     const branchName = updatedAvailability.branch?.name || '';
  //     const branchAddress = updatedAvailability.branch?.fullAddress || '';

  //     result[bId] = {
  //       branchId: bId,
  //       branchName,
  //       branchAddress,
  //       availableDates: [],
  //     };

  //     next3Days.forEach(dateStr => {
  //       const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  //       const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  //       const availStart = new Date(updatedAvailability.startDate);
  //       const availEnd = new Date(updatedAvailability.endDate);

  //       if (availEnd < dayStart || availStart > dayEnd) return;

  //       const slots = (updatedAvailability.doctorTimeSlots || []).map(slot => ({
  //         slotId: slot.id,
  //         startTime: new Date(slot.slotStart).toISOString(),
  //         endTime: new Date(slot.slotEnd).toISOString(),
  //         isBooked: !!slot.isBooked,
  //       }));

  //       result[bId].availableDates.push({
  //         date: dayStart.toISOString(),
  //         availabilities: [
  //           {
  //             availabilityId: updatedAvailability.id,
  //             startDate: new Date(updatedAvailability.startDate).toISOString(),
  //             endDate: new Date(updatedAvailability.endDate).toISOString(),
  //             doctorId: updatedAvailability.doctorId,
  //             isActive: updatedAvailability.isActive,
  //             timeSlots: slots,
  //           },
  //         ],
  //       });
  //     });

  //     return Object.values(result);
  //   } catch (err) {
  //     await tx.rollback();
  //     throw new HttpErrors.InternalServerError(err.message || 'Update failed');
  //   }
  // }
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

  @del('/doctor-availabilities/{id}')
  @response(204, {
    description: 'DoctorAvailability DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.doctorAvailabilityRepository.deleteById(id);
  }
}
