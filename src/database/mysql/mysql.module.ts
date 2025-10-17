import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('app.mysql'),
        models: [],
        autoLoadModels: true,
        synchronize: configService.get('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MySqlModule {}
