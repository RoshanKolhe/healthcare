import {Entity, model, property} from '@loopback/repository';

@model()
export class Log extends Entity {
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
  workflow: string;

  @property({
    type: 'string',
    required: true,
  })
  input: string;

  @property({
    type: 'string',
    required: true,
  })
  output: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  steps?: string[];

  @property({
    type: 'array',
    itemType: 'object',
    required: true,
  })
  tokens: object[];

  @property({
    type: 'number',
    required: true,
  })
  totalCost: number;

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

  constructor(data?: Partial<Log>) {
    super(data);
  }
}

export interface LogRelations {
  // describe navigational properties here
}

export type LogWithRelations = Log & LogRelations;
