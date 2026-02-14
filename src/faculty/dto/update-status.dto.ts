import { ApiProperty } from '@nestjs/swagger';

import { ProfessorStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ProfessorStatus, example: ProfessorStatus.AVAILABLE })
  @IsEnum(ProfessorStatus)
  @IsNotEmpty()
  status!: ProfessorStatus;
}
