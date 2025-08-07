import {Entity, model, property} from '@loopback/repository';

@model()
export class ClinicService extends Entity {
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
  clinicService: string;

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

  constructor(data?: Partial<ClinicService>) {
    super(data);
  }
}

export interface ClinicServiceRelations {
  // describe navigational properties here
}

export type ClinicServiceWithRelations = ClinicService &
  ClinicServiceRelations;
