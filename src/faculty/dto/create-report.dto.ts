import { ApiProperty } from '@nestjs/swagger';

import { ReportCategory } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'Projector not working' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'The ceiling-mounted projector in Room A11-201 shows a blank screen.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ReportCategory, example: ReportCategory.PROJECTOR })
  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @ApiProperty({ example: 'A11-201' })
  @IsString()
  @IsNotEmpty()
  room!: string;
}
