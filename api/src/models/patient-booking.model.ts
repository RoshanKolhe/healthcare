import {Entity, model, property, belongsTo, hasMany, hasOne} from '@loopback/repository';
import {Patient} from './patient.model';
import {Doctor} from './doctor.model';
import {DoctorTimeSlot} from './doctor-time-slot.model';
import {PatientBookingHistory} from './patient-booking-history.model';
import {Clinic} from './clinic.model';
import {Branch} from './branch.model';
import {ReferalManagement} from './referal-management.model';

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

  @hasMany(() => PatientBookingHistory)
  patientBookingHistories: PatientBookingHistory[];

  @belongsTo(() => Clinic)
  clinicId: number;

  @belongsTo(() => Branch)
  branchId: number;

  @hasOne(() => ReferalManagement)
  referalManagement: ReferalManagement;

  constructor(data?: Partial<PatientBooking>) {
    super(data);
  }
}

export interface PatientBookingRelations {
  // describe navigational properties here
}

export type PatientBookingWithRelations = PatientBooking &
  PatientBookingRelations;
