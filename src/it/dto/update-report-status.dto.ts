import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ReportStatus } from '@prisma/client';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const ALLOWED_STATUSES = [ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED] as const;

export class UpdateReportStatusDto {
  @ApiProperty({
    enum: ALLOWED_STATUSES,
    description: 'New status — IT staff can move a report to IN_PROGRESS or RESOLVED',
    example: 'IN_PROGRESS',
  })
  @IsIn(ALLOWED_STATUSES, { message: 'status must be IN_PROGRESS or RESOLVED' })
  status!: (typeof ALLOWED_STATUSES)[number];

  @ApiPropertyOptional({ example: 'Replaced the lamp module, tested OK.' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}
