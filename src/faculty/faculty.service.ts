import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, ProfessorStatus, ReportCategory, ReportStatus } from '@prisma/client';

import { PaginatedResult, PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { FacultyQueryDto } from './dto/faculty-query.dto';
import { UpdateOfficeHoursDto } from './dto/update-office-hours.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
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
    query: FacultyQueryDto,
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

  /** Create a new professor (Admin only) */
  async create(dto: CreateProfessorDto) {
    try {
      // Verify department exists
      const department = await this.prisma.department.findUnique({
        where: { id: dto.department_id },
      });

      if (!department) {
        throw new NotFoundException(`Department with ID ${dto.department_id} not found`);
      }

      // Verify office location exists if provided
      if (dto.location_id) {
        const location = await this.prisma.location.findUnique({
          where: { id: dto.location_id },
        });

        if (!location) {
          throw new NotFoundException(`Location with ID ${dto.location_id} not found`);
        }
      }

      let userId = dto.user_id;

      // If user_id not provided, create a system user
      if (!userId) {
        // Extract username from email (part before @)
        const username = dto.email.split('@')[0];

        const newUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            username: `${username}_${Date.now()}`, // Make unique
            name: dto.full_name,
            password_hash: '', // Empty hash - admin must reset password
            role: 'FACULTY',
          },
        });
        userId = newUser.id;
      } else {
        // Verify user exists if user_id provided
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
      }

      // Create professor
      const professor = await this.prisma.professor.create({
        data: {
          full_name: dto.full_name,
          email: dto.email,
          phone_number: dto.phone_number,
          show_phone: dto.show_phone || false,
          department_id: dto.department_id,
          location_id: dto.location_id || null,
          user_id: userId,
        },
        include: {
          office: true,
          department: true,
        },
      });

      return professor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'field';
          throw new ConflictException(`${field} already exists`);
        }
      }
      throw error;
    }
  }

  /** Update a professor (Admin only) */
  async update(id: number, dto: UpdateProfessorDto) {
    // Verify professor exists
    await this.findOne(id);

    try {
      // Verify department exists if updating department
      if (dto.department_id) {
        const department = await this.prisma.department.findUnique({
          where: { id: dto.department_id },
        });

        if (!department) {
          throw new NotFoundException(`Department with ID ${dto.department_id} not found`);
        }
      }

      // Verify office location exists if updating location
      if (dto.location_id !== undefined && dto.location_id !== null) {
        const location = await this.prisma.location.findUnique({
          where: { id: dto.location_id },
        });

        if (!location) {
          throw new NotFoundException(`Location with ID ${dto.location_id} not found`);
        }
      }

      const professor = await this.prisma.professor.update({
        where: { id },
        data: {
          ...(dto.full_name && { full_name: dto.full_name }),
          ...(dto.email && { email: dto.email }),
          ...(dto.phone_number !== undefined && { phone_number: dto.phone_number }),
          ...(dto.show_phone !== undefined && { show_phone: dto.show_phone }),
          ...(dto.department_id && { department_id: dto.department_id }),
          ...(dto.location_id !== undefined && { location_id: dto.location_id }),
        },
        include: {
          office: true,
          department: true,
        },
      });

      return professor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'field';
          throw new ConflictException(`${field} already exists`);
        }
      }
      throw error;
    }
  }

  /** Delete a professor (Admin only) */
  async remove(id: number) {
    // Verify professor exists
    const professor = await this.findOne(id);

    // Delete professor (cascades to user via onDelete: Cascade)
    await this.prisma.professor.delete({
      where: { id },
    });

    return { message: `Professor ${professor.full_name} deleted successfully` };
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
