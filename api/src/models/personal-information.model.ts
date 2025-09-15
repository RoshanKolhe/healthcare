import {Entity, model, property} from '@loopback/repository';

@model()
export class PersonalInformation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'date',
  })
  dob?: Date;

  @property({
    type: 'string',
  })
  residentialAddress?: string;

  @property({
    type: 'string',
  })
  bloodGroup?: string;

  @property({
    type: 'string',
  })
  chronicIllnesses?: string;

  @property({
    type: 'string',
  })
  pastSurgeries?: string;

  @property({
    type: 'string',
  })
  allergies?: string;

  @property({
    type: 'string',
  })
  currentMedication?: string;

  @property({
    type: 'string',
  })
  mainSymptoms?: string;

  @property({
    type: 'string',
  })
  duration?: string;

  @property({
    type: 'string',
  })
  painLevel?: string;

  @property({
    type: 'string',
  })
  insuranceProvider?: string;

  @property({
    type: 'string',
  })
  policyNumber?: string;

  @property({
    type: 'date',
  })
  validityDate?: Date;

  @property({
    type: 'string',
  })
  emergencyName?: string;

  @property({
    type: 'string',
  })
  emergencyPhoneNo?: string;

  @property({
    type: 'string',
  })
  relationship?: string;

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

  constructor(data?: Partial<PersonalInformation>) {
    super(data);
  }
}

export interface PersonalInformationRelations {
  // describe navigational properties here
}

export type PersonalInformationWithRelations = PersonalInformation & PersonalInformationRelations;
