import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRssiReadingDto {
  @ApiProperty({ example: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', description: 'Beacon UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  beaconUuid!: string;

  @ApiProperty({ example: -67, description: 'RSSI value in dBm (typically -100 to 0)' })
  @IsInt()
  @Min(-100)
  @Max(0)
  rssi!: number;
}
