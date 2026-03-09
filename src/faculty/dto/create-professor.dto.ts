import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({ example: 'Dr. Ahmed Mohamed', description: 'Full name of the professor' })
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  full_name!: string;

  @ApiProperty({ example: 'ahmed.mohamed@university.edu', description: 'University email' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiPropertyOptional({ example: 1, description: 'Department ID' })
  @IsInt()
  department_id!: number;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to show phone number publicly',
    default: false,
  })
  @IsOptional()
  show_phone?: boolean = false;

  @ApiPropertyOptional({ example: 1, description: 'Office location ID' })
  @IsOptional()
  @IsInt()
  location_id?: number | null;

  @ApiPropertyOptional({ example: 1, description: 'User ID to link (optional, auto-creates if not provided)' })
  @IsOptional()
  @IsInt()
  user_id?: number;
}
