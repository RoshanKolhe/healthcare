import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  PatientBooking,
  Branch,
} from '../models';
import {PatientBookingRepository} from '../repositories';

export class PatientBookingBranchController {
  constructor(
    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,
  ) { }

  @get('/patient-bookings/{id}/branch', {
    responses: {
      '200': {
        description: 'Branch belonging to PatientBooking',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Branch),
          },
        },
      },
    },
  })
  async getBranch(
    @param.path.number('id') id: typeof PatientBooking.prototype.id,
  ): Promise<Branch> {
    return this.patientBookingRepository.branch(id);
  }
}
