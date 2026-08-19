import { Injectable } from '@nestjs/common';
import { APP_NAME, type ApiMessage } from '@your-shadow/contracts';

@Injectable()
export class AppService {
  getWelcomeMessage(): ApiMessage {
    return {
      message: `${APP_NAME} API`,
    };
  }
}
