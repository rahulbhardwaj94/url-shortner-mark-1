import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('app.mysql'),
        models: [Todo],
        autoLoadModels: true,
        synchronize: configService.get('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MySqlModule {}
