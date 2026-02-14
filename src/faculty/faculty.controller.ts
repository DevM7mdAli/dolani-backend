import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateOfficeHoursDto } from './dto/update-office-hours.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FacultyService } from './faculty.service';

@ApiTags('Faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  // ── Public endpoints ────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all professors with office hours' })
  @ApiResponse({ status: 200, description: 'Returns all professors' })
  findAll() {
    return this.facultyService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search professors by name' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (professor name)' })
  @ApiResponse({ status: 200, description: 'Returns matching professors' })
  search(@Query('q') query: string) {
    return this.facultyService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a professor by ID' })
  @ApiResponse({ status: 200, description: 'Returns the professor' })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }

  // ── Authenticated faculty endpoints ─────────────────────────────────

  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own professor profile (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Returns professor profile with office hours' })
  getProfile(@CurrentUser() user: { sub: number }) {
    return this.facultyService.getProfile(user.sub);
  }

  @Put('me/office-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own office hours (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Office hours updated, returns updated profile' })
  updateOfficeHours(@CurrentUser() user: { sub: number }, @Body() dto: UpdateOfficeHoursDto) {
    return this.facultyService.updateOfficeHours(user.sub, dto);
  }

  @Put('me/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability status (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(@CurrentUser() user: { sub: number }, @Body() dto: UpdateStatusDto) {
    return this.facultyService.updateStatus(user.sub, dto);
  }
}
