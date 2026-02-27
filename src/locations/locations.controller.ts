import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LocationQueryDto } from './dto/location-query.dto';
import { LocationsService } from './locations.service';

@ApiTags('Locations (Public)')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List locations with search, filters, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of locations' })
  findAll(@Query() query: LocationQueryDto) {
    return this.locationsService.findAll(query);
  }

  @Get('buildings')
  @ApiOperation({ summary: 'List all buildings with their floors (for picker UI)' })
  @ApiResponse({ status: 200, description: 'All buildings with nested floors' })
  getBuildings() {
    return this.locationsService.findAllBuildings();
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({ status: 200, description: 'All departments' })
  getDepartments() {
    return this.locationsService.findAllDepartments();
  }

  @Get('floors')
  @ApiOperation({ summary: 'List floors with optional building filter' })
  @ApiQuery({ name: 'buildingId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of floors' })
  getFloors(@Query('buildingId') buildingId?: string) {
    return this.locationsService.findAllFloors(buildingId ? +buildingId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single location with full details' })
  @ApiResponse({ status: 200, description: 'Location detail with floor, building, department, beacons, paths' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }
}
