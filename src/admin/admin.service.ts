import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PaginatedResult, PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeaconDto } from './dto/create-beacon.dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreatePathDto } from './dto/create-path.dto';
import { UpdateBeaconDto } from './dto/update-beacon.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Buildings ───────────────────────────────────────────────────────

  async createBuilding(dto: CreateBuildingDto) {
    return this.prisma.building.create({ data: dto }).catch(this.handleUniqueError('Building code'));
  }

  async findAllBuildings() {
    return this.prisma.building.findMany({
      include: { floors: true },
      orderBy: { name: 'asc' },
    });
  }

  async findBuildingById(id: number) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: { floors: { include: { locations: true } } },
    });
    if (!building) throw new NotFoundException(`Building #${id} not found`);
    return building;
  }

  async updateBuilding(id: number, dto: UpdateBuildingDto) {
    await this.findBuildingById(id);
    return this.prisma.building.update({ where: { id }, data: dto });
  }

  async deleteBuilding(id: number) {
    await this.findBuildingById(id);
    return this.prisma.building.delete({ where: { id } });
  }

  // ── Floors ──────────────────────────────────────────────────────────

  async createFloor(dto: CreateFloorDto) {
    return this.prisma.floor.create({ data: dto }).catch(this.handleUniqueError('Floor number for this building'));
  }

  async findAllFloors(buildingId?: number) {
    return this.prisma.floor.findMany({
      where: buildingId ? { building_id: buildingId } : undefined,
      include: { building: true },
      orderBy: { floor_number: 'asc' },
    });
  }

  async findFloorById(id: number) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: { building: true, locations: true, beacons: true },
    });
    if (!floor) throw new NotFoundException(`Floor #${id} not found`);
    return floor;
  }

  async updateFloor(id: number, dto: UpdateFloorDto) {
    await this.findFloorById(id);
    return this.prisma.floor.update({
      where: { id },
      data: dto,
      include: { building: true },
    });
  }

  async deleteFloor(id: number) {
    await this.findFloorById(id);
    return this.prisma.floor.delete({ where: { id } });
  }

  // ── Departments ─────────────────────────────────────────────────────

  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.department.create({ data: dto }).catch(this.handleUniqueError('Department name'));
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: { _count: { select: { professors: true, locations: true, beacons: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findDepartmentById(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { professors: true, locations: true, beacons: true },
    });
    if (!dept) throw new NotFoundException(`Department #${id} not found`);
    return dept;
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    await this.findDepartmentById(id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async deleteDepartment(id: number) {
    await this.findDepartmentById(id);
    return this.prisma.department.delete({ where: { id } });
  }

  // ── Locations ───────────────────────────────────────────────────────

  async createLocation(dto: CreateLocationDto) {
    return this.prisma.location
      .create({ data: dto })
      .catch(this.handleUniqueError('Location room number on this floor'));
  }

  async findAllLocations(query: PaginationQueryDto, floorId?: number) {
    const { page = 1, limit = 20, search, sort, order = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(floorId ? { floor_id: floorId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { room_number: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.LocationOrderByWithRelationInput = sort ? { [sort]: order } : { name: order };

    const [data, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        include: { floor: true, department: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.location.count({ where }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  async findLocationById(id: number) {
    const loc = await this.prisma.location.findUnique({
      where: { id },
      include: { floor: true, department: true, beacons: true },
    });
    if (!loc) throw new NotFoundException(`Location #${id} not found`);
    return loc;
  }

  async updateLocation(id: number, dto: UpdateLocationDto) {
    await this.findLocationById(id);
    return this.prisma.location.update({
      where: { id },
      data: dto,
      include: { floor: true, department: true },
    });
  }

  async deleteLocation(id: number) {
    await this.findLocationById(id);
    return this.prisma.location.delete({ where: { id } });
  }

  // ── Paths ───────────────────────────────────────────────────────────

  async createPath(dto: CreatePathDto) {
    return this.prisma.path
      .create({
        data: dto,
        include: { start_location: true, end_location: true },
      })
      .catch(this.handleUniqueError('Path between these two locations'));
  }

  async findAllPaths(query: PaginationQueryDto, fromLocationId?: number, toLocationId?: number) {
    const { page = 1, limit = 20, order = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PathWhereInput = {
      ...(fromLocationId ? { start_location_id: fromLocationId } : {}),
      ...(toLocationId ? { end_location_id: toLocationId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.path.findMany({
        where,
        include: { start_location: true, end_location: true },
        orderBy: { distance: order },
        skip,
        take: limit,
      }),
      this.prisma.path.count({ where }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  async deletePath(id: number) {
    const path = await this.prisma.path.findUnique({ where: { id } });
    if (!path) throw new NotFoundException(`Path #${id} not found`);
    return this.prisma.path.delete({ where: { id } });
  }

  // ── Beacons ─────────────────────────────────────────────────────────

  async createBeacon(dto: CreateBeaconDto) {
    return this.prisma.beacon
      .create({
        data: {
          uuid: dto.uuid,
          name: dto.name,
          operating: dto.operating ?? true,
          location_id: dto.location_id,
          floor_id: dto.floor_id,
          department_id: dto.department_id,
        },
        include: { location: true, floor: true, department: true },
      })
      .catch(this.handleUniqueError('Beacon UUID'));
  }

  async findAllBeacons(query: PaginationQueryDto, locationId?: number) {
    const { page = 1, limit = 20, search, order = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BeaconWhereInput = {
      ...(locationId ? { location_id: locationId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { uuid: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.beacon.findMany({
        where,
        include: { location: true, floor: true, department: true },
        orderBy: { name: order },
        skip,
        take: limit,
      }),
      this.prisma.beacon.count({ where }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  async updateBeacon(id: number, dto: UpdateBeaconDto) {
    const beacon = await this.prisma.beacon.findUnique({ where: { id } });
    if (!beacon) throw new NotFoundException(`Beacon #${id} not found`);
    return this.prisma.beacon.update({
      where: { id },
      data: dto,
      include: { location: true, floor: true, department: true },
    });
  }

  async deleteBeacon(id: number) {
    const beacon = await this.prisma.beacon.findUnique({ where: { id } });
    if (!beacon) throw new NotFoundException(`Beacon #${id} not found`);
    return this.prisma.beacon.delete({ where: { id } });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private paginate<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private handleUniqueError(entity: string) {
    return (err: unknown) => {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
        throw new ConflictException(`${entity} already exists`);
      }
      throw err;
    };
  }
}
