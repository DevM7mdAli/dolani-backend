import { ApiProperty } from '@nestjs/swagger';

import { DeptType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science Department' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: DeptType, example: DeptType.CSD })
  @IsEnum(DeptType)
  @IsNotEmpty()
  type!: DeptType;
}
