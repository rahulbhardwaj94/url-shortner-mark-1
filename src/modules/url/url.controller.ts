import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UrlStatsDto } from './dto/url-stats.dto';

@ApiTags('urls')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Shorten a URL',
    description: 'Create a shortened URL from the provided original URL',
  })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided',
  })
  async shortenUrl(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<UrlResponseDto> {
    return this.urlService.shortenUrl(createUrlDto);
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Redirect to original URL',
    description: 'Redirect to the original URL using the short code',
  })
  @ApiParam({
    name: 'code',
    description: 'The short code for the URL',
    example: 'a1B2c3D',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async redirectToOriginal(
    @Param('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const originalUrl = await this.urlService.getOriginalUrl(code);
      res.redirect(HttpStatus.FOUND, originalUrl);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Short URL not found',
        error: 'Not Found',
      });
    }
  }

  @Get('stats/:code')
  @ApiOperation({
    summary: 'Get URL statistics',
    description: 'Get click count and other statistics for a short URL',
  })
  @ApiParam({
    name: 'code',
    description: 'The short code for the URL',
    example: 'a1B2c3D',
  })
  @ApiResponse({
    status: 200,
    description: 'URL statistics retrieved successfully',
    type: UrlStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async getUrlStats(@Param('code') code: string): Promise<UrlStatsDto> {
    return this.urlService.getUrlStats(code);
  }
}
