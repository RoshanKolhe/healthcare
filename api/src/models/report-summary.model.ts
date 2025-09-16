import {Entity, model, property, belongsTo} from '@loopback/repository';
import {PatientBooking} from './patient-booking.model';

@model()
export class ReportSummary extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'object',
    required: true,
  })
  file: object;

  @property({
    type: 'string',
  })
  summary?: string;

  @property({
    type: 'string',
  })
  feedback?: string;

  @property({
    type: 'number',
    default: 0,
  })
  status: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @belongsTo(() => PatientBooking)
  patientBookingId: number;

  constructor(data?: Partial<ReportSummary>) {
    super(data);
  }
}

export interface ReportSummaryRelations {
  // describe navigational properties here
}

export type ReportSummaryWithRelations = ReportSummary & ReportSummaryRelations;
