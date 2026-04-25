import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateOccupancyCountDto } from './dto/update-occupancy-count.dto';
import { OccupancyService } from './occupancy.service';

@ApiTags('Occupancy')
@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {}

  /**
   * Check in people to a room
   */
  @Post('rooms/:id/enter')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check in people to a room (increment occupancy)' })
  @ApiResponse({ status: 200, description: 'Occupancy incremented' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async checkIn(@Param('id', ParseIntPipe) locationId: number, @Body() body: UpdateOccupancyCountDto) {
    const count = body?.count ?? 1;
    return this.occupancyService.checkIn(locationId, count);
  }

  /**
   * Check out people from a room
   */
  @Post('rooms/:id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check out people from a room (decrement occupancy)' })
  @ApiResponse({ status: 200, description: 'Occupancy decremented' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async checkOut(@Param('id', ParseIntPipe) locationId: number, @Body() body: UpdateOccupancyCountDto) {
    const count = body?.count ?? 1;
    return this.occupancyService.checkOut(locationId, count);
  }

  /**
   * Get occupancy for a single room
   */
  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get current occupancy for a room' })
  @ApiResponse({ status: 200, description: 'Room occupancy data' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getOccupancy(@Param('id', ParseIntPipe) locationId: number) {
    return this.occupancyService.getOccupancy(locationId);
  }

  /**
   * Get occupancy for all rooms
   */
  @Get('all')
  @ApiOperation({ summary: 'Get occupancy for all rooms' })
  @ApiResponse({ status: 200, description: 'All rooms occupancy data' })
  async getAllOccupancy() {
    return this.occupancyService.getAllOccupancy();
  }

  /**
   * Get occupancy with location details (for security dashboard)
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SECURITY)
  @ApiOperation({ summary: 'Get occupancy data for security dashboard (with location details)' })
  @ApiResponse({ status: 200, description: 'All rooms with occupancy and location details' })
  async getDashboardData() {
    return this.occupancyService.getAllOccupancyWithDetails();
  }
}
