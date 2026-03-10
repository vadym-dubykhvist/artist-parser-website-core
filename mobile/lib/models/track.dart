import 'short_link.dart';

class Track {
  final int id;
  final String title;
  final String slug;
  final int artistId;
  final String? coverUrl;
  final String? spotifyUrl;
  final String? youtubeUrl;
  final String? appleMusicUrl;
  final String? releaseDate;
  final int? duration;
  final List<ShortLink> shortLinks;

  const Track({
    required this.id,
    required this.title,
    required this.slug,
    required this.artistId,
    this.coverUrl,
    this.spotifyUrl,
    this.youtubeUrl,
    this.appleMusicUrl,
    this.releaseDate,
    this.duration,
    this.shortLinks = const [],
  });

  factory Track.fromJson(Map<String, dynamic> json) => Track(
        id: json['id'] as int,
        title: json['title'] as String,
        slug: json['slug'] as String,
        artistId: json['artistId'] as int,
        coverUrl: json['coverUrl'] as String?,
        spotifyUrl: json['spotifyUrl'] as String?,
        youtubeUrl: json['youtubeUrl'] as String?,
        appleMusicUrl: json['appleMusicUrl'] as String?,
        releaseDate: json['releaseDate'] as String?,
        duration: json['duration'] as int?,
        shortLinks: (json['shortLinks'] as List<dynamic>? ?? [])
            .map((s) => ShortLink.fromJson(s as Map<String, dynamic>))
            .toList(),
      );
}
