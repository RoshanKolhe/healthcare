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
  Clinic,
} from '../models';
import {PatientBookingRepository} from '../repositories';

export class PatientBookingClinicController {
  constructor(
    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,
  ) { }

  @get('/patient-bookings/{id}/clinic', {
    responses: {
      '200': {
        description: 'Clinic belonging to PatientBooking',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Clinic),
          },
        },
      },
    },
  })
  async getClinic(
    @param.path.number('id') id: typeof PatientBooking.prototype.id,
  ): Promise<Clinic> {
    return this.patientBookingRepository.clinic(id);
  }
}
