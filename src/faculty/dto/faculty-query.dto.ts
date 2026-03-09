import { ApiPropertyOptional } from '@nestjs/swagger';

import { ProfessorStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FacultyQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 6, minimum: 1, maximum: 100, default: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 6;

  @ApiPropertyOptional({ description: 'Search keyword', example: 'Ahmed' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Department ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ enum: ProfessorStatus, description: 'Professor status' })
  @IsEnum(ProfessorStatus)
  @IsOptional()
  status?: ProfessorStatus;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'full_name' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.ASC;
}
