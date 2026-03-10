import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/artist.dart';
import '../models/track.dart';
import '../config.dart';

class ApiService {
  static Future<List<Artist>> getArtists() async {
    final response = await http
        .get(Uri.parse('${AppConfig.apiBaseUrl}/artists'))
        .timeout(AppConfig.httpTimeout);
    if (response.statusCode != 200) throw Exception('Failed to load artists');
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((j) => Artist.fromJson(j as Map<String, dynamic>)).toList();
  }

  static Future<Artist> getArtist(String slug) async {
    final response = await http
        .get(Uri.parse('${AppConfig.apiBaseUrl}/artists/$slug'))
        .timeout(AppConfig.httpTimeout);
    if (response.statusCode != 200) throw Exception('Failed to load artist');
    return Artist.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  static Future<Track> getTrack(String slug) async {
    final response = await http
        .get(Uri.parse('${AppConfig.apiBaseUrl}/tracks/$slug'))
        .timeout(AppConfig.httpTimeout);
    if (response.statusCode != 200) throw Exception('Failed to load track');
    return Track.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
