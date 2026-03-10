import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from './track.entity';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  spotifyId: string;

  @Column({ nullable: true, type: 'text' })
  imageUrl: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @OneToMany(() => Track, (track) => track.artist, { cascade: true })
  tracks: Track[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
