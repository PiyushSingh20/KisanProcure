import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class SendOtpDto {
  mobileNumber: string;
}

class VerifyOtpDto {
  mobileNumber: string;
  otp: string;
}

class RegisterFarmerDto {
  mobileNumber: string;
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
}

class RegisterOfficerDto {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  centerId?: string;
  designation?: string;
  permissions?: string[];
}

class LoginDto {
  mobileNumber: string;
  password: string;
}

class SetPasswordDto {
  password: string;
}

class RefreshTokenDto {
  refreshToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to mobile number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.mobileNumber);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  @ApiResponse({ status: 200, description: 'OTP verified, tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.mobileNumber, dto.otp);
  }

  @Post('register/farmer')
  @ApiOperation({ summary: 'Register a new farmer' })
  @ApiResponse({ status: 201, description: 'Farmer registered successfully' })
  @ApiResponse({ status: 409, description: 'Mobile or Aadhaar already registered' })
  async registerFarmer(@Body() dto: RegisterFarmerDto) {
    return this.authService.registerFarmer(dto.mobileNumber, dto);
  }

  @Post('register/officer')
  @ApiOperation({ summary: 'Register a new officer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Officer registered successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  async registerOfficer(@Body() dto: RegisterOfficerDto) {
    return this.authService.registerOfficer(dto.mobileNumber, dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with mobile and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.mobileNumber, dto.password);
  }

  @Post('set-password')
  @ApiOperation({ summary: 'Set password for OTP-based user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async setPassword(@Request() req: any, @Body() dto: SetPasswordDto) {
    await this.authService.setPassword(req.user.sub, dto.password);
    return { success: true, message: 'Password set successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens generated' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Request() req: any, @Body() body: { refreshToken?: string }) {
    await this.authService.logout(req.user.sub, body.refreshToken);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@Request() req: any) {
    await this.authService.logoutAllDevices(req.user.sub);
    return { success: true, message: 'Logged out from all devices' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.sub);
    return user;
  }
}