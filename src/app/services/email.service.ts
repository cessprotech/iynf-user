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

import nodemailer from 'nodemailer'; // ES module import
import Mailgen from 'mailgen'; // Use ES module import syntax
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from '@app/app.constants';

@Injectable()
export class SendMailService {
    private transporter: any;
    private mailGenerator: any;

    constructor(private configService: ConfigService) { 
        // Configure mailgen by setting a theme and your product info
        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in header & footer of e-mails sent
                name: 'Iynfluencer',
                link: 'https://www.Iynfluencer.com/'
            }
        });

        // Configure nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>(APP_CONFIG.EMAIL_HOST),
            port: this.configService.get<number>(APP_CONFIG.EMAIL_PORT),
            secure: true,
            auth: {
                user: this.configService.get<string>(APP_CONFIG.EMAIL_USER),
                pass: this.configService.get<string>(APP_CONFIG.EMAIL_PASS)
            }
        });
    }

    generateOtp(): string {
        let num = "";
        for (let i = 0; i < 6; i++) { 
            num += Math.floor(Math.random() * 10).toString();
        }
        return num;
    }

    async sendRegisterMail(to: string, name: string): Promise<boolean> {
        try {
            const num = this.generateOtp();
            const emailSender = {
                body: {
                    name: `Hi ${name}`,
                    intro: 'Welcome onboard to Iynfluencer app where you can monetize your skill and find experienced influencers to market your business, platform or brand.',
                    action: {
                        instructions: 'To get started, enter the OTP in the app window',
                        button: {
                            color: '#ffffff',
                            text: `<span style="font-size: 30px; font-weight: bolder; color: black">${num}</span>`,
                            link: ''
                        }
                    },
                    outro: "Need help, or have questions? Just reply to this email, we'd love to help.\n\n Team Iynfluencer."
                }
            };

            // Generate an HTML email with the provided contents
            const message = this.mailGenerator.generate(emailSender);

            const mailOptions = {
                from: this.configService.get<string>(APP_CONFIG.EMAIL_USER),
                to: to,
                subject: 'Welcome Message',
                html: message
            };

            const info = await this.transporter.sendMail(mailOptions);
            return info.response.includes('OK');
        } catch (error) {
            console.error('Mail sending error:', error);
            return false;
        }
    }

    async sendForgotMail(to: string, name: string, num: number) {
        try {
            var emailSender: any = {
                body: {
                    name: `Hi ${name}`,
                    intro: 'We got a request to reset your password, if this was you, enter the otp in the next page to reset password or ignore and nothing will happen to your account',

                    action: {
                        instructions: 'To get started, enter the OTP in the app window',
                        button: {
                            color: '#ffffff',
                            text: `<span style="font-size: 30px; font-weight: bolder; color: black">${num}</span>`,
                            link: ''
                        }
                    },
                    
                    outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.\n\n Team Iynfluencer.'
                }
            };

            // Generate an HTML email with the provided contents
            const message =  this.mailGenerator.generate(emailSender)

            const mailOptions = {
                from: this.configService.get<string>(APP_CONFIG.EMAIL_USER),
                to: to,
                subject: 'Forgot Password',
                html: message
            };

            const info = await this.transporter.sendMail(mailOptions);
            return info.response.includes('OK'); // Assuming successful send if response includes 'OK'
        } catch (error) {
            console.error('Mail sending error:', error);
            return false;
        }
    }
}
