import 'package:flutter/material.dart';

class AppTheme {
  static const Color background = Color(0xFF1F313B);
  static const Color surface = Color(0xFF2A3F4A);
  static const Color card = Color(0xFF383852);
  static const Color accent = Color(0xFFB94E56);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF8AABB8);

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: background,
        colorScheme: const ColorScheme.dark(
          primary: accent,
          surface: surface,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: background,
          foregroundColor: textPrimary,
          elevation: 0,
        ),
        cardTheme: const CardThemeData(color: surface),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: accent,
            foregroundColor: Colors.white,
          ),
        ),
      );
}
