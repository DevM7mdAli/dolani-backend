import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { LocationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface GraphNode {
  id: number;
  type: LocationType;
  name: string;
  roomNumber: string | null;
  x: number;
  y: number;
  floorId: number;
  floorNumber: number;
}

interface GraphEdge {
  targetId: number;
  distance: number;
  isAccessible: boolean;
}

export interface PathResult {
  totalDistance: number;
  nodes: GraphNode[];
}

@Injectable()
export class NavigationService implements OnModuleInit {
  private readonly logger = new Logger(NavigationService.name);

  /** Adjacency list: locationId → edges */
  private adjacency = new Map<number, GraphEdge[]>();

  /** Node metadata: locationId → GraphNode */
  private nodes = new Map<number, GraphNode>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.buildGraph();
  }

  /** Load all locations and paths from DB into in-memory graph */
  async buildGraph(): Promise<void> {
    const [locations, paths] = await Promise.all([
      this.prisma.location.findMany({ include: { floor: true } }),
      this.prisma.path.findMany(),
    ]);

    this.nodes.clear();
    this.adjacency.clear();

    for (const loc of locations) {
      this.nodes.set(loc.id, {
        id: loc.id,
        type: loc.type,
        name: loc.name,
        roomNumber: loc.room_number,
        x: loc.coordinate_x,
        y: loc.coordinate_y,
        floorId: loc.floor_id,
        floorNumber: loc.floor.floor_number,
      });
      this.adjacency.set(loc.id, []);
    }

    for (const path of paths) {
      // Bidirectional edges
      this.adjacency.get(path.start_location_id)?.push({
        targetId: path.end_location_id,
        distance: path.distance,
        isAccessible: path.is_accessible,
      });
      this.adjacency.get(path.end_location_id)?.push({
        targetId: path.start_location_id,
        distance: path.distance,
        isAccessible: path.is_accessible,
      });
    }

    // Auto-link vertical transitions (Stairs to Stairs, Elevator to Elevator across floors)
    const verticalNodes = Array.from(this.nodes.values()).filter(
      (n) => n.type === LocationType.STAIRS || n.type === LocationType.ELEVATOR,
    );

    let verticalEdgesAdded = 0;
    for (let i = 0; i < verticalNodes.length; i++) {
      for (let j = i + 1; j < verticalNodes.length; j++) {
        const a = verticalNodes[i];
        const b = verticalNodes[j];

        // Connect if they are the same type, on different floors, and are horizontally aligned (same physical staircase)
        if (a.type === b.type && a.floorId !== b.floorId) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const horizontalDist = Math.sqrt(dx * dx + dy * dy);

          // Normalized coordinates are 0 to 1. A distance of < 0.05 means they are within 5% of each other's position
          // This prevents cross-connecting "Stair 1" on Floor 1 with "Stair 3" on Floor 2 if they share a generic name.
          if (horizontalDist < 0.05) {
            const verticalDistance = Math.abs(a.floorNumber - b.floorNumber) * 5.0; // Arbitrary 5m per floor
            this.adjacency.get(a.id)?.push({
              targetId: b.id,
              distance: verticalDistance,
              isAccessible: true,
            });
            this.adjacency.get(b.id)?.push({
              targetId: a.id,
              distance: verticalDistance,
              isAccessible: true,
            });
            verticalEdgesAdded += 2;
          }
        }
      }
    }

    this.logger.log(
      `Graph built: ${this.nodes.size} nodes, ${paths.length} edges, ${verticalEdgesAdded} vertical connections`,
    );
  }

  /** Euclidean distance heuristic for A* */
  private heuristic(a: GraphNode, b: GraphNode): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * A* pathfinding algorithm.
   * @param startId     Start location ID
   * @param endId       End location ID
   * @param emergency      If true, exclude ELEVATOR nodes and route to nearest EXIT
   * @param avoidStairs    If true, exclude STAIRS nodes (accessibility)
   * @param avoidElevators If true, exclude ELEVATOR nodes (accessibility)
   */
  navigate(
    startId: number,
    endId: number,
    emergency = false,
    avoidStairs = false,
    avoidElevators = false,
  ): PathResult | null {
    const start = this.nodes.get(startId);
    if (!start) return null;

    // In emergency mode, override destination to nearest EXIT node
    let goalId = endId;
    if (emergency) {
      const nearestExit = this.findNearestExit(start);
      if (!nearestExit) return null;
      goalId = nearestExit.id;
    }

    const goal = this.nodes.get(goalId);
    if (!goal) return null;

    // A* open set: priority queue (simple array sorted by fScore)
    const openSet = new Set<number>([startId]);
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();

    gScore.set(startId, 0);
    fScore.set(startId, this.heuristic(start, goal));

    while (openSet.size > 0) {
      // Pick node in openSet with lowest fScore
      let current = -1;
      let lowestF = Infinity;
      for (const nodeId of openSet) {
        const f = fScore.get(nodeId) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = nodeId;
        }
      }

      if (current === goalId) {
        return this.reconstructPath(cameFrom, current, gScore.get(current) ?? 0);
      }

      openSet.delete(current);

      const edges = this.adjacency.get(current) ?? [];
      for (const edge of edges) {
        const neighbor = this.nodes.get(edge.targetId);
        if (!neighbor) continue;

        // In emergency mode, skip ELEVATOR nodes
        if (emergency && neighbor.type === LocationType.ELEVATOR) continue;

        // Accessibility: skip ELEVATOR nodes
        if (avoidElevators && neighbor.type === LocationType.ELEVATOR) continue;

        // Accessibility: skip STAIRS nodes or inaccessible edges
        if (avoidStairs && (neighbor.type === LocationType.STAIRS || !edge.isAccessible)) continue;

        const tentativeG = (gScore.get(current) ?? Infinity) + edge.distance;

        if (tentativeG < (gScore.get(edge.targetId) ?? Infinity)) {
          cameFrom.set(edge.targetId, current);
          gScore.set(edge.targetId, tentativeG);
          fScore.set(edge.targetId, tentativeG + this.heuristic(neighbor, goal));
          openSet.add(edge.targetId);
        }
      }
    }

    return null; // No path found
  }

  /** Find the nearest EXIT node to a given source using Euclidean distance */
  private findNearestExit(source: GraphNode): GraphNode | null {
    let nearest: GraphNode | null = null;
    let minDist = Infinity;

    for (const node of this.nodes.values()) {
      if (node.type === LocationType.EXIT) {
        const dist = this.heuristic(source, node);
        if (dist < minDist) {
          minDist = dist;
          nearest = node;
        }
      }
    }

    return nearest;
  }

  /** Find the nearest navigable node to given coordinates (e.g. from beacon signal) */
  findNearestNode(x: number, y: number, floorId?: number): GraphNode | null {
    let nearest: GraphNode | null = null;
    let minDist = Infinity;

    for (const node of this.nodes.values()) {
      // Filter by floor if specified
      if (floorId && node.floorId !== floorId) continue;

      // Calculate Euclidean distance
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }

    return nearest;
  }

  /** Reconstruct path from cameFrom map */
  private reconstructPath(cameFrom: Map<number, number>, currentId: number, totalDistance: number): PathResult {
    const path: GraphNode[] = [];
    let id: number | undefined = currentId;

    while (id !== undefined) {
      const node = this.nodes.get(id);
      if (node) path.unshift(node);
      id = cameFrom.get(id);
    }

    return { totalDistance, nodes: path };
  }

  /** Get all navigable locations (for mobile app location picker) */
  getAllLocations(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /** Reload the graph from DB (useful after admin edits) */
  async reloadGraph(): Promise<void> {
    await this.buildGraph();
  }
}
