import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Todo } from '../entities/todo.entity';
import { CreateTodoDto } from '../../../modules/todo/dto/create-todo.dto';
import { UpdateTodoDto } from '../../../modules/todo/dto/update-todo.dto';

@Injectable()
export class TodoRepository {
  constructor(
    @InjectModel(Todo)
    private todoModel: typeof Todo,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoModel.create(createTodoDto);
  }

  async findAll(): Promise<Todo[]> {
    return this.todoModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Todo> {
    return this.todoModel.findByPk(id);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.todoModel.update(updateTodoDto, {
      where: { id },
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.todoModel.destroy({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todoModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findByTitle(title: string): Promise<Todo> {
    return this.todoModel.findOne({
      where: { title },
    });
  }
}
