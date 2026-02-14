import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreatePathDto {
  @ApiProperty({ example: 1, description: 'Start location ID' })
  @IsInt()
  @IsPositive()
  start_location_id!: number;

  @ApiProperty({ example: 2, description: 'End location ID' })
  @IsInt()
  @IsPositive()
  end_location_id!: number;

  @ApiProperty({ example: 5.2, description: 'Distance / weight for A* pathfinding' })
  @IsNumber()
  distance!: number;
}
