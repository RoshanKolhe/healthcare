import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Branch} from './branch.model';

@model()
export class BranchWhatsapp extends Entity {
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
  phoneNo: string;

  @property({
    type: 'string',
    required: true,
  })
  clientId: string;

  @property({
    type: 'string',
    required: true,
  })
  clientSecret: string;

  @property({
    type: 'string',
    required: true,
  })
  accessToken: string;

  @property({
    type: 'string',
    required: true,
  })
  businessAccountId: string;

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

  @belongsTo(() => Branch)
  branchId: number;

  constructor(data?: Partial<BranchWhatsapp>) {
    super(data);
  }
}

export interface BranchWhatsappRelations {
  // describe navigational properties here
}

export type BranchWhatsappWithRelations = BranchWhatsapp & BranchWhatsappRelations;
