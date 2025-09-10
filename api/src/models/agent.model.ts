import {Entity, model, property, hasMany} from '@loopback/repository';
import {AgentPlan} from './agent-plan.model';

@model()
export class Agent extends Entity {
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
  description: string;

  @property({
    type: 'object',
  })
  thumbnail?: object;

  @property({
    type: 'string',
    required: true,
  })
  features: string;

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
  isDeleted?: boolean;

  constructor(data?: Partial<Agent>) {
    super(data);
  }
}

export interface AgentRelations {
  // describe navigational properties here
}

export type AgentWithRelations = Agent & AgentRelations;
