class ShortLink {
  final int id;
  final String code;
  final String originalUrl;
  final String platform;
  final int clickCount;

  const ShortLink({
    required this.id,
    required this.code,
    required this.originalUrl,
    required this.platform,
    required this.clickCount,
  });

  factory ShortLink.fromJson(Map<String, dynamic> json) => ShortLink(
        id: json['id'] as int,
        code: json['code'] as String,
        originalUrl: json['originalUrl'] as String,
        platform: json['platform'] as String,
        clickCount: json['clickCount'] as int? ?? 0,
      );
}
