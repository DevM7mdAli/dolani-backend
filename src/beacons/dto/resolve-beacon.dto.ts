import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ResolveBeaconDto {
  @ApiProperty({ example: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', description: 'BLE beacon UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  uuid!: string;
}
