export interface SignupInterface {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    isSocial?: boolean;
    socialId?: string;
    socialType?: 'google' | 'facebook';
    termsAndConditionsAgreement: boolean;
}

export interface sendVerificationMail {
    firstName: string;
    lastName: string;
    email: string;
}