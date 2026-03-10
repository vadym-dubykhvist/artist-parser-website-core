import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Artist } from './entities/artist.entity';
import { Track } from './entities/track.entity';
import { ShortLink } from './entities/short-link.entity';
import { AuthModule } from './auth/auth.module';
import { ArtistModule } from './artist/artist.module';
import { TrackModule } from './track/track.module';
import { ShortLinkModule } from './short-link/short-link.module';
import { SpotifyModule } from './spotify/spotify.module';
import { YoutubeModule } from './youtube/youtube.module';
import { AppleMusicModule } from './apple-music/apple-music.module';
import { MusicSyncModule } from './music-sync/music-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<string>('DB_PORT');
        const dbUser = configService.get<string>('DB_USER');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME');

        if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
          throw new Error(
            'Database configuration is required. Please set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in your .env file.',
          );
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: parseInt(dbPort),
          username: dbUser,
          password: dbPassword,
          database: dbName,
          entities: [User, Artist, Track, ShortLink],
          synchronize: !isProduction,
          logging: !isProduction,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    ArtistModule,
    TrackModule,
    ShortLinkModule,
    SpotifyModule,
    YoutubeModule,
    AppleMusicModule,
    MusicSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
