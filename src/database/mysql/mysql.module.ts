import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Url } from './entities/url.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('app.mysql'),
        models: [Url],
        autoLoadModels: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MySqlModule {}
