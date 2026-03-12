import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'track_screen.dart';

class LookupScreen extends StatefulWidget {
  final String url;
  const LookupScreen({super.key, required this.url});

  @override
  State<LookupScreen> createState() => _LookupScreenState();
}

class _LookupScreenState extends State<LookupScreen> {
  bool _error = false;
  int _step = 0;

  static const _steps = [
    'Fetching track info...',
    'Searching Spotify...',
    'Searching YouTube Music...',
    'Searching Apple Music...',
    'Building your page...',
  ];

  @override
  void initState() {
    super.initState();
    _lookup();
    _animateSteps();
  }

  void _animateSteps() async {
    for (var i = 1; i < _steps.length; i++) {
      await Future.delayed(const Duration(seconds: 3));
      if (!mounted) return;
      setState(() => _step = i);
    }
  }

  Future<void> _lookup() async {
    try {
      final track = await ApiService.findTrackByUrl(widget.url);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => TrackScreen(
            trackSlug: track.slug,
            artistName: track.artistName ?? '',
          ),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.background,
        title: const Text('Finding track'),
      ),
      body: Center(
        child: _error
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.search_off, size: 64, color: AppTheme.textSecondary),
                  const SizedBox(height: 16),
                  const Text(
                    'Track not found',
                    style: TextStyle(fontSize: 18, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.url,
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Go back'),
                  ),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(color: AppTheme.accent),
                  const SizedBox(height: 24),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    child: Text(
                      _steps[_step],
                      key: ValueKey(_step),
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
