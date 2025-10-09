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
      remainingBookingLimit:10,
      clinicBookingUsage: 0,
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
              planId: {type: 'number'},
              paymentDetails: {
                type: 'object',
                properties: {
                  personName: {type: 'string'},
                  phoneNumber: {type: 'string'},
                  email: {type: 'string'},
                  address: {
                    type: 'string',
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
      // 1️⃣ Current user
      const user = await this.userRepository.findById(currentUser.id);
      if (!user) throw new HttpErrors.Unauthorized('Access denied');

      // 2️⃣ Plan check
      if (!clinicSubscription.planId)
        throw new HttpErrors.BadRequest('Plan ID is required');

      const plan = await this.planRepository.findById(
        clinicSubscription.planId,
      );
      if (!plan) throw new HttpErrors.NotFound('Plan not found');

      // 3️⃣ Tax + Total
      const taxPercentage = plan.taxPercentageINR ?? 0;
      const taxAmount = (plan.discountedPriceINR * taxPercentage) / 100;
      const totalAmount = plan.discountedPriceINR + taxAmount;

      // 4️⃣ Get the latest successful subscription
      const lastSubscription = await this.clinicSubscriptionRepository.findOne({
        where: {clinicId: user.clinicId, status: 'success', isDeleted: false},
        order: ['createdAt DESC'],
      });
      console.log('Last subscription:', lastSubscription);

      // 5️⃣ Initialize base values
      const now = new Date();
      let newBookingLimit = plan.bookingLimit;
      let newRemainingBookingLimit = plan.bookingLimit;
      let newExpiryDate: Date;

      // 6️⃣ If the clinic already has a valid subscription
      if (lastSubscription) {
        const lastExpiry = new Date(lastSubscription.expiryDate);
        console.log('Last expiry:', lastExpiry);
        const isStillActive = lastExpiry > now;

        // If previous plan still active
        if (isStillActive) {
          const lastRemaining = lastSubscription.remainingBookingLimit ?? 0;
          newBookingLimit = lastRemaining + plan.bookingLimit;
          newRemainingBookingLimit = lastRemaining + plan.bookingLimit;

          // ✅ Extend expiry from last expiry date (not from today)
          newExpiryDate = new Date(lastExpiry);
        } else {
          newExpiryDate = new Date(now);
          console.log('newExpiryDate1', newExpiryDate);
        }
      } else {
        newExpiryDate = new Date(now);
        console.log('newExpiryDate2', newExpiryDate);
      }

      // 7️⃣ Add plan duration (from either now or last expiry)
      const planDays = plan.billingCycle === 'monthly' ? 30 : 365;
      newExpiryDate.setDate(newExpiryDate.getDate() + planDays);
      console.log('newExpiryDate3', newExpiryDate);

      // 8️⃣ Create subscription
      const newSubscriptionData: Partial<ClinicSubscription> = {
        planId: clinicSubscription.planId,
        planData: plan,
        clinicId: user.clinicId,
        purchasedByUserId: user.id,
        paymentDetails: clinicSubscription.paymentDetails,
        isFreeTrial: false,
        bookingLimit: newBookingLimit,
        remainingBookingLimit: newRemainingBookingLimit,
        clinicBookingUsage: 0,
        expiryDate: newExpiryDate,
        status: 'pending',
        amount: plan.discountedPriceINR,
        taxAmount,
        totalAmount,
        paymentProvider: 'razorpay',
      };
      console.log('newExpiryDate4', newSubscriptionData.expiryDate);
      console.log('newSubscriptionData', newSubscriptionData);

      const newSubscription =
        await this.clinicSubscriptionRepository.create(newSubscriptionData);
      console.log('newSubscription', newSubscription);

      const formattedInvoiceId = `INV${newSubscription.id!.toString().padStart(5, '0')}`;
      await this.clinicSubscriptionRepository.updateById(newSubscription.id!, {
        invoiceId: formattedInvoiceId,
      });

      newSubscription.invoiceId = formattedInvoiceId;
      console.log('Invoice ID:', formattedInvoiceId);

      // 9️⃣ Create Razorpay order
      const checkOutData = {
        amount: totalAmount * 100, // convert to paise
        currency: 'INR',
        receipt: `sub_${newSubscription.id}`,
        notes: {
          subscriptionId: newSubscription.id,
          userId: user.id,
        },
      };
      const razorpayOrder =
        await this.razorpayService.createOrder(checkOutData);

      return {success: true, paymentObject: razorpayOrder};
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
          paymentId: payment.id,
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

  @post('/subscriptions/callback/cancel')
  async cancelRazorpayPayment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              subscription_id: {type: 'number'},
            },
            required: ['subscription_id'],
          },
        },
      },
    })
    body: {
      subscription_id: number;
    },
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<{success: boolean; message: string}> {
    const {subscription_id} = body;

    const subscription =
      await this.clinicSubscriptionRepository.findById(subscription_id);

    if (!subscription) {
      throw new HttpErrors.NotFound('Subscription not found');
    }

    // Update status to cancelled
    await this.clinicSubscriptionRepository.updateById(subscription_id, {
      status: 'cancelled',
    });

    return {
      success: true,
      message: `Subscription ${subscription_id} cancelled by user.`,
    };
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLINIC],
    },
  })
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(ClinicSubscription) filter?: Filter<ClinicSubscription>,
  ): Promise<ClinicSubscription[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        {relation: 'clinic'},
        {relation: 'plan'},
        {relation: 'purchasedByUser'},
      ],
    };

    const currentUserPermission = currentUser.permissions;

    const userDetails: any = await this.userRepository.findById(
      currentUser.id,
      {
        include: ['clinic', 'branch'],
      },
    );
    console.log('userDetails', userDetails);

    // SUPER ADMIN → see all subscriptions
    if (currentUserPermission.includes(PermissionKeys.SUPER_ADMIN)) {
      return this.clinicSubscriptionRepository.find(filter);
    }

    // CLINIC → show subscriptions of that clinic
    if (currentUserPermission.includes(PermissionKeys.CLINIC)) {
      if (!userDetails.clinicId) {
        throw new HttpErrors.BadRequest('Clinic ID not found for current user');
      }

      return this.clinicSubscriptionRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          clinicId: userDetails.clinicId,
          status: 'success',
        },
      });
    }

    return [];
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
