import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBeaconDto {
  @ApiProperty({ example: 'CP28-58A0', description: 'BLE beacon local name — unique per device' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'e5a4a7e5a48f31323334', description: 'Eddystone namespace/UUID (optional)' })
  @IsString()
  @IsOptional()
  uuid?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  operating?: boolean;

  @ApiProperty({ example: 1, description: 'Location ID this beacon is placed at' })
  @IsInt()
  @IsPositive()
  location_id!: number;

  @ApiProperty({ example: 1, description: 'Floor ID' })
  @IsInt()
  @IsPositive()
  floor_id!: number;

  @ApiPropertyOptional({ example: 1, description: 'Department ID (optional)' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  department_id?: number;

  @ApiProperty({ example: 0.5, description: 'Normalized X coordinate (0–1)' })
  @IsNumber()
  coordinate_x!: number;

  @ApiProperty({ example: 0.5, description: 'Normalized Y coordinate (0–1)' })
  @IsNumber()
  coordinate_y!: number;
}
