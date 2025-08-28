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

export class DoctorAvailabilityController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
    @repository(DoctorAvailabilityRepository)
    public doctorAvailabilityRepository: DoctorAvailabilityRepository,
  ) {}

  @post('/doctor-availabilities')
  @response(200, {
    description: 'DoctorAvailability model instance with slots',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DoctorAvailability, {includeRelations: true}),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(DoctorAvailability, {
                title: 'NewDoctorAvailability',
                exclude: ['id'],
              }).definitions?.NewDoctorAvailability?.properties,
              doctorTimeSlots: {
                type: 'array',
                items: getModelSchemaRef(DoctorTimeSlot, {
                  exclude: ['id', 'doctorAvailabilityId'],
                }),
              },
            },
            required: [
              'branchId',
              'doctorId',
              'dayOfWeek',
              'startDate',
              'endDate',
              'startTime',
              'endTime',
              'isActive',
            ],
          },
        },
      },
    })
    doctorAvailability: Omit<DoctorAvailability, 'id'> & {
      doctorTimeSlots?: Omit<DoctorTimeSlot, 'id' | 'doctorAvailabilityId'>[];
    },
  ): Promise<DoctorAvailability> {
    const {doctorTimeSlots, ...availabilityData} = doctorAvailability;

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
      // ✅ Create availability inside transaction
      const availability = await this.doctorAvailabilityRepository.create(
        availabilityData,
        {transaction: tx},
      );

      // ✅ Create slots inside transaction
      if (doctorTimeSlots && doctorTimeSlots.length) {
        const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(
          availability.id,
        );

        for (const slot of doctorTimeSlots) {
          await slotsRepo.create(
            {
              ...slot,
              doctorAvailabilityId: availability.id,
            },
            {transaction: tx},
          );
        }
      }

      await tx.commit();

      // ✅ Fetch with relation AFTER commit
      return this.doctorAvailabilityRepository.findById(availability.id, {
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
  body: { doctorId: number; branchId?: number },
): Promise<any> {
  const {doctorId, branchId} = body;

  const availabilities = await this.doctorAvailabilityRepository.find({
    where: {
      doctorId,
      isActive: true,
      ...(branchId ? {branchId} : {}),
    },
    include: [
      {relation: 'branch'},
      {relation: 'doctorTimeSlots'},
    ],
  });

  const next3Days = Array.from({length: 3}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    // ✅ Format in IST instead of UTC
    return (d).toISOString().split('T')[0];
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

      let dateEntry = result[bId].availableDates.find((d: { date: string }) => d.date === dateStr);
      if (!dateEntry) {
        dateEntry = {
          // date: dateStr,
          date: (dayStart).toISOString(), 
          availabilities: [],
        };
        result[bId].availableDates.push(dateEntry);
      }

      const slots = (avail.doctorTimeSlots || []).map(slot => ({
        slotId: slot.id,
        // ✅ convert slot start/end to IST before sending
        startTime: (new Date(slot.slotStart)).toISOString(),
        endTime: (new Date(slot.slotEnd)).toISOString(),
        isBooked: !!slot.isBooked,
      }));

      dateEntry.availabilities.push({
        availabilityId: avail.id,
        startDate: (new Date(avail.startDate)).toISOString(), // ✅ IST
        endDate: (new Date(avail.endDate)).toISOString(),     // ✅ IST
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
  async findByDoctorId  (
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

      await this.doctorAvailabilityRepository.updateById(
        id,
        availabilityFields,
        {
          transaction: tx,
        },
      );

      if (doctorTimeSlots && doctorTimeSlots.length) {
        const slotsRepo = this.doctorAvailabilityRepository.doctorTimeSlots(id);

        await slotsRepo.delete({}, {transaction: tx});

        for (const slot of doctorTimeSlots) {
          await slotsRepo.create(slot, {transaction: tx});
        }
      }

      await tx.commit();

      const updatedAvailability =
        await this.doctorAvailabilityRepository.findById(id, {
          include: [{relation: 'doctorTimeSlots'}],
        });

      return {
        success: true,
        availability: updatedAvailability,
        message: 'Doctor availability updated successfully',
      };
    } catch (err) {
      await tx.rollback();
      throw new HttpErrors.InternalServerError(err.message || 'Update failed');
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
