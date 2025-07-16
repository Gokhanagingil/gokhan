import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isOnline: boolean;
}
