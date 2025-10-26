import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as https from 'https';
import * as http from 'http';

/**
 * Proxy controller to serve Azure Blob Storage images through the backend.
 * This solves CORS issues during development by acting as a proxy.
 */
@Controller('proxy')
export class ArtworksProxyController {
  @Get('image/*')
  async proxyImage(@Param('0') imagePath: string, @Res() res: Response) {
    // Reconstruct the Azure Blob URL
    const azureUrl = `https://${imagePath}`;

    try {
      // Determine protocol
      const protocol = azureUrl.startsWith('https') ? https : http;

      // Make request to Azure Blob Storage
      protocol.get(azureUrl, (proxyRes) => {
        // Check if the request was successful
        if (proxyRes.statusCode !== 200) {
          throw new HttpException(
            `Failed to fetch image from Azure: ${proxyRes.statusCode}`,
            HttpStatus.BAD_GATEWAY,
          );
        }

        // Set appropriate headers
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Allow CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');

        // Pipe the response from Azure to the client
        proxyRes.pipe(res);
      }).on('error', (error) => {
        console.error('Error proxying image:', error);
        throw new HttpException(
          'Failed to fetch image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (error) {
      console.error('Error in proxy controller:', error);
      throw new HttpException(
        'Failed to proxy image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
