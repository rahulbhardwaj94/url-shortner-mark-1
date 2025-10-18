# URL Shortener API

A production-ready URL Shortener API built with NestJS, featuring MySQL storage, Redis caching, click analytics, and AWS Elastic Beanstalk deployment support.

## Features

- **URL Shortening**: Create short URLs from long URLs using nanoid
- **URL Redirection**: Fast redirects with Redis caching
- **Click Analytics**: Track click counts and last accessed time
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with Sequelize ORM for persistent storage
- **Cache**: Redis for high-performance URL lookups
- **Documentation**: Swagger/OpenAPI integration
- **Health Checks**: Comprehensive health monitoring
- **Logging**: Structured logging with interceptors
- **Security**: Helmet, CORS, and validation
- **Testing**: Jest configuration for unit and e2e tests
- **Docker**: Multi-stage Dockerfile for production
- **Deployment**: AWS Elastic Beanstalk deployment with RDS and ElastiCache

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

### URL Shortening
- `POST /shorten` - Create a short URL from original URL
- `GET /:code` - Redirect to original URL using short code
- `GET /stats/:code` - Get URL statistics (click count, last accessed, etc.)

### Health Check
- `GET /health` - Application health status

### Documentation
- `GET /api/docs` - Swagger API documentation

## API Usage Examples

### Shorten a URL
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com/very/long/url/path"}'
```

Response:
```json
{
  "shortUrl": "http://localhost:3000/a1B2c3D",
  "originalUrl": "https://www.example.com/very/long/url/path",
  "shortCode": "a1B2c3D",
  "clickCount": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastAccessedAt": null
}
```

### Access Short URL
```bash
curl -I http://localhost:3000/a1B2c3D
```

Response:
```
HTTP/1.1 302 Found
Location: https://www.example.com/very/long/url/path
```

### Get URL Statistics
```bash
curl http://localhost:3000/stats/a1B2c3D
```

Response:
```json
{
  "shortCode": "a1B2c3D",
  "originalUrl": "https://www.example.com/very/long/url/path",
  "clickCount": 42,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastAccessedAt": "2024-01-15T14:22:00.000Z"
}
```

## Environment Variables

Copy `env.example` to `.env` and configure your settings:

```env
# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=urlshortener

# MongoDB Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration (for future use)
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
docker build -t url-shortener-api .

# Run container
docker run -p 3000:3000 url-shortener-api
```

## AWS Elastic Beanstalk Deployment

### Prerequisites
- AWS CLI configured
- EB CLI installed
- RDS MySQL instance
- ElastiCache Redis cluster (optional)

### Quick Deployment
```bash
# Initialize EB application
eb init

# Create environment
eb create production

# Set environment variables
eb setenv MYSQL_HOST=your-rds-endpoint.amazonaws.com MYSQL_PASSWORD=your-password

# Deploy
eb deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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
│   ├── health/             # Health check module
│   └── url/                # URL shortening module
├── exceptions/             # Global exception filters
└── main.ts                 # Application entry point
```

## Database Schema

### MySQL (Primary Storage)
- **urls** table with auto-increment ID
- **originalUrl**: TEXT field for the original URL
- **shortCode**: VARCHAR(10) unique field for the short code
- **clickCount**: INTEGER for tracking clicks
- **lastAccessedAt**: DATETIME for last access timestamp
- **createdAt/updatedAt**: Automatic timestamps

### Redis (Caching)
- `url:{shortCode}` - URL mapping cache (24 hours TTL)
- Used for fast URL lookups and redirections

## Technical Details

### Short Code Generation
- Uses `nanoid(7)` for 7-character codes
- Collision probability: ~146 years to 1% at 1000 IDs/hour
- Automatic retry mechanism for collision handling

### Caching Strategy
- Redis cache for short code → original URL mapping
- 24-hour TTL for cached URLs
- Cache-aside pattern with database fallback

### Click Tracking
- Asynchronous click count updates
- Non-blocking redirects for performance
- Last accessed timestamp tracking

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/health`

## Performance Considerations

- **Redis Caching**: Reduces database load for frequent lookups
- **Connection Pooling**: Optimized database connections
- **Async Operations**: Non-blocking click tracking
- **Indexed Queries**: Database indexes on shortCode field
- **Compression**: Gzip compression for API responses

## Security Features

- **Input Validation**: URL format validation and length limits
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for HTTP responses
- **Rate Limiting**: Throttling to prevent abuse

## Monitoring and Logging

- **Structured Logging**: JSON-formatted logs with context
- **Health Checks**: Comprehensive application health monitoring
- **Error Tracking**: Global exception handling and logging
- **Performance Metrics**: Request timing and response logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC