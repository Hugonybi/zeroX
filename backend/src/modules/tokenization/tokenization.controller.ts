import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TokenizationService } from './tokenization.service';
import { ConfigService } from '@nestjs/config';
import { OwnershipCertificateDto } from './dto/ownership-certificate.dto';
import { RemintOwnershipDto } from './dto/remint-ownership.dto';

@Controller('ownership')
export class TokenizationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenizationService: TokenizationService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Get ownership certificate by artwork ID
   */
  @UseGuards(JwtAuthGuard)
  @Get('artwork/:artworkId')
  async getOwnershipByArtwork(
    @Param('artworkId') artworkId: string
  ): Promise<OwnershipCertificateDto> {
    const ownershipToken = await this.prisma.ownershipToken.findFirst({
      where: { artworkId },
      include: {
        artwork: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        order: true,
        authenticityToken: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!ownershipToken) {
      throw new NotFoundException(`Ownership token not found for artwork ${artworkId}`);
    }

    return this.formatCertificate(ownershipToken);
  }

  /**
   * Get ownership certificate by order ID
   */
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  async getOwnershipByOrder(
    @Param('orderId') orderId: string
  ): Promise<OwnershipCertificateDto> {
    const ownershipToken = await this.prisma.ownershipToken.findUnique({
      where: { orderId },
      include: {
        artwork: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        order: true,
        authenticityToken: true
      }
    });

    if (!ownershipToken) {
      throw new NotFoundException(`Ownership token not found for order ${orderId}`);
    }

    return this.formatCertificate(ownershipToken);
  }

  /**
   * Admin: Re-mint ownership token for failed orders
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/re-mint')
  async remintOwnership(@Body() dto: RemintOwnershipDto) {
    const { orderId } = dto;

    // Check order status
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        authToken: true,
        ownershipToken: true,
        artwork: true,
        buyer: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (!order.authToken) {
      throw new BadRequestException(
        'Cannot re-mint ownership token: Authenticity token not minted yet'
      );
    }

    if (order.ownershipToken) {
      throw new BadRequestException(
        'Ownership token already exists for this order. Delete the existing record first if you want to re-mint.'
      );
    }

    if (order.orderStatus !== 'ownership_mint_failed') {
      throw new BadRequestException(
        `Order status is ${order.orderStatus}. Can only re-mint for orders with ownership_mint_failed status.`
      );
    }

    try {
      // Mint ownership token
      const ownershipResult = await this.tokenizationService.mintOwnershipToken(
        orderId,
        order.artworkId,
        order.authToken.id
      );

      // Link to database
      await this.tokenizationService.linkToAuthenticityToken(
        orderId,
        order.artworkId,
        order.buyerId,
        order.authToken.id,
        ownershipResult
      );

      // Update order status to fulfilled
      await this.prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: 'fulfilled' }
      });

      return {
        success: true,
        message: 'Ownership token re-minted successfully',
        ownershipToken: {
          hederaTokenId: ownershipResult.hederaTokenId,
          hederaTxHash: ownershipResult.hederaTxHash,
          metadataIpfs: ownershipResult.metadataIpfs
        }
      };
    } catch (error) {
      throw new BadRequestException(`Re-mint failed: ${error.message}`);
    }
  }

  /**
   * Format ownership token data for certificate display
   */
  private formatCertificate(data: any): OwnershipCertificateDto {
    const network = this.configService.get('nodeEnv') === 'production' 
      ? 'mainnet' 
      : 'testnet';

    return {
      ownershipToken: {
        id: data.id,
        hederaTokenId: data.hederaTokenId,
        hederaTxHash: data.hederaTxHash,
        metadataIpfs: data.metadataIpfs,
        transferable: data.transferable,
        fractions: data.fractions,
        createdAt: data.createdAt,
        hashscanUrl: `https://hashscan.io/${network}/token/${data.hederaTokenId.split('/')[0]}`
      },
      authenticityToken: {
        id: data.authenticityToken.id,
        hederaTokenId: data.authenticityToken.hederaTokenId,
        hederaTxHash: data.authenticityToken.hederaTxHash,
        metadataIpfs: data.authenticityToken.metadataIpfs,
        hashscanUrl: `https://hashscan.io/${network}/token/${data.authenticityToken.hederaTokenId.split('/')[0]}`
      },
      artwork: {
        id: data.artwork.id,
        title: data.artwork.title,
        description: data.artwork.description,
        type: data.artwork.type,
        mediaUrl: data.artwork.mediaUrl,
        serialNumber: data.artwork.serialNumber
      },
      order: {
        id: data.order.id,
        reference: data.order.reference,
        amountCents: data.order.amountCents,
        currency: data.order.currency,
        createdAt: data.order.createdAt
      },
      owner: {
        name: data.owner.name,
        email: data.owner.email
      }
    };
  }
}
