import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ItService } from './it.service';

@ApiTags('IT')
@Controller('it')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.IT)
@ApiBearerAuth()
export class ItController {
  constructor(private readonly itService: ItService) {}

  // ── Dashboard stats ──────────────────────────────────────────────────

  @Get('reports/stats')
  @ApiOperation({ summary: 'Report count grouped by status (IT only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns { total, pending, inProgress, resolved }',
  })
  getStats() {
    return this.itService.getReportStats();
  }

  // ── Reports list ─────────────────────────────────────────────────────

  @Get('reports')
  @ApiOperation({ summary: 'List all facility reports with optional filters (IT only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of all reports' })
  getAllReports(@Query() query: ReportQueryDto) {
    const { status, category, ...pagination } = query;
    return this.itService.getAllReports(pagination, status, category);
  }

  // NOTE: /stats must come before /:id to prevent "stats" being parsed as an integer id.

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get full details of a single report (IT only)' })
  @ApiResponse({ status: 200, description: 'Report details including professor and resolver info' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  getReportById(@Param('id', ParseIntPipe) id: number) {
    return this.itService.getReportById(id);
  }

  // ── Status update ─────────────────────────────────────────────────────

  @Patch('reports/:id/status')
  @ApiOperation({
    summary: 'Update a report status (IT only)',
    description:
      'Moves a report to IN_PROGRESS or RESOLVED. Setting RESOLVED stamps resolved_at and records the IT staff member.',
  })
  @ApiResponse({ status: 200, description: 'Updated report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  updateReportStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number },
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.itService.updateReportStatus(id, user.sub, dto);
  }
}
