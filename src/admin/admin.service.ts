import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBeaconDto } from './dto/create-beacon.dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreatePathDto } from './dto/create-path.dto';

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
      include: { _count: { select: { professors: true, locations: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findDepartmentById(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { professors: true, locations: true },
    });
    if (!dept) throw new NotFoundException(`Department #${id} not found`);
    return dept;
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

  async findAllLocations(floorId?: number) {
    return this.prisma.location.findMany({
      where: floorId ? { floor_id: floorId } : undefined,
      include: { floor: true, department: true },
      orderBy: { name: 'asc' },
    });
  }

  async findLocationById(id: number) {
    const loc = await this.prisma.location.findUnique({
      where: { id },
      include: { floor: true, department: true, beacons: true },
    });
    if (!loc) throw new NotFoundException(`Location #${id} not found`);
    return loc;
  }

  async updateLocation(id: number, dto: Partial<CreateLocationDto>) {
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

  async findAllPaths() {
    return this.prisma.path.findMany({
      include: { start_location: true, end_location: true },
    });
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
        },
        include: { location: true, floor: true },
      })
      .catch(this.handleUniqueError('Beacon UUID'));
  }

  async findAllBeacons() {
    return this.prisma.beacon.findMany({
      include: { location: true, floor: true },
      orderBy: { name: 'asc' },
    });
  }

  async deleteBeacon(id: number) {
    const beacon = await this.prisma.beacon.findUnique({ where: { id } });
    if (!beacon) throw new NotFoundException(`Beacon #${id} not found`);
    return this.prisma.beacon.delete({ where: { id } });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private handleUniqueError(entity: string) {
    return (err: unknown) => {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
        throw new ConflictException(`${entity} already exists`);
      }
      throw err;
    };
  }
}
