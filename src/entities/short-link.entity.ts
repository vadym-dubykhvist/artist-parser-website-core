import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Track } from './track.entity';

export enum Platform {
  SPOTIFY = 'spotify',
  YOUTUBE = 'youtube',
  APPLE = 'apple',
}

@Entity('short_links')
export class ShortLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @ManyToOne(() => Track, (track) => track.shortLinks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column({ nullable: true })
  trackId: number;

  @Column({ default: 0 })
  clickCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
