import {Entity, model, property} from '@loopback/repository';

@model()
export class HospitalService extends Entity {
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
  hospitalService: string;

  @property({
    type: 'string',
  })
  description?: string;

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

  constructor(data?: Partial<HospitalService>) {
    super(data);
  }
}

export interface HospitalServiceRelations {
  // describe navigational properties here
}

export type HospitalServiceWithRelations = HospitalService &
  HospitalServiceRelations;
