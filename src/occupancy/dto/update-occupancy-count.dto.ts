import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOccupancyCountDto {
  @ApiPropertyOptional({
    description: 'Number of people to increment/decrement (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
}
