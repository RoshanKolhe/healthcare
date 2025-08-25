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
