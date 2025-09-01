import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {DoctorAvailability} from './doctor-availability.model';
import {PatientBooking} from './patient-booking.model';

@model()
export class DoctorTimeSlot extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'date',
    required: true,
  })
  slotStart: Date;

  @property({
    type: 'date',
    required: true,
  })
  slotEnd: Date;

  @property({
    type: 'number',
    required: true,
  })
  duration: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isBooked: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

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

  @belongsTo(() => DoctorAvailability)
  doctorAvailabilityId: number;

  @hasOne(() => PatientBooking)
  patientBooking: PatientBooking;

  constructor(data?: Partial<DoctorTimeSlot>) {
    super(data);
  }
}

export interface DoctorTimeSlotRelations {
  // describe navigational properties here
}

export type DoctorTimeSlotWithRelations = DoctorTimeSlot &
  DoctorTimeSlotRelations;
