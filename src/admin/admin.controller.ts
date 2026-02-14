import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateBeaconDto } from './dto/create-beacon.dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreatePathDto } from './dto/create-path.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Buildings ───────────────────────────────────────────────────────

  @Post('buildings')
  @ApiOperation({ summary: 'Create a building' })
  @ApiResponse({ status: 201, description: 'Building created' })
  @ApiResponse({ status: 409, description: 'Building code already exists' })
  createBuilding(@Body() dto: CreateBuildingDto) {
    return this.adminService.createBuilding(dto);
  }

  @Get('buildings')
  @ApiOperation({ summary: 'List all buildings' })
  findAllBuildings() {
    return this.adminService.findAllBuildings();
  }

  @Get('buildings/:id')
  @ApiOperation({ summary: 'Get building by ID (with floors and locations)' })
  findBuilding(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findBuildingById(id);
  }

  @Delete('buildings/:id')
  @ApiOperation({ summary: 'Delete a building (cascades to floors)' })
  deleteBuilding(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBuilding(id);
  }

  // ── Floors ──────────────────────────────────────────────────────────

  @Post('floors')
  @ApiOperation({ summary: 'Create a floor' })
  @ApiResponse({ status: 201, description: 'Floor created' })
  createFloor(@Body() dto: CreateFloorDto) {
    return this.adminService.createFloor(dto);
  }

  @Get('floors')
  @ApiOperation({ summary: 'List all floors (optionally filter by building)' })
  @ApiQuery({ name: 'buildingId', required: false, type: Number })
  findAllFloors(@Query('buildingId') buildingId?: string) {
    return this.adminService.findAllFloors(buildingId ? +buildingId : undefined);
  }

  @Get('floors/:id')
  @ApiOperation({ summary: 'Get floor by ID (with locations and beacons)' })
  findFloor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findFloorById(id);
  }

  @Delete('floors/:id')
  @ApiOperation({ summary: 'Delete a floor (cascades to locations)' })
  deleteFloor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteFloor(id);
  }

  // ── Departments ─────────────────────────────────────────────────────

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  @ApiResponse({ status: 201, description: 'Department created' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.adminService.createDepartment(dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all departments' })
  findAllDepartments() {
    return this.adminService.findAllDepartments();
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID (with professors and locations)' })
  findDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findDepartmentById(id);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete a department' })
  deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteDepartment(id);
  }

  // ── Locations ───────────────────────────────────────────────────────

  @Post('locations')
  @ApiOperation({ summary: 'Create a location (graph node)' })
  @ApiResponse({ status: 201, description: 'Location created' })
  createLocation(@Body() dto: CreateLocationDto) {
    return this.adminService.createLocation(dto);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List all locations (optionally filter by floor)' })
  @ApiQuery({ name: 'floorId', required: false, type: Number })
  findAllLocations(@Query('floorId') floorId?: string) {
    return this.adminService.findAllLocations(floorId ? +floorId : undefined);
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Get location by ID' })
  findLocation(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findLocationById(id);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update a location' })
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLocationDto>) {
    return this.adminService.updateLocation(id, dto);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Delete a location (cascades to paths and beacons)' })
  deleteLocation(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteLocation(id);
  }

  // ── Paths ───────────────────────────────────────────────────────────

  @Post('paths')
  @ApiOperation({ summary: 'Create a path (graph edge) between two locations' })
  @ApiResponse({ status: 201, description: 'Path created' })
  createPath(@Body() dto: CreatePathDto) {
    return this.adminService.createPath(dto);
  }

  @Get('paths')
  @ApiOperation({ summary: 'List all paths' })
  findAllPaths() {
    return this.adminService.findAllPaths();
  }

  @Delete('paths/:id')
  @ApiOperation({ summary: 'Delete a path' })
  deletePath(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePath(id);
  }

  // ── Beacons ─────────────────────────────────────────────────────────

  @Post('beacons')
  @ApiOperation({ summary: 'Create a BLE beacon' })
  @ApiResponse({ status: 201, description: 'Beacon created' })
  createBeacon(@Body() dto: CreateBeaconDto) {
    return this.adminService.createBeacon(dto);
  }

  @Get('beacons')
  @ApiOperation({ summary: 'List all beacons' })
  findAllBeacons() {
    return this.adminService.findAllBeacons();
  }

  @Delete('beacons/:id')
  @ApiOperation({ summary: 'Delete a beacon' })
  deleteBeacon(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBeacon(id);
  }
}
