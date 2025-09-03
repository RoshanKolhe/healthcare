import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Patient} from './patient.model';
import {Doctor} from './doctor.model';
import {DoctorTimeSlot} from './doctor-time-slot.model';

@model()
export class PatientBooking extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  purposeOfMeet: string;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'date',
    required: true,
  })
  startTime: Date;

  @property({
    type: 'date',
    required: true,
  })
  endTime: Date;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0 - confirmed, 1 - completed, 2 - cancelled

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

  @property({
    type: 'object',
  })
  patientFullDetail?: object;

  @belongsTo(() => Patient)
  patientId: number;

  @belongsTo(() => Doctor)
  doctorId: number;

  @belongsTo(() => DoctorTimeSlot)
  doctorTimeSlotId: number;

  constructor(data?: Partial<PatientBooking>) {
    super(data);
  }
}

export interface PatientBookingRelations {
  // describe navigational properties here
}

export type PatientBookingWithRelations = PatientBooking &
  PatientBookingRelations;
