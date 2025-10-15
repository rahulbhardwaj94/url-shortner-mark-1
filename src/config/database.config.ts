import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'todo_app',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_app',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}));
