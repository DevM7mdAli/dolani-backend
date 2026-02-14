import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Beacon } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

/**
 * Weighted Moving Average (WMA) filter for RSSI signal smoothing.
 * Recent readings receive higher weights for better real-time accuracy.
 */
const WINDOW_SIZE = 5;

@Injectable()
export class BeaconsService {
  private readonly logger = new Logger(BeaconsService.name);

  /** In-memory sliding window per beacon: beaconId → RSSI values (most recent last) */
  private rssiWindows = new Map<number, number[]>();

  constructor(private readonly prisma: PrismaService) {}

  /** Resolve a beacon UUID to its associated Location */
  async resolveToLocation(uuid: string) {
    const beacon = await this.prisma.beacon.findUnique({
      where: { uuid },
      include: {
        location: {
          include: { floor: true, department: true },
        },
      },
    });

    if (!beacon) {
      throw new NotFoundException(`Beacon with UUID "${uuid}" not found`);
    }

    if (!beacon.operating) {
      this.logger.warn(`Beacon ${uuid} is marked as non-operating`);
    }

    return {
      beaconId: beacon.id,
      beaconName: beacon.name,
      operating: beacon.operating,
      location: beacon.location,
    };
  }

  /** Ingest an RSSI reading: persist to DB and update in-memory WMA window */
  async ingestRssi(beaconUuid: string, rssi: number) {
    const beacon = await this.prisma.beacon.findUnique({
      where: { uuid: beaconUuid },
    });

    if (!beacon) {
      throw new NotFoundException(`Beacon with UUID "${beaconUuid}" not found`);
    }

    // Persist reading
    await this.prisma.rssiReading.create({
      data: { beacon_id: beacon.id, rssi },
    });

    // Update in-memory sliding window
    const window = this.rssiWindows.get(beacon.id) ?? [];
    window.push(rssi);
    if (window.length > WINDOW_SIZE) {
      window.shift();
    }
    this.rssiWindows.set(beacon.id, window);

    const smoothedRssi = this.weightedMovingAverage(window);

    return {
      beaconId: beacon.id,
      rawRssi: rssi,
      smoothedRssi,
      windowSize: window.length,
    };
  }

  /** Calculate Weighted Moving Average — recent readings weighted more heavily */
  private weightedMovingAverage(values: number[]): number {
    if (values.length === 0) return 0;

    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < values.length; i++) {
      const weight = i + 1; // 1, 2, 3, ... (newest has highest weight)
      weightedSum += values[i]! * weight;
      weightTotal += weight;
    }

    return Math.round((weightedSum / weightTotal) * 100) / 100;
  }

  /** List all beacons with their locations */
  async findAll(): Promise<Beacon[]> {
    return this.prisma.beacon.findMany({
      include: { location: true, floor: true },
    });
  }

  /** Get smoothed RSSI for a specific beacon */
  getSmoothedRssi(beaconId: number): number | null {
    const window = this.rssiWindows.get(beaconId);
    if (!window || window.length === 0) return null;
    return this.weightedMovingAverage(window);
  }
}
