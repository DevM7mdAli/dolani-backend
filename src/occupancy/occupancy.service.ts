import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface RoomOccupancy {
  current: number;
  capacity: number;
  lastUpdated: Date;
}

@Injectable()
export class OccupancyService implements OnModuleInit {
  private readonly logger = new Logger(OccupancyService.name);
  private occupancyMap = new Map<number, RoomOccupancy>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize occupancy map with all rooms from database
   * Called when module starts
   */
  async onModuleInit() {
    await this.initializeOccupancy();
  }

  /**
   * Fetch all locations from DB and initialize occupancy tracking
   */
  async initializeOccupancy() {
    try {
      const locations = await this.prisma.location.findMany({
        select: { id: true, capacity: true },
      });

      for (const location of locations) {
        this.occupancyMap.set(location.id, {
          current: 0,
          capacity: location.capacity || 0,
          lastUpdated: new Date(),
        });
      }

      this.logger.log(`Initialized occupancy for ${locations.length} locations`);
    } catch (err) {
      this.logger.error('Failed to initialize occupancy:', err);
    }
  }

  /**
   * Check in people to a room (increment occupancy)
   * @param locationId - Room ID
   * @param count - Number of people entering (default 1)
   */
  async checkIn(locationId: number, count: number = 1): Promise<RoomOccupancy> {
    const occupancy = this.occupancyMap.get(locationId);

    if (!occupancy) {
      this.logger.warn(`Location ${locationId} not found in occupancy map`);
      throw new Error(`Location ${locationId} not tracked`);
    }

    // Increment occupancy (don't exceed capacity)
    occupancy.current = Math.min(occupancy.current + count, occupancy.capacity);
    occupancy.lastUpdated = new Date();

    this.logger.log(`Check-in: Location ${locationId} - ${occupancy.current}/${occupancy.capacity}`);

    return occupancy;
  }

  /**
   * Check out people from a room (decrement occupancy)
   * @param locationId - Room ID
   * @param count - Number of people leaving (default 1)
   */
  async checkOut(locationId: number, count: number = 1): Promise<RoomOccupancy> {
    const occupancy = this.occupancyMap.get(locationId);

    if (!occupancy) {
      this.logger.warn(`Location ${locationId} not found in occupancy map`);
      throw new Error(`Location ${locationId} not tracked`);
    }

    // Decrement occupancy (don't go below 0)
    occupancy.current = Math.max(occupancy.current - count, 0);
    occupancy.lastUpdated = new Date();

    this.logger.log(`Check-out: Location ${locationId} - ${occupancy.current}/${occupancy.capacity}`);

    return occupancy;
  }

  /**
   * Get occupancy for a single room
   */
  async getOccupancy(locationId: number) {
    const occupancy = this.occupancyMap.get(locationId);

    if (!occupancy) {
      throw new Error(`Location ${locationId} not tracked`);
    }

    return {
      locationId,
      current: occupancy.current,
      capacity: occupancy.capacity,
      percentage: occupancy.capacity > 0 ? (occupancy.current / occupancy.capacity) * 100 : 0,
      lastUpdated: occupancy.lastUpdated,
    };
  }

  /**
   * Get occupancy for all rooms
   */
  async getAllOccupancy() {
    const result: any[] = [];

    for (const [locationId, occupancy] of this.occupancyMap) {
      result.push({
        locationId,
        current: occupancy.current,
        capacity: occupancy.capacity,
        percentage: occupancy.capacity > 0 ? (occupancy.current / occupancy.capacity) * 100 : 0,
        lastUpdated: occupancy.lastUpdated,
      });
    }

    return result;
  }

  /**
   * Get occupancy with location details (for dashboard)
   */
  async getAllOccupancyWithDetails() {
    const occupancies = await this.getAllOccupancy();

    // Fetch location details from DB
    const locations = await this.prisma.location.findMany({
      select: {
        id: true,
        name: true,
        room_number: true,
        type: true,
        floor: { select: { floor_number: true, building: { select: { code: true, name: true } } } },
      },
    });

    // Merge occupancy with location details
    return occupancies.map((occ) => {
      const location = locations.find((l) => l.id === occ.locationId);
      return {
        ...occ,
        location: location || null,
      };
    });
  }

  /**
   * Reset occupancy for a room (admin function)
   */
  async resetOccupancy(locationId: number) {
    const occupancy = this.occupancyMap.get(locationId);

    if (!occupancy) {
      throw new Error(`Location ${locationId} not tracked`);
    }

    occupancy.current = 0;
    occupancy.lastUpdated = new Date();

    this.logger.log(`Reset occupancy: Location ${locationId}`);

    return occupancy;
  }
}
