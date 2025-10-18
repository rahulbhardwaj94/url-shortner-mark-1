import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'urls',
  timestamps: true,
  underscored: true,
})
export class Url extends Model<Url> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
      len: [1, 2048], // Max URL length
    },
  })
  originalUrl: string;

  @Index('urls_short_code')
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 10],
    },
  })
  shortCode: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  clickCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastAccessedAt: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
