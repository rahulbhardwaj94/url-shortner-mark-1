import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TodoRepository } from '../../database/mysql/repositories/todo.repository';
import { MongoTodoRepository } from '../../database/mongodb/repositories/todo.repository';
import { Todo } from '../../database/mysql/entities/todo.entity';
import {
  Todo as MongoTodo,
  TodoSchema,
} from '../../database/mongodb/schemas/todo.schema';

@Module({
  imports: [
    SequelizeModule.forFeature([Todo]),
    MongooseModule.forFeature([{ name: MongoTodo.name, schema: TodoSchema }]),
  ],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository, MongoTodoRepository],
  exports: [TodoService],
})
export class TodoModule {}
