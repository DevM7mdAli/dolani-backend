import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfessorDto {
  @ApiPropertyOptional({ example: 'Dr. Ahmed Mohamed', description: 'Full name of the professor' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  full_name?: string;

  @ApiPropertyOptional({ example: 'ahmed.mohamed@university.edu', description: 'University email' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 1, description: 'Department ID' })
  @IsOptional()
  @IsInt()
  department_id?: number;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to show phone number publicly',
  })
  @IsOptional()
  show_phone?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Office location ID' })
  @IsOptional()
  @IsInt()
  location_id?: number | null;
}
