import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'CCSIT Building' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'A11', description: 'Unique building code' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
