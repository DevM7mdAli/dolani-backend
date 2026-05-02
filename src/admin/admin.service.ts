import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PaginatedResult, PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { LocationQueryDto } from '../locations/dto/location-query.dto';
import { NavigationService } from '../navigation/navigation.service';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly navigationService: NavigationService,
  ) {}

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

  async findAllLocations(query: LocationQueryDto) {
    const { page = 1, limit = 20, search, sort, order = 'asc', floorId, departmentId, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(floorId ? { floor_id: floorId } : {}),
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(type ? { type } : {}),
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

  async updateLocationEquipment(id: number, dto: UpdateLocationEquipmentDto) {
    await this.findLocationById(id);
    return this.prisma.location.update({
      where: { id },
      data: { equipment: dto.equipment },
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
          name: dto.name,
          uuid: dto.uuid,
          operating: dto.operating ?? true,
          location_id: dto.location_id,
          floor_id: dto.floor_id,
          department_id: dto.department_id,
          coordinate_x: dto.coordinate_x,
          coordinate_y: dto.coordinate_y,
        },
        include: { location: true, floor: true, department: true },
      })
      .catch(this.handleUniqueError('Beacon name'));
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

  // ── Graph Sync ──────────────────────────────────────────────────────

  async getGraph(floorId: number) {
    const [locations, paths, beacons] = await Promise.all([
      this.prisma.location.findMany({
        where: { floor_id: floorId },
        orderBy: { id: 'asc' },
      }),
      this.prisma.path.findMany({
        where: {
          OR: [{ start_location: { floor_id: floorId } }, { end_location: { floor_id: floorId } }],
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.beacon.findMany({
        where: { floor_id: floorId },
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      nodes: locations.map((l) => ({
        id: l.id,
        name: l.name,
        room_number: l.room_number,
        type: l.type,
        coordinate_x: l.coordinate_x,
        coordinate_y: l.coordinate_y,
        department_id: l.department_id,
      })),
      edges: paths.map((p) => ({
        id: p.id,
        start_location_id: p.start_location_id,
        end_location_id: p.end_location_id,
        distance: p.distance,
        is_accessible: p.is_accessible,
      })),
      beacons: beacons.map((b) => ({
        id: b.id,
        uuid: b.uuid,
        name: b.name,
        location_id: b.location_id,
        coordinate_x: b.coordinate_x,
        coordinate_y: b.coordinate_y,
      })),
    };
  }

  async syncGraph(dto: SyncGraphDto) {
    const { floor_id, nodes, edges, beacons } = dto;

    const idMap = await this.prisma.$transaction(async (tx) => {
      // 1. Remove existing entities for this floor
      await tx.beacon.deleteMany({ where: { floor_id } });
      await tx.path.deleteMany({
        where: {
          OR: [{ start_location: { floor_id } }, { end_location: { floor_id } }],
        },
      });
      await tx.location.deleteMany({ where: { floor_id } });

      // 2. Create nodes – build client_id → server id map
      const clientToServer: Record<string, number> = {};
      for (const n of nodes) {
        const loc = await tx.location.create({
          data: {
            name: n.name,
            room_number: n.room_number ?? null,
            type: n.type,
            coordinate_x: n.coordinate_x,
            coordinate_y: n.coordinate_y,
            floor_id,
            department_id: n.department_id ?? null,
          },
        });
        clientToServer[n.client_id] = loc.id;
      }

      // 3. Create edges
      for (const e of edges) {
        const startId = clientToServer[e.source_client_id];
        const endId = clientToServer[e.target_client_id];
        if (startId == null || endId == null) continue;
        await tx.path.create({
          data: {
            start_location_id: startId,
            end_location_id: endId,
            distance: e.distance,
            is_accessible: e.is_accessible,
          },
        });
      }

      // 4. Create beacons
      for (const b of beacons) {
        const locationId = b.linked_node_client_id ? (clientToServer[b.linked_node_client_id] ?? null) : null;
        if (locationId == null) continue; // beacon must link to a location
        await tx.beacon.create({
          data: {
            name: b.name,
            uuid: b.uuid ?? null,
            floor_id,
            location_id: locationId,
            coordinate_x: b.coordinate_x,
            coordinate_y: b.coordinate_y,
          },
        });
      }

      return clientToServer;
    });

    // Reload the navigation graph after sync
    await this.navigationService.reloadGraph();
    this.logger.log(
      `Graph synced for floor ${floor_id}: ${nodes.length} nodes, ${edges.length} edges, ${beacons.length} beacons`,
    );

    return { idMap };
  }
}
