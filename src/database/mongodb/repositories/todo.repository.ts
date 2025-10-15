import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from '../schemas/todo.schema';
import { CreateTodoDto } from '../../../modules/todo/dto/create-todo.dto';
import { UpdateTodoDto } from '../../../modules/todo/dto/update-todo.dto';

@Injectable()
export class MongoTodoRepository {
  constructor(
    @InjectModel(Todo.name)
    private todoModel: Model<TodoDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new this.todoModel(createTodoDto);
    return todo.save();
  }

  async findAll(): Promise<Todo[]> {
    return this.todoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Todo> {
    return this.todoModel.findById(id).exec();
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return this.todoModel
      .findByIdAndUpdate(id, updateTodoDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.todoModel.findByIdAndDelete(id).exec();
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByTags(tags: string[]): Promise<Todo[]> {
    return this.todoModel
      .find({ tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTitle(title: string): Promise<Todo> {
    return this.todoModel.findOne({ title }).exec();
  }

  async updateByTitle(
    title: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoModel
      .findOneAndUpdate({ title }, updateTodoDto, { new: true })
      .exec();
  }

  async removeByTitle(title: string): Promise<void> {
    await this.todoModel.findOneAndDelete({ title }).exec();
  }
}
