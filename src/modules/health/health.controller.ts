import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  SequelizeHealthIndicator,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisService } from '../../database/redis/services/redis.service';
import { HealthIndicatorResult } from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: SequelizeHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private redisService: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  check() {
    return this.health.check([
      // Database checks
      () => this.db.pingCheck('mysql'),
      () => this.mongoose.pingCheck('mongodb'),

      // Redis check
      () => this.checkRedisConnection(),

      // System checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }

  @Get('mysql')
  @HealthCheck()
  @ApiOperation({ summary: 'Check MySQL connection' })
  checkMysql() {
    return this.health.check([() => this.db.pingCheck('mysql')]);
  }

  @Get('mongodb')
  @HealthCheck()
  @ApiOperation({ summary: 'Check MongoDB connection' })
  checkMongoDB() {
    return this.health.check([() => this.mongoose.pingCheck('mongodb')]);
  }

  @Get('redis')
  @HealthCheck()
  @ApiOperation({ summary: 'Check Redis connection' })
  checkRedis() {
    return this.health.check([() => this.checkRedisConnection()]);
  }

  private async checkRedisConnection(): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.set('health:check', 'ok', 10);
      const result = await this.redisService.get('health:check');
      await this.redisService.del('health:check');

      return {
        redis: {
          status: result === 'ok' ? 'up' : 'down',
          message:
            result === 'ok' ? 'Redis is healthy' : 'Redis connection failed',
        },
      } as HealthIndicatorResult; // 👈 Cast fixes the error
    } catch {
      return {
        redis: {
          status: 'down',
          message: 'Redis connection failed',
        },
      } as HealthIndicatorResult;
    }
  }
}
