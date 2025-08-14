import {
  Entity,
  model,
  property,
  belongsTo,
  hasMany,
} from '@loopback/repository';
import {BranchDoctor} from './branch-doctor.model';
import {Clinic} from './clinic.model';
import {DoctorTimeSlot} from './doctor-time-slot.model';

@model()
export class DoctorAvailability extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  dayOfWeek: string[];

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

  @belongsTo(() => BranchDoctor)
  branchDoctorId: number;

  @belongsTo(() => Clinic)
  clinicId: number;

  @hasMany(() => DoctorTimeSlot)
  doctorTimeSlots: DoctorTimeSlot[];

  constructor(data?: Partial<DoctorAvailability>) {
    super(data);
  }
}

export interface DoctorAvailabilityRelations {
  // describe navigational properties here
}

export type DoctorAvailabilityWithRelations = DoctorAvailability &
  DoctorAvailabilityRelations;
