import {injectable, BindingScope} from '@loopback/core';
import Razorpay from 'razorpay';

@injectable({scope: BindingScope.TRANSIENT})
export class RazorPayService {
  private razorpay: Razorpay;

  constructor() {
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  async createOrder(checkOutData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: any;
  }) {
    try {
      const options = {
        amount: checkOutData.amount, // already in paise from controller
        currency: checkOutData.currency,
        receipt: checkOutData.receipt,
        notes: checkOutData.notes,
        payment_capture: 1,
      };

      const order = await this.razorpay.orders.create(options);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        subscriptionId: checkOutData.notes?.subscriptionId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }
}
