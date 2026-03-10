import 'package:flutter/material.dart';
import '../models/artist.dart';
import '../services/api_service.dart';
import '../widgets/artist_card.dart';
import 'artist_screen.dart';
import '../theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<Artist>> _future;

  @override
  void initState() {
    super.initState();
    _future = ApiService.getArtists();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Artists')),
      body: FutureBuilder<List<Artist>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, color: AppTheme.accent, size: 48),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      '${snapshot.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.textSecondary),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        setState(() => _future = ApiService.getArtists()),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          final artists = snapshot.data!;
          if (artists.isEmpty) {
            return const Center(
              child: Text('No artists yet', style: TextStyle(color: AppTheme.textSecondary)),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.8,
            ),
            itemCount: artists.length,
            itemBuilder: (context, i) => ArtistCard(
              artist: artists[i],
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ArtistScreen(slug: artists[i].slug),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
