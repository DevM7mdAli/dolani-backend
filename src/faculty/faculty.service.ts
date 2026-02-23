import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, ProfessorStatus, ReportCategory, ReportStatus } from '@prisma/client';

import { PaginatedResult, PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateOfficeHoursDto } from './dto/update-office-hours.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get the professor profile linked to a user ID (from JWT) */
  async getProfile(userId: number) {
    const professor = await this.prisma.professor.findUnique({
      where: { user_id: userId },
      include: {
        office: true,
        department: true,
        office_hours: { orderBy: { day: 'asc' } },
      },
    });

    if (!professor) {
      throw new NotFoundException('Professor profile not found for this user');
    }

    return professor;
  }

  /** Update office hours — replaces all existing entries for the professor */
  async updateOfficeHours(userId: number, dto: UpdateOfficeHoursDto) {
    const professor = await this.ensureProfessor(userId);

    // Delete existing office hours and recreate
    await this.prisma.$transaction([
      this.prisma.officeHours.deleteMany({
        where: { professor_id: professor.id },
      }),
      ...dto.officeHours.map((entry) =>
        this.prisma.officeHours.create({
          data: {
            professor_id: professor.id,
            day: entry.day,
            start_time: entry.start_time,
            end_time: entry.end_time,
          },
        }),
      ),
    ]);

    return this.getProfile(userId);
  }

  async getAllDoctorsOfficeHours(query: PaginationQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.professor.findMany({
        skip,
        take: limit,
      }),
      this.prisma.professor.count(),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async getDoctorOfficeHours(userId: number) {
    return this.prisma.officeHours.findMany({
      where: { professor: { user_id: userId } },
      orderBy: [{ day: 'asc' }, { start_time: 'asc' }],
    });
  }

  /** Update professor availability status */
  async updateStatus(userId: number, dto: UpdateStatusDto) {
    const professor = await this.ensureProfessor(userId);

    return this.prisma.professor.update({
      where: { id: professor.id },
      data: { status: dto.status },
      include: { office: true, department: true, office_hours: true },
    });
  }

  /** List professors with pagination, optional department and status filters */
  async findAll(
    query: PaginationQueryDto,
    departmentId?: number,
    status?: ProfessorStatus,
  ): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, search, sort, order = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProfessorWhereInput = {
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { full_name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ProfessorOrderByWithRelationInput = sort ? { [sort]: order } : { full_name: order };

    const [data, total] = await Promise.all([
      this.prisma.professor.findMany({
        where,
        include: {
          office: true,
          department: true,
          office_hours: { orderBy: { day: 'asc' } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.professor.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Find a single professor by ID (public) */
  async findOne(id: number) {
    const professor = await this.prisma.professor.findUnique({
      where: { id },
      include: {
        office: true,
        department: true,
        office_hours: { orderBy: { day: 'asc' } },
      },
    });

    if (!professor) {
      throw new NotFoundException(`Professor with ID ${id} not found`);
    }

    return professor;
  }

  /** Search professors by name (public) */
  async search(query: string) {
    return this.prisma.professor.findMany({
      where: {
        full_name: { contains: query, mode: 'insensitive' },
      },
      include: {
        office: true,
        department: true,
        office_hours: { orderBy: { day: 'asc' } },
      },
      orderBy: { full_name: 'asc' },
    });
  }

  // ── Teaching Schedule ──────────────────────────────────────────────

  /** Get all teaching slots for the authenticated professor */
  async getSchedule(userId: number) {
    const professor = await this.ensureProfessor(userId);
    return this.prisma.teachingSlot.findMany({
      where: { professor_id: professor.id },
      orderBy: [{ day: 'asc' }, { start_time: 'asc' }],
    });
  }

  /**
   * Bulk-replace the professor's teaching schedule.
   * Deletes all existing slots then re-inserts the provided ones atomically.
   */
  async upsertSchedule(userId: number, dto: UpsertScheduleDto) {
    const professor = await this.ensureProfessor(userId);

    await this.prisma.$transaction([
      this.prisma.teachingSlot.deleteMany({ where: { professor_id: professor.id } }),
      ...dto.slots.map((slot) =>
        this.prisma.teachingSlot.create({
          data: {
            professor_id: professor.id,
            course_code: slot.course_code,
            course_name: slot.course_name,
            course_name_ar: slot.course_name_ar,
            day: slot.day,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room: slot.room,
            student_count: slot.student_count,
          },
        }),
      ),
    ]);

    return this.getSchedule(userId);
  }

  // ── Reports ─────────────────────────────────────────────────────────

  /** Submit a new facility/room report */
  async createReport(userId: number, dto: CreateReportDto) {
    const professor = await this.ensureProfessor(userId);

    return this.prisma.report.create({
      data: {
        professor_id: professor.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        room: dto.room,
        status: ReportStatus.PENDING,
      },
    });
  }

  /** Get paginated list of reports submitted by the authenticated professor */
  async getMyReports(
    userId: number,
    query: PaginationQueryDto,
    status?: ReportStatus,
    category?: ReportCategory,
  ): Promise<PaginatedResult<unknown>> {
    const professor = await this.ensureProfessor(userId);
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
      professor_id: professor.id,
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  /** Ensure the user has a professor profile */
  private async ensureProfessor(userId: number) {
    const professor = await this.prisma.professor.findUnique({
      where: { user_id: userId },
    });

    if (!professor) {
      throw new ForbiddenException('No professor profile linked to this account');
    }

    return professor;
  }

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
