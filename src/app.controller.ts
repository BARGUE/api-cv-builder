import { Controller, Get, Patch, Req, UseGuards, Body } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
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
  async me(@Req() req: { user: { userId: string; email: string } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
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
    if (!user) return req.user;
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
    @Req() req: { user: { userId: string } },
    @Body() body: UpdateProfileDto,
  ) {
    const profile = await this.prisma.profile.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
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
    @Req() req: { user: { userId: string } },
    @Body() body: ChangePasswordDto,
  ) {
    await this.auth.changePassword(req.user.userId, body.newPassword);
    return { ok: true };
  }
}
