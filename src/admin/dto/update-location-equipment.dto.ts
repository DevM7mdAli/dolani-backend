import { ApiProperty } from '@nestjs/swagger';

import { Equipment } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateLocationEquipmentDto {
  @ApiProperty({
    enum: Equipment,
    isArray: true,
    example: [Equipment.PROJECTOR, Equipment.WHITEBOARD],
    description: 'List of equipment in this location (replaces existing)',
  })
  @IsArray()
  @IsEnum(Equipment, { each: true })
  @IsNotEmpty()
  equipment!: Equipment[];
}
