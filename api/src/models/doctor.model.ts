import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Clinic} from './clinic.model';
import {Branch} from './branch.model';
import {Specialization} from './specialization.model';
import {BranchDoctor} from './branch-doctor.model';

@model()
export class Doctor extends Entity {
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
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
  })
  dob: string;

  @property({
    type: 'string',
  })
  fullAddress: string;

  @property({
    type: 'string',
  })
  city: string;

  @property({
    type: 'string',
  })
  state: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type: 'string',
  })
  phoneNumber: string;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property({
    type: 'string',
    required: true,
  })
  postalCode: string;

  @property.array(String, {
    name: 'permissions',
  })
  permissions: String[];

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'string',
  })
  fcmToken?: string;

  @property({
    type: 'string',
  })
  otpExpireAt: string;

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

  @belongsTo(() => Clinic)
  clinicId: number;

  @belongsTo(() => Specialization)
  specializationId: number;

  @hasMany(() => Branch, {through: {model: () => BranchDoctor}})
  branches: Branch[];

  constructor(data?: Partial<Doctor>) {
    super(data);
  }
}

export interface DoctorRelations {
  // describe navigational properties here
}

export type DoctorWithRelations = Doctor & DoctorRelations;
