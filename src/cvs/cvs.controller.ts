import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type JwtUser } from '../auth/current-user.decorator';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@UseGuards(JwtAuthGuard)
@Controller('cvs')
export class CvsController {
    constructor(private cvs: CvsService) { }

    @Get()
    findAll(@CurrentUser() user: JwtUser) {
        return this.cvs.findAll(user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
        return this.cvs.findOne(id, user.userId);
    }

    @Post()
    create(@Body() dto: CreateCvDto, @CurrentUser() user: JwtUser) {
        return this.cvs.create(user.userId, dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCvDto, @CurrentUser() user: JwtUser) {
        return this.cvs.update(id, user.userId, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
        return this.cvs.remove(id, user.userId);
    }
}
