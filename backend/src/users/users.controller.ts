import { Controller, Get, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get current user dashboard data' })
  dashboard(@CurrentUser('id') userId: string) {
    return this.usersService.getDashboardStats(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Eliminar usuario — solo admins; valida que no tenga deals activos
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: delete user (requires no active deals)' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // Actualizar credenciales de cualquier cuenta — solo admins
  @Patch(':id/credentials')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: update user name, email and/or password' })
  updateCredentials(
    @Param('id') id: string,
    @Body() dto: { name?: string; email?: string; password?: string },
  ) {
    return this.usersService.updateCredentials(id, dto);
  }
}
