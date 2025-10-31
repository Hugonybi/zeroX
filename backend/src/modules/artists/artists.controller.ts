import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ArtistsService } from './artists.service';
import { CreateArtistProfileDto } from './dto/create-artist-profile.dto';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist')
  async createProfile(@Request() req, @Body() dto: CreateArtistProfileDto) {
    return this.artistsService.createProfile(req.user.userId, dto);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist')
  async getMyProfile(@Request() req) {
    return this.artistsService.getProfile(req.user.userId);
  }

  @Put('profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist')
  async updateMyProfile(@Request() req, @Body() dto: UpdateArtistProfileDto) {
    return this.artistsService.updateProfile(req.user.userId, dto);
  }

  @Get('profile/:userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.artistsService.getProfile(userId);
  }

  @Get(':userId/portfolio')
  async getArtistPortfolio(
    @Param('userId') userId: string,
    @Query('includeStats') includeStats?: string,
  ) {
    return this.artistsService.getArtistPortfolio(
      userId,
      includeStats === 'true',
    );
  }

  @Get()
  async getAllProfiles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.artistsService.getAllArtistProfiles(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
