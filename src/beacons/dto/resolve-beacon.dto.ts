import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveBeaconDto {
  @ApiProperty({ example: 'CP28-58A0', description: 'BLE beacon local name — unique per device' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
