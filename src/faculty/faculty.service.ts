import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateOfficeHoursDto } from './dto/update-office-hours.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

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

  /** Update professor availability status */
  async updateStatus(userId: number, dto: UpdateStatusDto) {
    const professor = await this.ensureProfessor(userId);

    return this.prisma.professor.update({
      where: { id: professor.id },
      data: { status: dto.status },
      include: { office: true, department: true, office_hours: true },
    });
  }

  /** List all professors with their office hours and departments (public) */
  async findAll() {
    return this.prisma.professor.findMany({
      include: {
        office: true,
        department: true,
        office_hours: { orderBy: { day: 'asc' } },
      },
      orderBy: { full_name: 'asc' },
    });
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
}
