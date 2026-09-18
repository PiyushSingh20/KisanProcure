import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { User, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        farmer: true,
        officer: true,
        admin: true,
      },
    });
  }

  async findByMobile(mobileNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { mobileNumber },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(params: {
    role?: Role;
    status?: UserStatus;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { role, status, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { mobileNumber: { contains: search } },
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: true,
          officer: true,
          admin: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        farmer: true,
        officer: true,
        admin: true,
      },
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found or no password set');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
    });
  }

  async getUserStats(): Promise<any> {
    const [totalUsers, totalFarmers, totalOfficers, totalAdmins, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.FARMER } }),
      this.prisma.user.count({ where: { role: Role.OFFICER } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    ]);

    return {
      totalUsers,
      totalFarmers,
      totalOfficers,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }
}