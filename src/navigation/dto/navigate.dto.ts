import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class NavigateDto {
  @ApiProperty({ example: 1, description: 'ID of the starting location' })
  @IsInt()
  @IsPositive()
  startLocationId!: number;

  @ApiProperty({ example: 42, description: 'ID of the destination location' })
  @IsInt()
  @IsPositive()
  endLocationId!: number;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Optional: X coordinate from beacon/sensor (if provided, will find nearest node automatically)',
  })
  @IsNumber()
  @IsOptional()
  startX?: number;

  @ApiPropertyOptional({
    example: 0.3,
    description: 'Optional: Y coordinate from beacon/sensor (if provided, will find nearest node automatically)',
  })
  @IsNumber()
  @IsOptional()
  startY?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Optional: Floor ID for start coordinates (improves nearest node search)',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  startFloorId?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Emergency mode: excludes elevators and routes to nearest exit',
  })
  @IsBoolean()
  @IsOptional()
  emergency?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'When true, exclude STAIRS nodes from pathfinding (accessibility)',
  })
  @IsBoolean()
  @IsOptional()
  avoidStairs?: boolean;
}
