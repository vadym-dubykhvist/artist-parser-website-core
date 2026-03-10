import 'package:flutter/foundation.dart' show kIsWeb;

class AppConfig {
  // Web → localhost, Android emulator → 10.0.2.2, physical device → LAN IP
  // For production: change both to 'https://yourdomain.com'
  static String get apiBaseUrl =>
      kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  // Public domain used in share text short link URLs.
  // IMPORTANT: change this to your real domain before release.
  static const String publicAppUrl = 'https://yourdomain.com';

  static const Duration httpTimeout = Duration(seconds: 10);
}
