import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateRssiReadingDto {
  @ApiProperty({ example: 'CP28-58A0', description: 'BLE beacon local name — unique per device' })
  @IsString()
  @IsNotEmpty()
  beaconName!: string;

  @ApiProperty({ example: -67, description: 'RSSI value in dBm (typically -100 to 0)' })
  @IsInt()
  @Min(-100)
  @Max(0)
  rssi!: number;
}
