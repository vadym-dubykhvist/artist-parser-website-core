import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/track.dart';
import '../theme.dart';

class TrackTile extends StatelessWidget {
  final Track track;
  final VoidCallback onTap;

  const TrackTile({super.key, required this.track, required this.onTap});

  String _formatDuration(int ms) {
    final seconds = ms ~/ 1000;
    final m = seconds ~/ 60;
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 48,
          height: 48,
          child: track.coverUrl != null
              ? CachedNetworkImage(
                  imageUrl: track.coverUrl!,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AppTheme.surface),
                  errorWidget: (_, __, ___) => Container(
                    color: AppTheme.surface,
                    child: const Icon(Icons.music_note, size: 24, color: AppTheme.textSecondary),
                  ),
                )
              : Container(
                  color: AppTheme.surface,
                  child: const Icon(Icons.music_note, size: 24, color: AppTheme.textSecondary),
                ),
        ),
      ),
      title: Text(
        track.title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: track.duration != null
          ? Text(
              _formatDuration(track.duration!),
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
            )
          : null,
      trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
      onTap: onTap,
    );
  }
}
