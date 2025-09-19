import {Entity, model, property, belongsTo} from '@loopback/repository';
import {PatientBooking} from './patient-booking.model';

@model()
export class Prescription extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  tabletName?: string;

  @property({
    type: 'date',
  })
  morningTime?: Date;

  @property({
    type: 'date',
  })
  afternoonTime?: Date;

  @property({
    type: 'date',
  })
  nightTime?: Date;

  @property({
    type: 'number',
    required: true,
  })
  days: number;

  @property({
    type: 'string',
  })
  foodTiming?: string;

  @property({
    type: 'date',
  })
  date?: Date;

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

  constructor(data?: Partial<Prescription>) {
    super(data);
  }
}

export interface PrescriptionRelations {
  // describe navigational properties here
}

export type PrescriptionWithRelations = Prescription & PrescriptionRelations;
