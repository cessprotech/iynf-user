// import { APP_ENV } from '@app/app.config';
// import { APP_CONFIG } from '@app/app.constants';
// import { Logger, LogService } from '@core/logger';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as Mailgun from 'mailgun-js';

// interface UserDetails {
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// interface WelcomeMailVariables {
//   email: string;
//   name: string;
// }

// interface ForgotPasswordTokenVariables {
//   name: string;
//   token: number;
// }

// type MailVariables = WelcomeMailVariables | ForgotPasswordTokenVariables;

// interface MailData {
//   to: string;
//   from: string;
//   subject: string;
//   template: string;
//   'h:X-Mailgun-Variables': string;
// }

// @Injectable()
// export class MailService {
//   private configService = new ConfigService();

//   @Logger(MailService.name) private readonly logger: LogService;

//   private mailgun = Mailgun({
//     apiKey: this.configService.get(APP_CONFIG.MAILGUN_API_KEY),
//     domain: this.configService.get(APP_CONFIG.MAILGUN_DOMAIN),
//   });

//   constructor() {}

//   async sendVerification(userDetails: UserDetails) {
//     const subject = 'Welcome to Iynfluencer';
//     const template = 'welcome-to-iynfluencer';
//     const fullName = `${userDetails.firstName} ${userDetails.lastName}`.replace(/\b\w/g, (c) => c.toUpperCase());

//     const data = this.generateMailData(userDetails.email, subject, template, { name: fullName, email: userDetails.email});

//     return await this.sendMail(data);
//   }
 
//   async sendForgotPassword(userDetails: UserDetails, token: number) {

//     const subject = 'Iynfluencer - Your Password Reset Token.';
//     const template = 'reset-password-token';
//     const fullName = `${userDetails.firstName} ${userDetails.lastName}`.replace(/\b\w/g, (c) => c.toUpperCase());

//     const data = this.generateMailData(userDetails.email, subject, template, { name: fullName, token }); 

//     return await this.sendMail(data);
//   }

//   private async sendMail(query: MailData) {
//     try {
//       await this.mailgun.messages().send(query);
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   private generateMailData = (to: string, subject: string, template: string, variables: MailVariables) => {
//     return {
//       to,
//       from: `Iynfluencer <${this.configService.get(APP_CONFIG.MAILGUN_FROM)}>`,
//       subject,
//       template,
//       'h:X-Mailgun-Variables': JSON.stringify({
//         ...variables
//       }),
//     }
//   }
// }