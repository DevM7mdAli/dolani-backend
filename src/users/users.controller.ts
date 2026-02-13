import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('User management')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Post('faculty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new faculty member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Faculty member created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  @ApiResponse({ status: 409, description: 'Email or Username already exists.' })
  async createFaculty(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createFaculty(createUserDto);
  }

  @Get('faculty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all faculty members (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of faculty members retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async getFaculty() {
    return this.usersService.findAllFaculty();
  }
}
