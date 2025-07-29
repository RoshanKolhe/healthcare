import {Entity, model, property} from '@loopback/repository';

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
    type: 'number',
    required: true,
  })
  hospitalRegNum: number;

  @property({
    type: 'string',
    required: true,
  })
  hospitalCategory: string;

  @property({
    type: 'string',
    required: true,
  })
  hospitalType: string;

  @property({
    type: 'string',
    required: true,
  })
  hospitalServices: string;

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
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  city: string;

  @property({
    type: 'string',
    required: true,
  })
  state: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  @property({
    type: 'number',
    required: true,
  })
  postalCode: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;


  constructor(data?: Partial<Hospital>) {
    super(data);
  }
}

export interface HospitalRelations {
  // describe navigational properties here
}

export type HospitalWithRelations = Hospital & HospitalRelations;
