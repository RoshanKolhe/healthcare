import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
  RestBindings,
  Response,
} from '@loopback/rest';
import * as crypto from 'crypto';
import {UserProfile} from '@loopback/security';
import {ClinicSubscription} from '../models';
import {
  ClinicSubscriptionRepository,
  PlanRepository,
  UserRepository,
} from '../repositories';
import {RazorPayService} from '../services/razorpay.service';
import {inject} from '@loopback/core';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
const Razorpay = require('razorpay');

export class ClinicSubscriptionController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(PlanRepository)
    public planRepository: PlanRepository,
    @inject('service.razorpay.service')
    public razorpayService: RazorPayService,
    @repository(ClinicSubscriptionRepository)
    public clinicSubscriptionRepository: ClinicSubscriptionRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.CLINIC],
    },
  })
  @post('/clinic-subscriptions/free-trial')
  @response(200, {
    description: 'Start free trial for a clinic',
  })
  async startFreeTrial(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              clinicId: {type: 'number'},
              planId: {type: 'number'},
            },
            required: ['clinicId', 'planId'],
          },
        },
      },
    })
    body: {clinicId: number; planId: number},
  ): Promise<{success: boolean; subscriptionId?: number; message?: string}> {
    const user = await this.userRepository.findById(currentUser.id);

    const existingTrial = await this.clinicSubscriptionRepository.findOne({
      where: {
        clinicId: body.clinicId,
        isFreeTrial: true,
      },
    });

    if (existingTrial) {
      throw new HttpErrors.BadRequest(
        'Free trial has already been availed for this clinic',
      );
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14); // 14 days trial

    const freeTrial = await this.clinicSubscriptionRepository.create({
      planId: body.planId,
      clinicId: body.clinicId,
      purchasedByUserId: user.id,
      isFreeTrial: true,
      bookingLimit: 10,
      expiryDate,
      status: 'success',
    });

    return {success: true, subscriptionId: freeTrial.id!};
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.CLINIC],
    },
  })
  @post('/clinic-subscriptions')
  @response(200, {
    description: 'ClinicSubscription model instance with payment object',
    content: {
      'application/json': {schema: getModelSchemaRef(ClinicSubscription)},
    },
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['planId', 'paymentDetails'],
            properties: {
              planId: {type: 'number', example: 1},
              paymentDetails: {
                type: 'object',
                properties: {
                  personName: {type: 'string', example: 'Test'},
                  phoneNumber: {type: 'string', example: '9822768049'},
                  email: {type: 'string', example: 'admin@kisan4u.com'},
                  address: {
                    type: 'string',
                    example: 'Plot no 49 Gat No 499 near Siddh hanuman mandir',
                  },
                },
              },
            },
          },
        },
      },
    })
    clinicSubscription: {planId: number; paymentDetails: object},
  ): Promise<{success: boolean; paymentObject: object}> {
    try {
      // 1. Fetch current user
      const user = await this.userRepository.findById(currentUser.id);
      if (!user) {
        throw new HttpErrors.Unauthorized('Access denied');
      }

      // 2. Ensure planId is provided
      if (!clinicSubscription.planId) {
        throw new HttpErrors.BadRequest(
          'Plan details not found in request body',
        );
      }

      // 3. Fetch plan
      const plan = await this.planRepository.findById(
        clinicSubscription.planId,
      );
      if (!plan) {
        throw new HttpErrors.NotFound(
          `Plan with planId ${clinicSubscription.planId} not found`,
        );
      }

      // 4. Calculate tax and total
      const taxPercentage = plan.taxPercentageINR ?? 0;
      const taxAmount = (plan.discountedPriceINR * taxPercentage) / 100;
      const totalAmount = plan.discountedPriceINR + taxAmount;

      // 5. Check last subscription for this clinic
      const lastSubscription = await this.clinicSubscriptionRepository.findOne({
        where: {
          clinicId: user.clinicId,
          status: {inq: ['pending', 'success']},
          isDeleted: false,
        },
        order: ['expiryDate DESC'],
      });

      // 6. Calculate remaining days from last subscription
      const now = new Date();
      let remainingDays = 0;
      if (lastSubscription && lastSubscription.expiryDate > now) {
        remainingDays = Math.ceil(
          (lastSubscription.expiryDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
      }

      // 7. Calculate new plan duration in days
      let planDays = 0;
      if (plan.billingCycle === 'monthly') planDays = 30;
      if (plan.billingCycle === 'yearly') planDays = 365;

      const totalDays = remainingDays + planDays;
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + totalDays);

      // 8. Calculate new booking limit
      let newBookingLimit = plan.bookingLimit;
      if (lastSubscription && lastSubscription.status === 'success') {
        // Example logic: take max of old and new
        newBookingLimit = Math.max(
          lastSubscription.bookingLimit,
          plan.bookingLimit,
        );
      }

      const isFreeTrial = lastSubscription?.isFreeTrial ?? false;

      // 10. Create subscription
      const newSubscriptionData: Partial<ClinicSubscription> = {
        planId: clinicSubscription.planId,
        clinicId: user.clinicId,
        purchasedByUserId: user.id,
        paymentDetails: clinicSubscription.paymentDetails, // user info
        isFreeTrial,
        bookingLimit: newBookingLimit,
        expiryDate: newExpiryDate,
        status: 'pending',
        amount: plan.discountedPriceINR,
        taxAmount,
        totalAmount,
        paymentProvider: 'razorpay',
      };

      const newSubscription =
        await this.clinicSubscriptionRepository.create(newSubscriptionData);

      // 11. Create Razorpay order
      const checkOutData = {
        amount: totalAmount * 100, // in paise
        currency: 'INR',
        receipt: `sub_${newSubscription.id}`,
        notes: {
          subscriptionId: newSubscription.id,
          userId: user.id,
        },
      };
      console.log(checkOutData);
      const razorpayOrder =
        await this.razorpayService.createOrder(checkOutData);

      return {
        success: true,
        paymentObject: razorpayOrder,
      };
    } catch (error) {
      throw error;
    }
  }

  @post('/subscriptions/callback/verify')
  async verifyRazorpayPayment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              subscription_id: {type: 'number'},
              razorpay_order_id: {type: 'string'},
              razorpay_payment_id: {type: 'string'},
              razorpay_signature: {type: 'string'},
            },
            required: [
              'subscription_id',
              'razorpay_order_id',
              'razorpay_payment_id',
              'razorpay_signature',
            ],
          },
        },
      },
    })
    body: {
      subscription_id: number;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<{success: boolean; endpoint: string | null}> {
    const {
      subscription_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const subscription =
      await this.clinicSubscriptionRepository.findById(subscription_id);
    if (!subscription) {
      throw new HttpErrors.NotFound('Subscription not found');
    }

    if (!secret) {
      throw new HttpErrors.InternalServerError(
        'Razorpay secret key not configured',
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: secret,
      });

      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      const paymentDetails = {
        order_id: payment.order_id,
        payment_id: payment.id,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
      };

      if (digest === razorpay_signature && payment.status === 'captured') {
        const plan = await this.planRepository.findById(subscription.planId);

        const updateData: Partial<typeof subscription> = {
          paymentDetails,
          status: 'success',
        };

        if (plan) {
          const expiryDate = new Date();

          if (plan.billingCycle === 'monthly') {
            expiryDate.setDate(expiryDate.getDate() + 30);
          } else if (plan.billingCycle === 'yearly') {
            expiryDate.setDate(expiryDate.getDate() + 365);
          }

          updateData.expiryDate = expiryDate;
        }

        await this.clinicSubscriptionRepository.updateById(
          subscription.id,
          updateData,
        );

        return {
          success: true,
          endpoint: `payment/success?subscriptionId=${subscription.id}`,
        };
      } else {
        // Invalid signature or payment failed
        await this.clinicSubscriptionRepository.updateById(subscription.id, {
          paymentDetails,
          status: 'failed',
        });

        return {
          success: false,
          endpoint: null,
        };
      }
    } catch (error) {
      console.error('Razorpay verify error:', error);
      await this.clinicSubscriptionRepository.updateById(subscription.id, {
        status: 'failed',
      });
      return {
        success: false,
        endpoint: null,
      };
    }
  }

  @get('/clinic-subscriptions')
  @response(200, {
    description: 'Array of ClinicSubscription model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClinicSubscription, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(ClinicSubscription) filter?: Filter<ClinicSubscription>,
  ): Promise<ClinicSubscription[]> {
    return this.clinicSubscriptionRepository.find(filter);
  }

  @get('/clinic-subscriptions/{id}')
  @response(200, {
    description: 'ClinicSubscription model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClinicSubscription, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ClinicSubscription, {exclude: 'where'})
    filter?: FilterExcludingWhere<ClinicSubscription>,
  ): Promise<ClinicSubscription> {
    return this.clinicSubscriptionRepository.findById(id, filter);
  }

  @patch('/clinic-subscriptions/{id}')
  @response(204, {
    description: 'ClinicSubscription PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClinicSubscription, {partial: true}),
        },
      },
    })
    clinicSubscription: ClinicSubscription,
  ): Promise<void> {
    await this.clinicSubscriptionRepository.updateById(id, clinicSubscription);
  }

  @del('/clinic-subscriptions/{id}')
  @response(204, {
    description: 'ClinicSubscription DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clinicSubscriptionRepository.deleteById(id);
  }
}
