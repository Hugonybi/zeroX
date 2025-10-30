import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { ArtworksService } from './artworks.service';

@Controller('artist/artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateArtworkDto) {
    const user = req.user as { userId: string };
    return this.artworksService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArtworkDto) {
    return this.artworksService.update(id, dto);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.artworksService.findById(id);
  }
}

@Controller('artworks')
export class MarketplaceController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get('search')
  search(@Query() searchDto: any) {
    // Import and use SearchArtworksDto for proper validation
    return this.artworksService.searchArtworks(searchDto);
  }

  @Get()
  browse(
    @Query('type') type?: string,
    @Query('artist') artist?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string
  ) {
    return this.artworksService.findPublished({
      type,
      artist,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.artworksService.findPublishedById(id);
  }
}
