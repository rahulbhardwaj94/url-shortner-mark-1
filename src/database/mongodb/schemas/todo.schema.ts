import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  userId: string;

  @Prop()
  priority: string;

  @Prop()
  dueDate: Date;

  @Prop()
  tags: string[];

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
