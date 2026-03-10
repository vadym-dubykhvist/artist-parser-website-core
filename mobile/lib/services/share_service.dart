import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import '../models/track.dart';
import '../models/short_link.dart';
import '../config.dart';

class ShareService {
  static String _shortUrl(ShortLink link) => '${AppConfig.publicAppUrl}/s/${link.code}';

  static String _buildShareText(Track track, String artistName) {
    final buffer = StringBuffer();
    buffer.writeln('${track.title} — $artistName');
    buffer.writeln();

    final spotify = track.shortLinks.where((l) => l.platform == 'spotify').firstOrNull;
    final youtube = track.shortLinks.where((l) => l.platform == 'youtube').firstOrNull;
    final apple = track.shortLinks.where((l) => l.platform == 'apple').firstOrNull;

    if (spotify != null) {
      buffer.writeln('Spotify: ${_shortUrl(spotify)}');
    } else if (track.spotifyUrl != null) {
      buffer.writeln('Spotify: ${track.spotifyUrl}');
    }

    if (youtube != null) {
      buffer.writeln('YouTube: ${_shortUrl(youtube)}');
    } else if (track.youtubeUrl != null) {
      buffer.writeln('YouTube: ${track.youtubeUrl}');
    }

    if (apple != null) {
      buffer.writeln('Apple Music: ${_shortUrl(apple)}');
    } else if (track.appleMusicUrl != null) {
      buffer.writeln('Apple Music: ${track.appleMusicUrl}');
    }

    return buffer.toString().trim();
  }

  static Future<void> shareTrack(Track track, String artistName) async {
    final text = _buildShareText(track, artistName);
    final subject = '${track.title} — $artistName';

    if (track.coverUrl != null) {
      try {
        final response = await http
            .get(Uri.parse(track.coverUrl!))
            .timeout(AppConfig.httpTimeout);
        if (response.statusCode == 200) {
          // XFile.fromData works on all platforms (web, iOS, Android) without dart:io
          final xFile = XFile.fromData(
            response.bodyBytes,
            name: 'cover_${track.id}.jpg',
            mimeType: 'image/jpeg',
          );
          await Share.shareXFiles([xFile], text: text, subject: subject);
          return;
        }
      } catch (_) {
        // fall through to text-only share
      }
    }

    await Share.share(text, subject: subject);
  }
}
