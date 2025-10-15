import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MySqlModule } from './database/mysql/mysql.module';
import { MongoDbModule } from './database/mongodb/mongodb.module';
import { RedisModule } from './database/redis/redis.module';
import { TodoModule } from './modules/todo/todo.module';
import { HealthModule } from './modules/health/health.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    MySqlModule,
    MongoDbModule,
    RedisModule,
    TodoModule,
    HealthModule,
  ],
})
export class AppModule {}
