import {Entity, model, property} from '@loopback/repository';

@model()
export class AgentPlan extends Entity {
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
  plan_type: string;

  @property({
    type: 'string',
    required: true,
  })
  billing_cycle: string;

  @property({
    type: 'number',
    required: true,
  })
  max_branches?: number;

  @property({
    type: 'number',
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  price: number;

  @property({
    type: 'number',
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  discountedPrice: number;

  @property({type: 'number', default: 0})
  tax_percentage?: number;

  @property({
    type: 'object',
    required: true,
  })
  features: object;

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

  constructor(data?: Partial<AgentPlan>) {
    super(data);
  }
}

export interface AgentPlanRelations {
  // describe navigational properties here
}

export type AgentPlanWithRelations = AgentPlan & AgentPlanRelations;
