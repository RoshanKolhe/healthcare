import {Entity, model, property} from '@loopback/repository';

@model()
export class ReferalManagement extends Entity {
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
  referalReason: string;

  @property({
    type: 'string',
    required: true,
  })
  clinicNote: string;

  @property({
    type: 'string',
    required: true,
  })
  doctorName: string;

  @property({
    type: 'string',
    required: true,
  })
  doctorPhone: string;

  @property({
    type: 'string',
    required: true,
  })
  doctorEmail: string;

  @property({
    type: 'string',
    required: true,
  })
  clinicName: string;

  @property({
    type: 'string',
    required: true,
  })
  clinicAddress: string;

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
    type: 'number',
  })
  patientBookingId?: number;

  constructor(data?: Partial<ReferalManagement>) {
    super(data);
  }
}

export interface ReferalManagementRelations {
  // describe navigational properties here
}

export type ReferalManagementWithRelations = ReferalManagement &
  ReferalManagementRelations;
