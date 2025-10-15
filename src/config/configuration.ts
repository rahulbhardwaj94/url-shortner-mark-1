import { registerAs } from '@nestjs/config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dialect: process.env.DIALECT || 'mysql',
  ...databaseConfig(),
  ...redisConfig(),
}));
