import 'package:flutter/material.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'screens/home_screen.dart';
import 'screens/lookup_screen.dart';
import 'theme.dart';

void main() {
  runApp(const ArtistApp());
}

class ArtistApp extends StatefulWidget {
  const ArtistApp({super.key});

  @override
  State<ArtistApp> createState() => _ArtistAppState();
}

class _ArtistAppState extends State<ArtistApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();

    // App opened via Share
    ReceiveSharingIntent.instance.getInitialMedia().then((files) {
      if (files.isNotEmpty) {
        _handleShared(files.first.path);
        ReceiveSharingIntent.instance.reset();
      }
    });

    // Share while app is running
    ReceiveSharingIntent.instance.getMediaStream().listen((files) {
      if (files.isNotEmpty) {
        _handleShared(files.first.path);
        ReceiveSharingIntent.instance.reset();
      }
    });
  }

  void _handleShared(String url) {
    _navigatorKey.currentState?.push(
      MaterialPageRoute(builder: (_) => LookupScreen(url: url)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'Music',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const HomeScreen(),
    );
  }
}
