import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/track.dart';
import '../services/api_service.dart';
import '../services/share_service.dart';
import '../theme.dart';

class TrackScreen extends StatefulWidget {
  final String trackSlug;
  final String artistName;

  const TrackScreen({
    super.key,
    required this.trackSlug,
    required this.artistName,
  });

  @override
  State<TrackScreen> createState() => _TrackScreenState();
}

class _TrackScreenState extends State<TrackScreen> {
  late Future<Track> _future;
  bool _sharing = false;

  @override
  void initState() {
    super.initState();
    _future = ApiService.getTrack(widget.trackSlug);
  }

  Future<void> _share(Track track) async {
    setState(() => _sharing = true);
    try {
      await ShareService.shareTrack(track, widget.artistName);
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  Future<void> _launch(String? url) async {
    if (url == null) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Track>(
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
        final track = snapshot.data!;
        return Scaffold(
          appBar: AppBar(title: Text(track.title, overflow: TextOverflow.ellipsis)),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Cover image
                AspectRatio(
                  aspectRatio: 1,
                  child: track.coverUrl != null
                      ? CachedNetworkImage(
                          imageUrl: track.coverUrl!,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: AppTheme.surface),
                          errorWidget: (_, __, ___) => const _PlaceholderCover(),
                        )
                      : const _PlaceholderCover(),
                ),

                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        track.title,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.artistName,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 16,
                        ),
                      ),
                      if (track.releaseDate != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          track.releaseDate!,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],

                      const SizedBox(height: 28),

                      // Share button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _sharing ? null : () => _share(track),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: _sharing
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.share_rounded),
                          label: Text(_sharing ? 'Sharing...' : 'Share'),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Platform buttons
                      if (track.spotifyUrl != null)
                        _PlatformButton(
                          label: 'Open in Spotify',
                          icon: Icons.music_note,
                          color: const Color(0xFF1DB954),
                          onTap: () => _launch(track.spotifyUrl),
                        ),
                      if (track.youtubeUrl != null)
                        _PlatformButton(
                          label: 'Open in YouTube Music',
                          icon: Icons.play_circle_fill,
                          color: const Color(0xFFFF0000),
                          onTap: () => _launch(track.youtubeUrl),
                        ),
                      if (track.appleMusicUrl != null)
                        _PlatformButton(
                          label: 'Open in Apple Music',
                          icon: Icons.headphones,
                          color: const Color(0xFFFC3C44),
                          onTap: () => _launch(track.appleMusicUrl),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _PlaceholderCover extends StatelessWidget {
  const _PlaceholderCover();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTheme.surface,
      child: const Icon(Icons.music_note, size: 80, color: AppTheme.accent),
    );
  }
}

class _PlatformButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _PlatformButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: OutlinedButton.icon(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: color.withAlpha(128)),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          alignment: Alignment.centerLeft,
        ),
        icon: Icon(icon, color: color),
        label: Text(label),
      ),
    );
  }
}
