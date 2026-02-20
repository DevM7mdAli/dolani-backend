import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProfessorStatus, Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateOfficeHoursDto } from './dto/update-office-hours.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FacultyService } from './faculty.service';

@ApiTags('Faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  // ── Public endpoints ─────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List professors with pagination and optional filters' })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProfessorStatus })
  @ApiResponse({ status: 200, description: 'Paginated list of professors' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: ProfessorStatus,
  ) {
    return this.facultyService.findAll(query, departmentId ? +departmentId : undefined, status);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search professors by name' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (professor name)' })
  @ApiResponse({ status: 200, description: 'Returns matching professors' })
  search(@Query('q') query: string) {
    return this.facultyService.search(query);
  }

  // ── Authenticated faculty endpoints ──────────────────────────────────
  // NOTE: @Get('profile') must be declared before @Get(':id') so NestJS
  // matches the static segment first — otherwise 'profile' is parsed as an id.

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own professor profile (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Returns professor profile with office hours' })
  getProfile(@CurrentUser() user: { sub: number }) {
    return this.facultyService.getProfile(user.sub);
  }

  @Get('admin/office-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all office hours of the all doctors (Admin only)' })
  @ApiResponse({ status: 200, description: 'Office hours of all doctors' })
  getAllOfficeHours(@Query() query: PaginationQueryDto) {
    return this.facultyService.getAllDoctorsOfficeHours(query);
  }

  @Get('office-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all office hours of the all doctors' })
  @ApiResponse({ status: 200, description: 'Office hours of the doctor' })
  getOfficeHours(@CurrentUser() user: { sub: number }) {
    return this.facultyService.getDoctorOfficeHours(user.sub);
  }

  @Patch('office-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own office hours (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Office hours updated, returns updated profile' })
  updateOfficeHours(@CurrentUser() user: { sub: number }, @Body() dto: UpdateOfficeHoursDto) {
    return this.facultyService.updateOfficeHours(user.sub, dto);
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability status (Faculty only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(@CurrentUser() user: { sub: number }, @Body() dto: UpdateStatusDto) {
    return this.facultyService.updateStatus(user.sub, dto);
  }

  // ── Public parameterized endpoint — must come last among GET routes ──

  @Get(':id')
  @ApiOperation({ summary: 'Get a professor by ID' })
  @ApiResponse({ status: 200, description: 'Returns the professor' })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }
}
