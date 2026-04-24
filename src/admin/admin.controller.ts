import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { LocationQueryDto } from '../locations/dto/location-query.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminService } from './admin.service';
import { CreateBeaconDto } from './dto/create-beacon.dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreatePathDto } from './dto/create-path.dto';
import { SyncGraphDto } from './dto/sync-graph.dto';
import { UpdateBeaconDto } from './dto/update-beacon.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { UpdateLocationEquipmentDto } from './dto/update-location-equipment.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

  @Patch('buildings/:id')
  @ApiOperation({ summary: 'Update a building' })
  updateBuilding(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBuildingDto) {
    return this.adminService.updateBuilding(id, dto);
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

  @Patch('floors/:id')
  @ApiOperation({ summary: 'Update a floor' })
  updateFloor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFloorDto) {
    return this.adminService.updateFloor(id, dto);
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

  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update a department' })
  updateDepartment(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    return this.adminService.updateDepartment(id, dto);
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
  @ApiOperation({ summary: 'List locations with pagination and optional filters' })
  findAllLocations(@Query() query: LocationQueryDto) {
    return this.adminService.findAllLocations(query);
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Get location by ID' })
  findLocation(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findLocationById(id);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update a location' })
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLocationDto) {
    return this.adminService.updateLocation(id, dto);
  }

  @Patch('locations/:id/equipment')
  @ApiOperation({ summary: 'Update equipment for a location' })
  @ApiResponse({ status: 200, description: 'Equipment updated' })
  updateLocationEquipment(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLocationEquipmentDto) {
    return this.adminService.updateLocationEquipment(id, dto);
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
  @ApiOperation({ summary: 'List paths with pagination and optional filters' })
  @ApiQuery({ name: 'fromLocationId', required: false, type: Number })
  @ApiQuery({ name: 'toLocationId', required: false, type: Number })
  findAllPaths(
    @Query() query: PaginationQueryDto,
    @Query('fromLocationId') fromLocationId?: string,
    @Query('toLocationId') toLocationId?: string,
  ) {
    return this.adminService.findAllPaths(
      query,
      fromLocationId ? +fromLocationId : undefined,
      toLocationId ? +toLocationId : undefined,
    );
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
  @ApiOperation({ summary: 'List beacons with pagination and optional location filter' })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  findAllBeacons(@Query() query: PaginationQueryDto, @Query('locationId') locationId?: string) {
    return this.adminService.findAllBeacons(query, locationId ? +locationId : undefined);
  }

  @Patch('beacons/:id')
  @ApiOperation({ summary: 'Update a beacon' })
  updateBeacon(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBeaconDto) {
    return this.adminService.updateBeacon(id, dto);
  }

  @Delete('beacons/:id')
  @ApiOperation({ summary: 'Delete a beacon' })
  deleteBeacon(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBeacon(id);
  }

  // ── Graph Read / Sync ──────────────────────────────────────────

  @Get('graph/:floorId')
  @ApiOperation({ summary: 'Get the full graph (nodes, edges, beacons) for a floor' })
  @ApiResponse({ status: 200, description: 'Returns all locations, paths, and beacons for the floor' })
  getGraph(@Param('floorId', ParseIntPipe) floorId: number) {
    return this.adminService.getGraph(floorId);
  }

  @Post('graph/sync')
  @ApiOperation({ summary: 'Sync a full floor graph (nodes, edges, beacons) from the map editor' })
  @ApiResponse({ status: 201, description: 'Graph synced — returns client UUID → server ID mapping' })
  syncGraph(@Body() dto: SyncGraphDto) {
    return this.adminService.syncGraph(dto);
  }

  // ── Emergency ───────────────────────────────────────────────────────

  @Post('emergency')
  @Roles(Role.ADMIN, Role.SECURITY)
  @HttpCode(204)
  @ApiOperation({ summary: 'Trigger emergency — sends push notification to all devices' })
  @ApiResponse({ status: 204, description: 'Notification sent' })
  async triggerEmergency(): Promise<void> {
    await this.notificationsService.sendToAll(
      '🚨 Emergency Alert',
      'An emergency has been declared. Please follow evacuation procedures immediately.',
      { type: 'emergency' },
    );
  }

  @Delete('emergency')
  @Roles(Role.ADMIN, Role.SECURITY)
  @HttpCode(204)
  @ApiOperation({ summary: 'Deactivate emergency — silences alarm on all devices' })
  @ApiResponse({ status: 204, description: 'Deactivation signal sent' })
  async deactivateEmergency(): Promise<void> {
    await this.notificationsService.sendToAll(
      '✅ Emergency Cleared',
      'The emergency has been deactivated. You may return to normal.',
      { type: 'emergency_stop' },
    );
  }
}
