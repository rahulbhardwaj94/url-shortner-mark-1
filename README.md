
# NestJS Todo API Boilerplate

A production-ready NestJS application with MySQL, MongoDB, and Redis integration.

## Features

- ✅ RESTful API with Swagger documentation
- ✅ MySQL database with Sequelize ORM
- ✅ MongoDB integration with Mongoose
- ✅ Redis caching layer
- ✅ Unique title validation for todos
- ✅ Update todos by title or ID
- ✅ Comprehensive error handling
- ✅ Docker containerization
- ✅ PM2 process management

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start services with Docker Compose
docker-compose up -d

# Start the application
npm run start:dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

## API Endpoints

### Todo Management
- `GET /todos` - Get all todos
- `POST /todos` - Create a new todo
- `GET /todos/:id` - Get todo by ID
- `GET /todos/title/:title` - Get todo by title
- `PATCH /todos/:id` - Update todo by ID
- `PATCH /todos/title/:title` - Update todo by title
- `DELETE /todos/:id` - Delete todo by ID

### Debug Endpoints
- `GET /todos/debug/redis/keys` - Get all Redis keys
- `GET /todos/debug/redis/key/:key` - Get specific Redis key info
- `DELETE /todos/debug/redis/clear` - Clear all Redis cache
- `DELETE /todos/debug/redis/clear/todos` - Clear todo-related cache

## Environment Variables

Copy `env.example` to `.env` and configure your database connections:

```env
# Application
NODE_ENV=development
PORT=3000

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=todo_app

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/todo_app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## Docker

### Local Development
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build image
docker build -t todo-app .

# Run container
docker run -p 3000:3000 todo-app
```

## EC2 Deployment

### Prerequisites
- EC2 instance with Ubuntu 20.04 LTS
- Security groups configured for ports 22, 80, 443, 3000
- RDS instance for MySQL (optional)
- DocumentDB for MongoDB (optional)
- ElastiCache for Redis (optional)

### Deployment Steps
1. **Launch EC2 instance**
2. **Run deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. **Configure environment variables**
4. **Start application with PM2**

### Manual Deployment
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/boilerplate-nestjs.git
cd boilerplate-nestjs

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Project Structure

```
src/
├── common/
│   ├── interceptors/        # Response, logging interceptors
│   └── constants/           # App constants
├── config/                  # Configuration files
├── database/
│   ├── mysql/              # MySQL entities and repositories
│   ├── mongodb/            # MongoDB schemas and repositories
│   └── redis/              # Redis services
├── modules/
│   ├── auth/               # Authentication module
│   ├── health/             # Health check module
│   └── todo/               # Todo management module
├── exceptions/             # Global exception filters
└── main.ts                 # Application entry point
```

## Database Schema

### MySQL (Primary)
- **todos** table with auto-increment ID
- Unique title constraint
- User association support

### MongoDB (Secondary)
- **todos** collection with ObjectId
- Same schema as MySQL for consistency
- Used for additional querying capabilities

### Redis (Caching)
- `todo:{id}` - Individual todo cache (1 hour TTL)
- `todos:all` - All todos cache (5 minutes TTL)
- `todos:user:{userId}` - User-specific todos cache (5 minutes TTL)

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC# task-manager-nest
