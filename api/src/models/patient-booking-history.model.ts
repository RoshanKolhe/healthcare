import {Entity, model, property, belongsTo} from '@loopback/repository';
import {PatientBooking} from './patient-booking.model';
import {DoctorTimeSlot} from './doctor-time-slot.model';

@model()
export class PatientBookingHistory extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0 - pending, 1 - reschudule, 2 - completed, 3 - cancelled

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

  @belongsTo(() => DoctorTimeSlot)
  doctorTimeSlotId: number;

  constructor(data?: Partial<PatientBookingHistory>) {
    super(data);
  }
}

export interface PatientBookingHistoryRelations {
  // describe navigational properties here
}

export type PatientBookingHistoryWithRelations = PatientBookingHistory & PatientBookingHistoryRelations;
