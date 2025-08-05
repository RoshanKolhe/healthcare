import {Entity, model, property} from '@loopback/repository';

@model()
export class HospitalType extends Entity {
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
  hospitalType: string;

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


  constructor(data?: Partial<HospitalType>) {
    super(data);
  }
}

export interface HospitalTypeRelations {
  // describe navigational properties here
}

export type HospitalTypeWithRelations = HospitalType & HospitalTypeRelations;
