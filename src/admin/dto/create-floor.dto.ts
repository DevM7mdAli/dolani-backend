import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({ example: 1, description: 'Floor number' })
  @IsInt()
  @IsNotEmpty()
  floor_number!: number;

  @ApiPropertyOptional({ example: 'https://example.com/floor1.png' })
  @IsString()
  @IsOptional()
  floor_plan_image_url?: string;

  @ApiProperty({ example: 1, description: 'Building ID this floor belongs to' })
  @IsInt()
  @IsPositive()
  building_id!: number;
}
