import { IsUrl, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://www.example.com/very/long/url/path',
    maxLength: 2048,
  })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'originalUrl must be a valid URL with http or https protocol',
    },
  )
  @IsNotEmpty()
  @MaxLength(2048, {
    message: 'originalUrl must not exceed 2048 characters',
  })
  originalUrl: string;
}
