import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Branch} from './branch.model';
import {Category} from './category.model';
import {HospitalService} from './hospital-service.model';
import {HospitalType} from './hospital-type.model';

@model()
export class Hospital extends Entity {
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
  hospitalName: string;

  @property({
    type: 'string',
    required: true,
  })
  hospitalRegNum: string;

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

  @belongsTo(() => HospitalService)
  hospitalServiceId: number;

  @belongsTo(() => HospitalType)
  hospitalTypeId: number;

  constructor(data?: Partial<Hospital>) {
    super(data);
  }
}

export interface HospitalRelations {
  // describe navigational properties here
}

export type HospitalWithRelations = Hospital & HospitalRelations;
