import { UseInterceptors } from '@nestjs/common';
import { ChangePasswordInterceptor } from './session.changepassword.interceptor';
import { ForgotPasswordInterceptor } from './session.forgotpassword.interceptor';
import { LoginSessionInterceptor } from './session.login.interceptor';
import { ResetPasswordInterceptor } from './session.resetpassword.interceptor';
import { SignupSessionInterceptor } from './session.signup.interceptor';
import { SocialSignupSessionInterceptor } from './session.social.signup.interceptor';
import { VerifyForgotPasswordTokenInterceptor } from './session.verify.forgotpasstoken.interceptor';

export const SocialSignupSession = () => UseInterceptors(SocialSignupSessionInterceptor);

export const SignupSession = () => UseInterceptors(SignupSessionInterceptor);

export const LoginSession = () => UseInterceptors(LoginSessionInterceptor);

export const ForgotPasswordSession = () =>
  UseInterceptors(ForgotPasswordInterceptor);

export const VerifyForgotPasswordTokenSession = () =>
  UseInterceptors(VerifyForgotPasswordTokenInterceptor);

export const ResetPasswordSession = () =>
  UseInterceptors(ResetPasswordInterceptor);

export const ChangePasswordSession = () =>
  UseInterceptors(ChangePasswordInterceptor);
