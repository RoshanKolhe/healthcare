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
import {Branch} from './branch.model';
import {Doctor} from './doctor.model';

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
    itemType: 'number',
    required: true,
  })
  dayOfWeek: number[];

  @property({
    type: 'date',
    required: true,
  })
  startDate: Date;

  @property({
    type: 'date',
    required: true,
  })
  endDate: Date;

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

  @hasMany(() => DoctorTimeSlot)
  doctorTimeSlots: DoctorTimeSlot[];

  @belongsTo(() => Branch)
  branchId: number;

  @belongsTo(() => Doctor)
  doctorId: number;
  branch: any;

  constructor(data?: Partial<DoctorAvailability>) {
    super(data);
  }
}

export interface DoctorAvailabilityRelations {
  // describe navigational properties here
}

export type DoctorAvailabilityWithRelations = DoctorAvailability &
  DoctorAvailabilityRelations;
