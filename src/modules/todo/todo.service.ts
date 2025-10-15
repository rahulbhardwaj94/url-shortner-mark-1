import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TodoRepository } from '../../database/mysql/repositories/todo.repository';
import { MongoTodoRepository } from '../../database/mongodb/repositories/todo.repository';
import { RedisService } from '../../database/redis/services/redis.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly mongoTodoRepository: MongoTodoRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    this.logger.log('Creating new todo');

    // Check if title already exists
    const existingTodo = await this.todoRepository.findByTitle(
      createTodoDto.title,
    );
    if (existingTodo) {
      throw new BadRequestException(
        `Todo with title "${createTodoDto.title}" already exists, Title should be unique`,
      );
    }

    // Create in MySQL
    const mysqlTodo = await this.todoRepository.create(createTodoDto);

    // Create in MongoDB
    const mongoTodo = await this.mongoTodoRepository.create(createTodoDto);

    // Cache in Redis
    await this.redisService.set(
      `todo:${mysqlTodo.id}`,
      JSON.stringify(mysqlTodo),
      3600, // 1 hour
    );

    // Invalidate all todos cache since we added a new todo
    await this.redisService.del('todos:all');

    this.logger.log(`Todo created with ID: ${mysqlTodo.id}`);
    return { mysql: mysqlTodo, mongo: mongoTodo };
  }

  async findAll() {
    this.logger.log('Fetching all todos');

    // Try to get from cache first
    const cachedTodos = await this.redisService.get('todos:all');
    if (cachedTodos) {
      this.logger.log('Returning cached todos');
      return JSON.parse(cachedTodos);
    }

    // Get from MySQL
    const mysqlTodos = await this.todoRepository.findAll();

    // Cache the result
    await this.redisService.set('todos:all', JSON.stringify(mysqlTodos), 300); // 5 minutes

    return mysqlTodos;
  }

  async findOne(id: number) {
    this.logger.log(`Fetching todo with ID: ${id}`);

    // Try cache first
    const cachedTodo = await this.redisService.get(`todo:${id}`);
    if (cachedTodo) {
      this.logger.log('Returning cached todo');
      return JSON.parse(cachedTodo);
    }

    // Get from MySQL
    const todo = await this.todoRepository.findOne(id);

    if (todo) {
      // Cache the result
      await this.redisService.set(`todo:${id}`, JSON.stringify(todo), 3600);
    }

    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    this.logger.log(`Updating todo with ID: ${id}`);

    // Get the existing todo to find its title
    const existingTodo = await this.todoRepository.findOne(id);
    if (!existingTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // If updating title, check if new title is unique
    if (updateTodoDto.title && updateTodoDto.title !== existingTodo.title) {
      const titleExists = await this.todoRepository.findByTitle(
        updateTodoDto.title,
      );
      if (titleExists) {
        throw new BadRequestException(
          `Todo with title "${updateTodoDto.title}" already exists, Title should be unique`,
        );
      }
    }

    // Update in MySQL
    const mysqlTodo = await this.todoRepository.update(id, updateTodoDto);

    // Update in MongoDB using the original title
    try {
      await this.mongoTodoRepository.updateByTitle(
        existingTodo.title,
        updateTodoDto,
      );
    } catch (error) {
      this.logger.warn('Failed to update in MongoDB:', error.message);
    }

    // Update cache
    await this.redisService.set(`todo:${id}`, JSON.stringify(mysqlTodo), 3600);

    // Invalidate all todos cache
    await this.redisService.del('todos:all');

    this.logger.log(`Todo updated with ID: ${id}`);
    return mysqlTodo;
  }

  async remove(id: number) {
    this.logger.log(`Removing todo with ID: ${id}`);

    // Get the existing todo to find its title
    const existingTodo = await this.todoRepository.findOne(id);
    if (!existingTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Remove from MySQL
    await this.todoRepository.remove(id);

    // Remove from MongoDB using the title
    try {
      await this.mongoTodoRepository.removeByTitle(existingTodo.title);
    } catch (error) {
      this.logger.warn('Failed to remove from MongoDB:', error.message);
    }

    // Remove from cache
    await this.redisService.del(`todo:${id}`);
    await this.redisService.del('todos:all');

    this.logger.log(`Todo removed with ID: ${id}`);
  }

  async findByUserId(userId: string) {
    this.logger.log(`Fetching todos for user: ${userId}`);

    const cacheKey = `todos:user:${userId}`;
    const cachedTodos = await this.redisService.get(cacheKey);

    if (cachedTodos) {
      this.logger.log('Returning cached user todos');
      return JSON.parse(cachedTodos);
    }

    const todos = await this.todoRepository.findByUserId(userId);
    await this.redisService.set(cacheKey, JSON.stringify(todos), 300);

    return todos;
  }

  async findByTitle(title: string) {
    this.logger.log(`Fetching todo with title: ${title}`);

    const todo = await this.todoRepository.findByTitle(title);
    if (!todo) {
      throw new NotFoundException(`Todo with title "${title}" not found`);
    }

    return todo;
  }

  async updateByTitle(title: string, updateTodoDto: UpdateTodoDto) {
    this.logger.log(`Updating todo with title: ${title}`);

    // Find the todo by title first
    const existingTodo = await this.todoRepository.findByTitle(title);
    if (!existingTodo) {
      throw new NotFoundException(`Todo with title "${title}" not found`);
    }

    // If updating title, check if new title is unique
    if (updateTodoDto.title && updateTodoDto.title !== title) {
      const titleExists = await this.todoRepository.findByTitle(
        updateTodoDto.title,
      );
      if (titleExists) {
        throw new BadRequestException(
          `Todo with title "${updateTodoDto.title}" already exists, Title should be unique`,
        );
      }
    }

    // Update in MySQL
    const mysqlTodo = await this.todoRepository.update(
      existingTodo.id,
      updateTodoDto,
    );

    // Update in MongoDB using the original title
    try {
      await this.mongoTodoRepository.updateByTitle(title, updateTodoDto);
    } catch (error) {
      this.logger.warn('Failed to update in MongoDB:', error.message);
    }

    // Update cache
    await this.redisService.set(
      `todo:${existingTodo.id}`,
      JSON.stringify(mysqlTodo),
      3600,
    );

    // Invalidate all todos cache
    await this.redisService.del('todos:all');

    this.logger.log(`Todo updated with title: ${title}`);
    return mysqlTodo;
  }

  async getRedisKeys() {
    const allKeys = await this.redisService.getAllKeys();
    const todoKeys = await this.redisService.getAllKeys('todo:*');
    const todosKeys = await this.redisService.getAllKeys('todos:*');

    return {
      allKeys,
      todoKeys,
      todosKeys,
      total: allKeys.length,
    };
  }

  async getRedisKey(key: string) {
    const result = await this.redisService.getKeyWithTTL(key);
    return {
      key,
      ...result,
      exists: result.value !== null,
    };
  }

  async clearRedisCache() {
    const deleted = await this.redisService.deletePattern('*');
    return { message: `Cleared ${deleted} keys from Redis` };
  }

  async clearTodoCache() {
    const todoKeys = await this.redisService.deletePattern('todo*');
    const todosKeys = await this.redisService.deletePattern('todos*');
    return {
      message: `Cleared ${todoKeys + todosKeys} todo-related keys from Redis`,
      todoKeys,
      todosKeys,
    };
  }
}
