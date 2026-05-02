import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({ example: 'cXXXXXXX:APA91bXXXXX', description: 'FCM device token' })
  @IsString()
  token!: string;
}
