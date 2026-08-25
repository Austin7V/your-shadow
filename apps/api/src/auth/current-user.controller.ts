import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUserService } from './services/current-user.service';
import type { AuthenticatedRequest } from './types/authenticated-request.type';

@Controller('auth')
export class CurrentUserController {
  constructor(private readonly currentUserService: CurrentUserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(
    @Req() request: AuthenticatedRequest,
  ): Promise<CurrentUserResponseDto> {
    return this.currentUserService.getById(request.auth.userId);
  }
}
