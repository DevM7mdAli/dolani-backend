import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BeaconsService } from './beacons.service';
import { CreateRssiReadingDto } from './dto/create-rssi-reading.dto';
import { ResolveBeaconDto } from './dto/resolve-beacon.dto';

@ApiTags('Beacons')
@Controller('beacons')
export class BeaconsController {
  constructor(private readonly beaconsService: BeaconsService) {}

  @Post('resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a BLE beacon UUID to its associated location' })
  @ApiResponse({ status: 200, description: 'Returns the location associated with the beacon' })
  @ApiResponse({ status: 404, description: 'Beacon not found' })
  resolve(@Body() dto: ResolveBeaconDto) {
    return this.beaconsService.resolveToLocation(dto.uuid);
  }

  @Post('rssi')
  @ApiOperation({ summary: 'Ingest an RSSI reading from a beacon' })
  @ApiResponse({ status: 201, description: 'Reading ingested, returns smoothed RSSI value' })
  @ApiResponse({ status: 404, description: 'Beacon not found' })
  ingestRssi(@Body() dto: CreateRssiReadingDto) {
    return this.beaconsService.ingestRssi(dto.beaconUuid, dto.rssi);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all beacons (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all beacons with locations' })
  findAll() {
    return this.beaconsService.findAll();
  }
}
