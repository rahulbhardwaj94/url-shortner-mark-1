import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'todos' })
export class Todo extends Model<Todo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ allowNull: false, unique: true })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ defaultValue: false })
  completed: boolean;

  @Column({ allowNull: true })
  userId: string;

  @Column({ allowNull: true })
  priority: string;

  @Column({ allowNull: true })
  dueDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
