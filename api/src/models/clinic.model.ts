import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Branch} from './branch.model';
import {Category} from './category.model';
import {ClinicService} from './clinic-service.model';
import {ClinicType} from './clinic-type.model';
import {ClinicSubscription} from './clinic-subscription.model';

@model()
export class Clinic extends Entity {
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
  clinicName: string;

  @property({
    type: 'string',
    required: true,
  })
  clinicRegNum: string;

  @property({
    type: 'object',
    required: true,
  })
  imageUpload: object;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

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
  isDeleted?: boolean;

  @hasMany(() => Branch)
  branches: Branch[];

  @belongsTo(() => Category)
  categoryId: number;

  @belongsTo(() => ClinicService)
  clinicServiceId: number;

  @belongsTo(() => ClinicType)
  clinicTypeId: number;

  @hasMany(() => ClinicSubscription)
  clinicSubscriptions: ClinicSubscription[];

  constructor(data?: Partial<Clinic>) {
    super(data);
  }
}

export interface ClinicRelations {
  // describe navigational properties here
}

export type ClinicWithRelations = Clinic & ClinicRelations;
