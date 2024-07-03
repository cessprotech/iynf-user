// import { APP_ENV } from '@app/app.config';
// import { APP_CONFIG } from '@app/app.constants';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as Mailgun from 'mailgun-js';

// interface UserDetails {
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// interface MailPurposeTemplate {
//   getSubject(): string;
//   getHtmlMsg(): string;
// }

// export class MailService {
//   private configService = new ConfigService();
//   private mailgun = Mailgun({
//     apiKey: this.configService.get(APP_CONFIG.MAILGUN_API_KEY),
//     domain: this.configService.get(APP_CONFIG.MAILGUN_DOMAIN),
//   });

//   constructor() {}

//   async sendForVerification(userDetails: UserDetails, otpCode: string) {
//     console.log(userDetails);
//     return this.sendMail(
//       userDetails,
//       new VerificationTemplate(userDetails, otpCode),
//     );
//   }

//   async sendForForgotPassword(userDetails: UserDetails, otpCode: string) {
//     return this.sendMail(
//       userDetails,
//       new ForgotPasswordTemplate(userDetails, otpCode),
//     );
//   }

//   private async sendMail(
//     userDetails: UserDetails,
//     mailPurposeTemplate: MailPurposeTemplate,
//   ) {
//     const fromEmail = this.configService.get(APP_CONFIG.MAILGUN_FROM);
//     console.log(fromEmail);
//     const data = {
//       from: `Iynfluencer <${fromEmail}>`,
//       to: userDetails.email,
//       subject: mailPurposeTemplate.getSubject(),
//       html: mailPurposeTemplate.getHtmlMsg(),
//     };

//     return new Promise<void>((resolve, reject) => {
//       this.mailgun.messages().send(data, (err: any, body: any) => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });
//   }
// }

// export class VerificationTemplate implements MailPurposeTemplate {
//   constructor(private userDetails: UserDetails, private otpCode: string) {}

//   getSubject() {
//     return 'Welcome to Iynfluencer';
//   }

//   getHtmlMsg() {
//     return `
//         <html lang="en">
//             <head>
//               <meta charset="utf-8" />
//               <meta name="viewport" content="width=device-width, initial-scale=1" />
//               <meta name="color-scheme" content="light dark" />
//               <meta name="supported-color-schemes" content="light dark" />
//               <style type="text/css">
//                 :root {
//                   color-scheme: light dark;
//                   supported-color-schemes: light dark;
//                 }
//                 body {
//                   background: #2d2d2d !important;
//                   color: #f0f0f0 !important;
//                   margin: 0;
//                   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
//                     'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
//                     'Helvetica Neue', sans-serif;
//                   -webkit-font-smoothing: antialiased;
//                   -moz-osx-font-smoothing: grayscale;
//                 }
          
//                 a {
//                   outline: none;
//                   border: none;
//                   padding: 5px 24px;
//                   background-color: #f0bc03;
//                   border-radius: 8px;
//                   font-style: normal;
//                   font-weight: 600;
//                   font-size: 18px;
//                   line-height: 30px;
//                   margin: 18px 0;
//                   display: inline-block;
//                 }
//               </style>
//             </head>
//             <body>
//               <h3>Hi, ${this.userDetails.firstName} ${this.userDetails.lastName}</h3>
//               <p>
//                 We are happy you signed up for Iynfluencer. To start exploring please confirm
//                 your email address. Below is an OTP to confirm your email with.
//               </p>
//               <a>${this.otpCode} ${this.userDetails.firstName}</a>
//               <p>
//                 <span>Welcome to Iynfluencer!</span><br />
//                 <span>The Iynfluencer Team</span>
//               </p>
//             </body>
//           </html>
//         `;
//   }
// }

// export class ForgotPasswordTemplate implements MailPurposeTemplate {
//   constructor(private userDetails: UserDetails, private otpCode: string) {}

//   getSubject() {
//     return 'Iynfluencer Account Password Reset';
//   }

//   getHtmlMsg() {
//     return `
//           <html lang="en">
//               <head>
//                 <meta charset="utf-8" />
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <meta name="color-scheme" content="light dark" />
//                 <meta name="supported-color-schemes" content="light dark" />
//                 <style type="text/css">
//                   :root {
//                     color-scheme: light dark;
//                     supported-color-schemes: light dark;
//                   }
//                   body {
//                     background: #2d2d2d !important;
//                     color: #f0f0f0 !important;
//                     margin: 0;
//                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
//                       'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
//                       'Helvetica Neue', sans-serif;
//                     -webkit-font-smoothing: antialiased;
//                     -moz-osx-font-smoothing: grayscale;
//                   }
            
//                   a {
//                     outline: none;
//                     border: none;
//                     padding: 5px 24px;
//                     background-color: #f0bc03;
//                     border-radius: 8px;
//                     font-style: normal;
//                     font-weight: 600;
//                     font-size: 18px;
//                     line-height: 30px;
//                     margin: 18px 0;
//                     display: inline-block;
//                   }
//                 </style>
//               </head>
//                 <body>
//                 <h3>Hi, ${this.userDetails.firstName} ${this.userDetails.lastName}</h3>
//                 <p>
//                   We received a request to reset the password for your account. Below is an OTP to use in order to be able to reset your password.
//                 </p>
//                 <a>${this.otpCode}</a>
//                 <p>
//                   <span>Enjoy the Ride!</span><br />
//                   <span>The Iynfluencer Team</span>
//                 </p>
//               </body>
//             </html>
//           `;
//   }
// }
