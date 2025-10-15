import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiTags('todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, description: 'Todos retrieved successfully' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.todoService.findByUserId(userId);
    }
    return this.todoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiResponse({ status: 200, description: 'Todo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({ status: 200, description: 'Todo updated successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiResponse({ status: 200, description: 'Todo deleted successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(id);
  }

  @Get('title/:title')
  @ApiOperation({ summary: 'Get a todo by title' })
  @ApiResponse({ status: 200, description: 'Todo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findByTitle(@Param('title') title: string) {
    return this.todoService.findByTitle(title);
  }

  @Patch('title/:title')
  @ApiOperation({ summary: 'Update a todo by title' })
  @ApiResponse({ status: 200, description: 'Todo updated successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  @ApiResponse({ status: 409, description: 'Title already exists' })
  updateByTitle(
    @Param('title') title: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.updateByTitle(title, updateTodoDto);
  }

  @Get('debug/redis/keys')
  @ApiOperation({ summary: 'Get all Redis keys' })
  async getRedisKeys() {
    return this.todoService.getRedisKeys();
  }

  @Get('debug/redis/key/:key')
  @ApiOperation({ summary: 'Get Redis key value and TTL' })
  async getRedisKey(@Param('key') key: string) {
    return this.todoService.getRedisKey(key);
  }

  @Delete('debug/redis/clear')
  @ApiOperation({ summary: 'Clear all Redis cache' })
  async clearRedisCache() {
    return this.todoService.clearRedisCache();
  }

  @Delete('debug/redis/clear/todos')
  @ApiOperation({ summary: 'Clear only todo-related cache' })
  async clearTodoCache() {
    return this.todoService.clearTodoCache();
  }
}
