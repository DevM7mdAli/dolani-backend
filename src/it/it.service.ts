import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, ReportCategory, ReportStatus } from '@prisma/client';

import { PaginatedResult, PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ItService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginated list of all reports, filterable by status and/or category.
   * Includes basic professor info so IT staff know who submitted each report.
   */
  async getAllReports(
    query: PaginationQueryDto,
    status?: ReportStatus,
    category?: ReportCategory,
  ): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { room: { contains: search, mode: 'insensitive' } },
              { professor: { full_name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          professor: {
            select: {
              id: true,
              full_name: true,
              email: true,
              department: { select: { id: true, name: true } },
            },
          },
          resolved_by: {
            select: { id: true, user: { select: { name: true, email: true } } },
          },
        },
        orderBy: [
          // PENDING first, then IN_PROGRESS, then RESOLVED
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get full details of a single report by its ID */
  async getReportById(id: number) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        professor: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true,
            department: { select: { id: true, name: true } },
            office: { select: { id: true, name: true, room_number: true } },
          },
        },
        resolved_by: {
          select: { id: true, user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  /**
   * Update the status of a report.
   * Automatically sets resolved_at and resolved_by_id when status becomes RESOLVED.
   */
  async updateReportStatus(id: number, itUserId: number, dto: UpdateReportStatusDto) {
    // Verify the report exists
    await this.getReportById(id);

    // Resolve IT profile
    const itProfile = await this.prisma.iT.findUnique({ where: { user_id: itUserId } });
    if (!itProfile) {
      throw new NotFoundException('IT profile not found for this user');
    }

    const isResolved = dto.status === ReportStatus.RESOLVED;

    return this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        ...(isResolved
          ? {
              resolved_at: new Date(),
              resolved_by_id: itProfile.id,
            }
          : {
              // Moving back to IN_PROGRESS clears resolution fields
              resolved_at: null,
              resolved_by_id: null,
            }),
      },
      include: {
        professor: {
          select: { id: true, full_name: true, email: true },
        },
        resolved_by: {
          select: { id: true, user: { select: { name: true, email: true } } },
        },
      },
    });
  }

  /** Summary stats for the IT dashboard */
  async getReportStats() {
    const [pending, inProgress, resolved, total] = await Promise.all([
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.report.count({ where: { status: ReportStatus.IN_PROGRESS } }),
      this.prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      this.prisma.report.count(),
    ]);

    return { total, pending, inProgress, resolved };
  }
}
