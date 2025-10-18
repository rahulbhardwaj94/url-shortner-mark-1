import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from '../../database/mysql/entities/url.entity';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
  imports: [SequelizeModule.forFeature([Url]), RedisModule],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
