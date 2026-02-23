import { ApiPropertyOptional } from '@nestjs/swagger';

import { ReportCategory, ReportStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus, description: 'Filter by report status' })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportCategory, description: 'Filter by report category' })
  @IsEnum(ReportCategory)
  @IsOptional()
  category?: ReportCategory;
}
