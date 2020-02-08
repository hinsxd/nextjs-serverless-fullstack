import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Length } from 'class-validator';

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Length(6, 20)
  @Column({ unique: true })
  @Field()
  username: string;

  // Do not put @Field() here as we do not pw to be queried
  @Column()
  password: string;
}
