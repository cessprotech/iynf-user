import { BaseResponses } from "@app/common/helpers";

export const USER_RESPONSE = {
  ...BaseResponses('User'),

  ERROR: {
    EMAIL_EXIST: 'Email user used',
    MOBILE_NUMBER_EXIST: 'Mobile Number user used',
    CREATE_ERROR: 'Create Error',
    NOT_FOUND: 'User not found.',
    USER_EXIST: 'User exist.',
  },
};