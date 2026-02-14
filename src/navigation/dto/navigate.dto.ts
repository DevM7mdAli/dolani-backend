import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

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
    example: false,
    description: 'Emergency mode: excludes elevators and routes to nearest exit',
  })
  @IsBoolean()
  @IsOptional()
  emergency?: boolean;
}
