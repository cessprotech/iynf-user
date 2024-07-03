import { APP_CONFIG } from '@app/app.constants';
import { configService } from '@core/common/constants';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {

  private client_id = configService.get(APP_CONFIG.GOOGLE_APP_ID);
  private client_secret = configService.get(APP_CONFIG.GOOGLE_APP_SECRET);
  
  async getUser(accessToken: string): Promise<{ 
    id: string;
    firstName: string;
    lastName: string;
    email: string;
 }> {
    const client = new OAuth2Client(this.client_id);

    const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: this.client_id,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    return { id: payload.sub, firstName: payload.given_name, lastName: payload.family_name, email: payload.email }
  }
}
