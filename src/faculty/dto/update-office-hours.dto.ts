import { ApiProperty } from '@nestjs/swagger';

import { DayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsMilitaryTime, IsNotEmpty, ValidateNested } from 'class-validator';

export class OfficeHourEntryDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.SUNDAY })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  day!: DayOfWeek;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:MM format' })
  @IsMilitaryTime()
  @IsNotEmpty()
  start_time!: string;

  @ApiProperty({ example: '11:00', description: 'End time in HH:MM format' })
  @IsMilitaryTime()
  @IsNotEmpty()
  end_time!: string;
}

export class UpdateOfficeHoursDto {
  @ApiProperty({ type: [OfficeHourEntryDto], description: 'Array of office hour entries' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfficeHourEntryDto)
  officeHours!: OfficeHourEntryDto[];
}
