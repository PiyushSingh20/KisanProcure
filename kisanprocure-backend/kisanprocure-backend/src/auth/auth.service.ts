import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { Role, UserStatus } from '@prisma/client';

export interface TokenPayload {
  sub: string;
  mobileNumber: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpTtl = 300;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string }> {
    const normalizedMobile = this.normalizeMobile(mobileNumber);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (existingUser && existingUser.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    const otp = this.generateOtp();
    const otpKey = `otp:${normalizedMobile}`;
    
    await this.redis.set(otpKey, otp, this.otpTtl);
    
    this.logger.log(`OTP sent to ${normalizedMobile}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<AuthTokens> {
    const normalizedMobile = this.normalizeMobile(mobileNumber);
    const otpKey = `otp:${normalizedMobile}`;
    
    const storedOtp = await this.redis.get(otpKey);
    
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redis.del(otpKey);

    let user = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mobileNumber: normalizedMobile,
          role: Role.FARMER,
          status: UserStatus.ACTIVE,
        },
      });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    await this.updateLastLogin(user.id);

    return tokens;
  }

  async registerFarmer(mobileNumber: string, data: {
    firstName: string;
    lastName: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bankAccount?: string;
    ifscCode?: string;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    totalLandArea?: number;
  }): Promise<AuthTokens> {
    const normalizedMobile = this.normalizeMobile(mobileNumber);

    const existingUser = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (existingUser) {
      throw new ConflictException('Mobile number already registered');
    }

    if (data.aadhaarNumber) {
      const existingAadhaar = await this.prisma.farmer.findUnique({
        where: { aadhaarNumber: data.aadhaarNumber },
      });
      if (existingAadhaar) {
        throw new ConflictException('Aadhaar number already registered');
      }
    }

    const farmerCode = await this.generateFarmerCode(data.district);

    const user = await this.prisma.user.create({
      data: {
        mobileNumber: normalizedMobile,
        firstName: data.firstName,
        lastName: data.lastName,
        role: Role.FARMER,
        status: UserStatus.ACTIVE,
        farmer: {
          create: {
            farmerCode,
            aadhaarNumber: data.aadhaarNumber,
            panNumber: data.panNumber,
            bankAccount: data.bankAccount,
            ifscCode: data.ifscCode,
            address: data.address,
            village: data.village,
            district: data.district,
            state: data.state,
            pincode: data.pincode,
            latitude: data.latitude,
            longitude: data.longitude,
            totalLandArea: data.totalLandArea,
          },
        },
      },
      include: { farmer: true },
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async registerOfficer(mobileNumber: string, data: {
    firstName: string;
    lastName: string;
    employeeId: string;
    centerId?: string;
    designation?: string;
    permissions?: string[];
  }): Promise<AuthTokens> {
    const normalizedMobile = this.normalizeMobile(mobileNumber);

    const existingUser = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (existingUser) {
      throw new ConflictException('Mobile number already registered');
    }

    const existingEmployee = await this.prisma.officer.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee ID already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        mobileNumber: normalizedMobile,
        firstName: data.firstName,
        lastName: data.lastName,
        role: Role.OFFICER,
        status: UserStatus.ACTIVE,
        officer: {
          create: {
            employeeId: data.employeeId,
            centerId: data.centerId,
            designation: data.designation,
            permissions: data.permissions || [],
          },
        },
      },
      include: { officer: true },
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(mobileNumber: string, password: string): Promise<AuthTokens> {
    const normalizedMobile = this.normalizeMobile(mobileNumber);
    
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    await this.updateLastLogin(user.id);

    return tokens;
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (session.user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(session.user);
    await this.storeRefreshToken(session.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.session.updateMany({
        where: { userId, refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async validateUser(userId: string): Promise<TokenPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return {
      sub: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    };
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const expiresAt = new Date(Date.now() + this.parseDuration(expiresIn));

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        userAgent: 'unknown',
        ipAddress: 'unknown',
      },
    });
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizeMobile(mobile: string): string {
    return mobile.replace(/\D/g, '').replace(/^(\+91|91|0)/, '');
  }

  private async generateFarmerCode(district?: string): Promise<string> {
    const prefix = district ? district.substring(0, 3).toUpperCase() : 'KSN';
    const count = await this.prisma.farmer.count();
    return `${prefix}-${String(count + 1).padStart(6, '0')}`;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}