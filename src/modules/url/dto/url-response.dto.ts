import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    description: 'The shortened URL',
    example: 'https://short.ly/a1B2c3D',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'The original URL',
    example: 'https://www.example.com/very/long/url/path',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'The short code used in the shortened URL',
    example: 'a1B2c3D',
  })
  shortCode: string;

  @ApiProperty({
    description: 'Number of times this URL has been accessed',
    example: 42,
  })
  clickCount: number;

  @ApiProperty({
    description: 'When this URL was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When this URL was last accessed',
    example: '2024-01-15T14:22:00.000Z',
    required: false,
  })
  lastAccessedAt?: Date;
}
