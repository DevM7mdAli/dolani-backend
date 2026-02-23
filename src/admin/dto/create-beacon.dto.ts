import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateBeaconDto {
  @ApiProperty({ example: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  uuid!: string;

  @ApiPropertyOptional({ example: 'Beacon Floor-1 Hall', description: 'Optional label for the beacon' })
  @IsString()
  @IsOptional()
  name?: string;

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
}
