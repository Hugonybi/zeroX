import { Controller, Get, Param, Res, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as https from 'https';
import * as http from 'http';

/**
 * Proxy controller to serve Azure Blob Storage images through the backend.
 * This solves CORS issues during development by acting as a proxy.
 */
@Controller('proxy')
export class ArtworksProxyController {
  private readonly logger = new Logger(ArtworksProxyController.name);

  @Get('image/*')
  async proxyImage(@Param('0') imagePath: string, @Res() res: Response) {
    // Reconstruct the Azure Blob URL
    const azureUrl = `https://${imagePath}`;
    
    this.logger.debug(`Proxying image request: ${azureUrl}`);

    // Check if this is a stub URL (development fallback)
    if (azureUrl.includes('stub.azureblob.local')) {
      this.logger.warn('Stub URL detected - returning placeholder image');
      // Return a 1x1 transparent pixel as fallback
      const transparentPixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(transparentPixel);
    }

    try {
      // Determine protocol
      const protocol = azureUrl.startsWith('https') ? https : http;

      // Make request to Azure Blob Storage
      const request = protocol.get(azureUrl, (proxyRes) => {
        const statusCode = proxyRes.statusCode || 500;
        
        // Check if the request was successful
        if (statusCode !== 200) {
          this.logger.error(`Azure returned ${statusCode} for ${azureUrl}`);
          
          // Return a transparent placeholder instead of throwing
          const transparentPixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
          );
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.send(transparentPixel);
        }

        // Set appropriate headers
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Allow CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');

        // Pipe the response from Azure to the client
        proxyRes.pipe(res);
      });

      request.on('error', (error) => {
        this.logger.error(`Error proxying image from ${azureUrl}:`, error);
        
        // Return a transparent placeholder instead of throwing
        const transparentPixel = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        );
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(transparentPixel);
      });

      // Set a timeout for the request
      request.setTimeout(10000, () => {
        this.logger.error(`Timeout proxying image from ${azureUrl}`);
        request.destroy();
      });

    } catch (error) {
      this.logger.error('Error in proxy controller:', error);
      
      // Return a transparent placeholder
      const transparentPixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(transparentPixel);
    }
  }
}
