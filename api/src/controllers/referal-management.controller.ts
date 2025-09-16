import {
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
} from '@loopback/rest';
import {ReferalManagement} from '../models';
import {
  DoctorRepository,
  PatientBookingRepository,
  ReferalManagementRepository,
} from '../repositories';
import axios from 'axios';

export class ReferalManagementController {
  constructor(
    @repository(ReferalManagementRepository)
    public referalManagementRepository: ReferalManagementRepository,
    @repository(PatientBookingRepository)
    public patientBookingRepository: PatientBookingRepository,
    @repository('DoctorRepository')
    public doctorRepository: DoctorRepository,
  ) {}

  @post('/referal-managements')
  @response(200, {
    description: 'ReferalManagement model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(ReferalManagement)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReferalManagement, {
            title: 'NewReferalManagement',
            exclude: ['id'],
          }),
        },
      },
    })
    referalManagement: Omit<ReferalManagement, 'id'>,
  ): Promise<ReferalManagement> {
    const create =
      await this.referalManagementRepository.create(referalManagement);
    const WEBHOOK_REF_URL = process.env.WEBHOOK_URL;
    try {
      const booking: any = await this.patientBookingRepository.findById(
        referalManagement.patientBookingId,
      );
      const doctor: any = await this.doctorRepository.findById(
        booking?.doctorId,
      );

      const payload = {
        ...create,
        currentDoctor: `${doctor?.firstName} ${doctor?.lastName}`,
        currentDoctorPhoneNo: doctor?.phoneNumber,
        currentDoctorEmail: doctor?.email,
        patientName: booking?.patientFullDetail?.patientName,
        patientPhoneNo: booking?.patientFullDetail?.phoneNo,
        patientEmail: booking?.patientFullDetail?.email,
        patientAge: booking?.patientFullDetail?.age,
      };
      await axios.post(`${WEBHOOK_REF_URL}/referral_data`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Webhook send failed:', error.message);
    }
    return create;
  }

  @get('/referal-managements')
  @response(200, {
    description: 'Array of ReferalManagement model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ReferalManagement, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ReferalManagement) filter?: Filter<ReferalManagement>,
  ): Promise<ReferalManagement[]> {
    return this.referalManagementRepository.find(filter);
  }

  @get('/referal-managements/{id}')
  @response(200, {
    description: 'ReferalManagement model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ReferalManagement, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ReferalManagement, {exclude: 'where'})
    filter?: FilterExcludingWhere<ReferalManagement>,
  ): Promise<ReferalManagement> {
    return this.referalManagementRepository.findById(id, filter);
  }

  @patch('/referal-managements/{id}')
  @response(204, {
    description: 'ReferalManagement PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReferalManagement, {partial: true}),
        },
      },
    })
    referalManagement: ReferalManagement,
  ): Promise<void> {
    await this.referalManagementRepository.updateById(id, referalManagement);

    const WEBHOOK_REF_URL = process.env.WEBHOOK_URL;

    try {
      const updatedReferral: any =
        await this.referalManagementRepository.findById(id);

      const booking: any = await this.patientBookingRepository.findById(
        updatedReferral.patientBookingId,
      );

      const doctor: any = await this.doctorRepository.findById(
        booking?.doctorId,
      );
      const payload = {
        ...updatedReferral,
        currentDoctor: `${doctor?.firstName} ${doctor?.lastName}`,
        currentDoctorPhoneNo: doctor?.phoneNumber,
        currentDoctorEmail: doctor?.email,
        patientName: booking?.patientFullDetail?.patientName,
        patientPhoneNo: booking?.patientFullDetail?.phoneNo,
        patientEmail: booking?.patientFullDetail?.email,
        patientAge: booking?.patientFullDetail?.age,
      };

      await axios.post(`${WEBHOOK_REF_URL}/referral_data`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Webhook send failed:', error.message);
    }
  }

  @del('/referal-managements/{id}')
  @response(204, {
    description: 'ReferalManagement DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.referalManagementRepository.deleteById(id);
  }
}
