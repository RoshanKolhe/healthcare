/* eslint-disable @typescript-eslint/return-await */
import * as nodemailer from 'nodemailer';
import siteSettings from '../utils/config';
export interface EmailManager<T = Object> {
  sendMail(mailObj: object): Promise<T>;
}

export class EmailService {
  constructor() {}

  async sendMail(mailObj: object): Promise<object> {
    // const configOption = Utils.getSiteOptions();

    const transporter = nodemailer.createTransport(siteSettings.email);

    return await transporter.sendMail(mailObj);
  }
}
