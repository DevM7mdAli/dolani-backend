import { ApiPropertyOptional } from '@nestjs/swagger';

import { LocationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class LocationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LocationType, description: 'Filter by location type' })
  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @ApiPropertyOptional({ description: 'Filter by floor ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  floorId?: number;

  @ApiPropertyOptional({ description: 'Filter by building ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  buildingId?: number;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  departmentId?: number;
}
