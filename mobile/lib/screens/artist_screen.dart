import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/artist.dart';
import '../services/api_service.dart';
import '../widgets/track_tile.dart';
import 'track_screen.dart';
import '../theme.dart';

class ArtistScreen extends StatefulWidget {
  final String slug;

  const ArtistScreen({super.key, required this.slug});

  @override
  State<ArtistScreen> createState() => _ArtistScreenState();
}

class _ArtistScreenState extends State<ArtistScreen> {
  late Future<Artist> _future;

  @override
  void initState() {
    super.initState();
    _future = ApiService.getArtist(widget.slug);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Artist>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(
              child: Text(
                '${snapshot.error}',
                style: const TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          );
        }
        final artist = snapshot.data!;
        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 240,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(artist.name),
                  background: artist.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: artist.imageUrl!,
                          fit: BoxFit.cover,
                          color: Colors.black54,
                          colorBlendMode: BlendMode.darken,
                        )
                      : Container(color: AppTheme.surface),
                ),
              ),
              if (artist.bio != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Text(
                      artist.bio!,
                      style: const TextStyle(color: AppTheme.textSecondary, height: 1.5),
                    ),
                  ),
                ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                  child: Text(
                    '${artist.tracks.length} tracks',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final track = artist.tracks[i];
                    return TrackTile(
                      track: track,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => TrackScreen(
                            trackSlug: track.slug,
                            artistName: artist.name,
                          ),
                        ),
                      ),
                    );
                  },
                  childCount: artist.tracks.length,
                ),
              ),
              const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
            ],
          ),
        );
      },
    );
  }
}
