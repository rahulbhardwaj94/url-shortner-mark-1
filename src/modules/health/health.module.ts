import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
  imports: [TerminusModule, SequelizeModule, MongooseModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
