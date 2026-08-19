import { Controller, Get } from '@nestjs/common';
import type { ApiMessage } from '@your-shadow/contracts';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomeMessage(): ApiMessage {
    return this.appService.getWelcomeMessage();
  }
}
