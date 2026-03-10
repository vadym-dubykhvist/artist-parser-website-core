import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { ShortLink } from './short-link.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => Artist, (artist) => artist.tracks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column()
  artistId: number;

  @Column({ nullable: true, type: 'text' })
  coverUrl: string;

  @Column({ nullable: true })
  isrc: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  releaseDate: string;

  @Column({ nullable: true, type: 'text' })
  spotifyUrl: string;

  @Column({ nullable: true, type: 'text' })
  youtubeUrl: string;

  @Column({ nullable: true, type: 'text' })
  appleMusicUrl: string;

  @OneToMany(() => ShortLink, (shortLink) => shortLink.track, { cascade: true })
  shortLinks: ShortLink[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
