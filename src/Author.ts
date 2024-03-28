import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column('varchar')
  hash: string | undefined;

  @Column('simple-array', { nullable: true })
  subscribers: string[] | undefined;
}