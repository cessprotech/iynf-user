export interface CreateUserInterface {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    country: string;
    city: string;
    currency: string;
    termsAndConditionsAgreement: boolean;
    avatar: string;
    linkedIn: string;
    twitter: string;
    password?: string;
    socialId?: string;
    socialType?: 'google' | 'facebook';
}