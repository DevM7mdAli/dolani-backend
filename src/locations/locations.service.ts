import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PaginatedResult } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LocationQueryDto } from './dto/location-query.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Locations (paginated, filtered, searchable) ─────────────────────

  async findAll(query: LocationQueryDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, search, sort, order = 'asc', type, floorId, buildingId, departmentId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(type ? { type } : {}),
      ...(floorId ? { floor_id: floorId } : {}),
      ...(buildingId ? { floor: { building_id: buildingId } } : {}),
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { room_number: { contains: search, mode: 'insensitive' as const } },
              { near: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.LocationOrderByWithRelationInput = sort ? { [sort]: order } : { name: order };

    const [data, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        include: {
          floor: { include: { building: true } },
          department: true,
          beacons: { where: { operating: true }, select: { id: true, uuid: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.location.count({ where }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  // ── Single location detail ──────────────────────────────────────────

  async findOne(id: number) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        floor: { include: { building: true } },
        department: true,
        beacons: { where: { operating: true }, select: { id: true, uuid: true, name: true } },
        outgoing_paths: {
          include: { end_location: { select: { id: true, name: true, room_number: true, type: true } } },
        },
        incoming_paths: {
          include: { start_location: { select: { id: true, name: true, room_number: true, type: true } } },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location #${id} not found`);
    }

    return location;
  }

  // ── Buildings (lightweight, for pickers / filters) ──────────────────

  async findAllBuildings() {
    return this.prisma.building.findMany({
      include: {
        floors: {
          orderBy: { floor_number: 'asc' },
          select: { id: true, floor_number: true, floor_plan_image_url: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ── Departments ─────────────────────────────────────────────────────

  async findAllDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true },
    });
  }

  // ── Floors (with optional building filter) ──────────────────────────

  async findAllFloors(buildingId?: number) {
    return this.prisma.floor.findMany({
      where: buildingId ? { building_id: buildingId } : undefined,
      include: { building: { select: { id: true, name: true, code: true } } },
      orderBy: [{ building_id: 'asc' }, { floor_number: 'asc' }],
    });
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
}
