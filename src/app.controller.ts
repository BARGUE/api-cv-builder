import { Controller, Get, Patch, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CurrentUser, type JwtUser } from './auth/current-user.decorator';
import { AuthService } from './auth/auth.service';
import { ChangePasswordDto } from './auth/dto/change-password.dto';
import { PrismaService } from './prisma/prisma.service';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() current: JwtUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: current.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Compte introuvable');
    return {
      id: user.id,
      email: user.email,
      userId: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile ?? null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() current: JwtUser,
    @Body() body: UpdateProfileDto,
  ) {
    const profile = await this.prisma.profile.upsert({
      where: { userId: current.userId },
      create: {
        userId: current.userId,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
      update: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(
    @CurrentUser() current: JwtUser,
    @Body() body: ChangePasswordDto,
  ) {
    await this.auth.changePassword(current.userId, body.currentPassword, body.newPassword);
    return { ok: true };
  }
}
