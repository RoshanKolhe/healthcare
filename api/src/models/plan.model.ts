import {Entity, model, property} from '@loopback/repository';

@model()
export class Plan extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  billingCycle: string; // Monthly or Yearly

  @property({
    type: 'string',
    required: true,
  })
  tier: string; // Basic, Standard, Premium

  @property({type: 'number', required: true})
  priceINR: number;

  @property({type: 'number', required: true})
  discountedPriceINR: number;

  @property({type: 'number', required: true})
  priceUSD: number;

  @property({type: 'number', required: true})
  discountedPriceUSD: number;

  @property({
    type: 'number',
    required: true,
  })
  bookingLimit: number;

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
  isDeleted: boolean;

  constructor(data?: Partial<Plan>) {
    super(data);
  }
}

export interface PlanRelations {
  // describe navigational properties here
}

export type PlanWithRelations = Plan & PlanRelations;
