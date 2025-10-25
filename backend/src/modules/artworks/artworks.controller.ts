import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { ArtworksService } from './artworks.service';

@Controller('artist/artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('artist')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateArtworkDto) {
    const user = req.user as { userId: string };
    return this.artworksService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
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
}
