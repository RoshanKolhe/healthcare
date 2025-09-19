import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Clinic} from './clinic.model';
import {Plan} from './plan.model';

@model()
export class ClinicSubscription extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isFreeTrial: boolean;

  @property({
    type: 'number',
    required: true,
  })
  bookingLimit: number;

  @property({
    type: 'date',
    required: true,
  })
  expiryDate: Date;

  @property({
    type: 'object',
  })
  paymentDetails: object;

  @property({
    type: 'object',
  })
  planData: object;

  @property({
    type: 'string',
  })
  status?: string; //created , success, failed, expired

  @property({
    type: 'number',
  })
  amount?: number; // base amount

  @property({
    type: 'number',
  })
  taxAmount?: number;

  @property({
    type: 'number',
  })
  totalAmount?: number;

  @property({
    type: 'string',
  })
  paymentProvider?: string; // e.g., 'razorpay'

  @property({
    type: 'string',
  })
  paymentId?: string; // razorpay payment/order id

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

  @belongsTo(() => Clinic)
  clinicId: number;

  @belongsTo(() => Plan)
  planId: number;

  @belongsTo(() => User)
  purchasedByUserId: number;

  constructor(data?: Partial<ClinicSubscription>) {
    super(data);
  }
}

export interface ClinicSubscriptionRelations {
  // describe navigational properties here
}

export type ClinicSubscriptionWithRelations = ClinicSubscription &
  ClinicSubscriptionRelations;
