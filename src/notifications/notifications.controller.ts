import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RegisterTokenDto } from './dto/register-token.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register a device FCM token — called silently on mobile app start.
   * Public — no authentication required.
   */
  @Post('token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register device FCM token for push notifications' })
  @ApiResponse({ status: 204, description: 'Token registered successfully' })
  async registerToken(@Body() dto: RegisterTokenDto): Promise<void> {
    await this.notificationsService.registerToken(dto.token);
  }
}
