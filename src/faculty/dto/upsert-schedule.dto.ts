import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScheduleSlotEntryDto {
  @ApiProperty({ example: 'CS201' })
  @IsString()
  @IsNotEmpty()
  course_code!: string;

  @ApiProperty({ example: 'Data Structures' })
  @IsString()
  @IsNotEmpty()
  course_name!: string;

  @ApiPropertyOptional({ example: 'هياكل البيانات' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  course_name_ar?: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.SUNDAY })
  @IsEnum(DayOfWeek)
  day!: DayOfWeek;

  @ApiProperty({ example: '08:00', description: 'Start time HH:MM' })
  @IsMilitaryTime()
  @IsNotEmpty()
  start_time!: string;

  @ApiProperty({ example: '09:30', description: 'End time HH:MM' })
  @IsMilitaryTime()
  @IsNotEmpty()
  end_time!: string;

  @ApiProperty({ example: 'A-201' })
  @IsString()
  @IsNotEmpty()
  room!: string;

  @ApiProperty({ example: 45, default: 0 })
  @IsInt()
  @Min(0)
  student_count!: number;
}

export class UpsertScheduleDto {
  @ApiProperty({
    type: [ScheduleSlotEntryDto],
    description: 'Full weekly schedule — replaces all existing slots',
  })
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotEntryDto)
  slots!: ScheduleSlotEntryDto[];
}
