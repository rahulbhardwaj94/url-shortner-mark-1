import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { Url } from '../../database/mysql/entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UrlStatsDto } from './dto/url-stats.dto';

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);
  private readonly baseUrl: string;
  private readonly cacheTtl = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    @InjectModel(Url)
    private urlModel: typeof Url,
    @Inject('REDIS_CLIENT')
    private redis: Redis,
    private configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  async shortenUrl(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    const { originalUrl } = createUrlDto;

    // Check if URL already exists
    const existingUrl = await this.urlModel.findOne({
      where: { originalUrl },
    });

    if (existingUrl) {
      this.logger.log(`URL already exists: ${existingUrl.shortCode}`);
      return this.mapToResponseDto(existingUrl);
    }

    // Generate unique short code using optimistic insertion
    let shortCode: string;
    let url: Url;
    let attempts = 0;
    const maxAttempts = 10; // Increase attempts since we're not doing SELECT queries

    while (attempts < maxAttempts) {
      shortCode = nanoid(8); // Increased length for better uniqueness
      
      try {
        // Try to create the URL - let database enforce uniqueness
        url = await this.urlModel.create({
          originalUrl,
          shortCode,
          clickCount: 0,
        });
        
        // Success! Break out of the loop
        break;
      } catch (error) {
        // If it's a unique constraint violation, retry with a new code
        if (error.name === 'SequelizeUniqueConstraintError') {
          attempts++;
          this.logger.warn(
            `Collision detected for shortCode: ${shortCode}, attempting again (${attempts}/${maxAttempts})`,
          );
          continue;
        }
        // For other errors, re-throw
        throw error;
      }
    }

    // If we exhausted attempts without success
    if (attempts >= maxAttempts) {
      throw new Error(
        'Failed to generate unique short code after multiple attempts',
      );
    }

    // Cache the mapping
    await this.cacheUrl(shortCode, originalUrl);

    this.logger.log(`Created new short URL: ${shortCode} -> ${originalUrl}`);
    return this.mapToResponseDto(url);
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    // Try to get from cache first
    const cachedUrl = await this.redis.get(`url:${shortCode}`);

    if (cachedUrl) {
      this.logger.log(`Cache hit for short code: ${shortCode}`);
      // Update click count asynchronously
      this.updateClickCount(shortCode);
      return cachedUrl;
    }

    // Get from database
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) {
      throw new NotFoundException(`Short URL not found: ${shortCode}`);
    }

    // Cache the result
    await this.cacheUrl(shortCode, url.originalUrl);

    // Update click count
    await this.updateClickCount(shortCode);

    this.logger.log(
      `Retrieved URL from database: ${shortCode} -> ${url.originalUrl}`,
    );
    return url.originalUrl;
  }

  async getUrlStats(shortCode: string): Promise<UrlStatsDto> {
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) {
      throw new NotFoundException(`Short URL not found: ${shortCode}`);
    }

    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      lastAccessedAt: url.lastAccessedAt,
    };
  }

  private async cacheUrl(
    shortCode: string,
    originalUrl: string,
  ): Promise<void> {
    try {
      await this.redis.setex(`url:${shortCode}`, this.cacheTtl, originalUrl);
    } catch (error) {
      this.logger.warn(`Failed to cache URL: ${error.message}`);
    }
  }

  private async updateClickCount(shortCode: string): Promise<void> {
    try {
      await this.urlModel.increment('clickCount', {
        where: { shortCode },
      });

      await this.urlModel.update(
        { lastAccessedAt: new Date() },
        { where: { shortCode } },
      );
    } catch (error) {
      this.logger.warn(`Failed to update click count: ${error.message}`);
    }
  }

  private mapToResponseDto(url: Url): UrlResponseDto {
    return {
      shortUrl: `${this.baseUrl}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      lastAccessedAt: url.lastAccessedAt,
    };
  }
}
