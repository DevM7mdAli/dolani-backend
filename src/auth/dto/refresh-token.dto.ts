import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token received from login' })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
