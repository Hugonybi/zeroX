import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
    @Query('role') roleFilter?: string,
  ) {
    return this.adminService.getAllUsers(
      parseInt(page), 
      parseInt(limit),
      search,
      roleFilter as any // Will be validated by Prisma enum
    );
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Get('artworks')
  async getAllArtworks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllArtworks(parseInt(page), parseInt(limit), search);
  }

  @Get('orders/failed-mints')
  async getFailedMints() {
    return this.adminService.getFailedMints();
  }

  @Post('orders/:id/retry-mint')
  async retryMinting(@Param('id') orderId: string) {
    return this.adminService.retryMinting(orderId);
  }

  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('action') actionFilter?: string,
    @Query('entityType') entityTypeFilter?: string,
  ) {
    return this.adminService.getAuditLogs(
      parseInt(page),
      parseInt(limit),
      actionFilter,
      entityTypeFilter
    );
  }
}