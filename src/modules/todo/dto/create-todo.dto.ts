import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ example: 'Complete project documentation' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Write comprehensive documentation for the API',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ example: 'user123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'high', required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({ example: ['work', 'urgent'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: { category: 'work', project: 'api' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
