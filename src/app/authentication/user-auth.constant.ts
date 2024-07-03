export const UserAuth = 'user';

export interface UserAuthSessionInterface {
    user: string;
    email: string;
    lastLoggedIn: Date;
    lastPasswordChanged: Date;
}

export const USER_AUTH_EVENTS = {
    CREATE: 'user_created',
    LOGGED_IN: 'user_logged_in',
}