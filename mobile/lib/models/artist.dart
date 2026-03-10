import 'track.dart';

class Artist {
  final int id;
  final String name;
  final String slug;
  final String? imageUrl;
  final String? bio;
  final List<Track> tracks;

  const Artist({
    required this.id,
    required this.name,
    required this.slug,
    this.imageUrl,
    this.bio,
    this.tracks = const [],
  });

  factory Artist.fromJson(Map<String, dynamic> json) => Artist(
        id: json['id'] as int,
        name: json['name'] as String,
        slug: json['slug'] as String,
        imageUrl: json['imageUrl'] as String?,
        bio: json['bio'] as String?,
        tracks: (json['tracks'] as List<dynamic>? ?? [])
            .map((t) => Track.fromJson(t as Map<String, dynamic>))
            .toList(),
      );
}
