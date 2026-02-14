import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LocationType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ enum: LocationType, example: LocationType.OFFICE })
  @IsEnum(LocationType)
  @IsNotEmpty()
  type!: LocationType;

  @ApiProperty({ example: 'Dr. Ahmed Office' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'A11-201' })
  @IsString()
  @IsOptional()
  room_number?: string;

  @ApiProperty({ example: 45.5, description: 'X coordinate on floor plan' })
  @IsNumber()
  coordinate_x!: number;

  @ApiProperty({ example: 32.8, description: 'Y coordinate on floor plan' })
  @IsNumber()
  coordinate_y!: number;

  @ApiProperty({ example: 1, description: 'Floor ID' })
  @IsInt()
  @IsPositive()
  floor_id!: number;

  @ApiPropertyOptional({ example: 1, description: 'Department ID' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  department_id?: number;
}
