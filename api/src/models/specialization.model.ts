import {Entity, model, property} from '@loopback/repository';

@model()
export class Specialization extends Entity {
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
  specialization: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;


  constructor(data?: Partial<Specialization>) {
    super(data);
  }
}

export interface SpecializationRelations {
  // describe navigational properties here
}

export type SpecializationWithRelations = Specialization & SpecializationRelations;
