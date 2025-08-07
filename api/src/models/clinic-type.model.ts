import {Entity, model, property} from '@loopback/repository';

@model()
export class ClinicType extends Entity {
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
  clinicType: string;

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

  constructor(data?: Partial<ClinicType>) {
    super(data);
  }
}

export interface ClinicTypeRelations {
  // describe navigational properties here
}

export type ClinicTypeWithRelations = ClinicType & ClinicTypeRelations;
