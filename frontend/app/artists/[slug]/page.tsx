'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArtist, Artist, SpotifyTrackResult, searchArtistTracksOnSpotify } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { TrackRow } from '@/components/TrackRow';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

const TOP_TRACKS_LIMIT = 5;

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, token } = useAuth();
  const slug = params.slug as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [spotifyResults, setSpotifyResults] = useState<SpotifyTrackResult[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArtist = useCallback(async () => {
    try {
      const data = await getArtist(slug);
      setArtist(data);
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArtist();
  }, [fetchArtist]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = search.trim();
    if (q.length < 2) {
      setSpotifyResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSpotifyLoading(true);
      try {
        const results = await searchArtistTracksOnSpotify(slug, q);
        setSpotifyResults(results);
      } finally {
        setSpotifyLoading(false);
      }
    }, 400);
  }, [search, slug]);

  const handleDelete = async () => {
    if (!artist) return;
    if (!confirm('Delete "' + artist.name + '" and all their tracks?')) return;
    setDeleting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      await fetch(`${API_URL}/artists/${artist.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/');
    } catch {
      alert('Failed to delete artist');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ height: '200px', borderRadius: '20px', background: '#383852', opacity: 0.3 }} />
        </div>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(232,221,214,0.5)' }}>Artist not found.</p>
          <Link href="/" style={{ color: '#B94E56' }}>← Back</Link>
        </div>
      </>
    );
  }

  const tracks = artist.tracks ?? [];

  const searchTrimmed = search.trim().toLowerCase();
  const filteredTracks = searchTrimmed
    ? tracks.filter((t) => t.title.toLowerCase().includes(searchTrimmed))
    : tracks;
  const visibleTracks =
    searchTrimmed || showAll ? filteredTracks : filteredTracks.slice(0, TOP_TRACKS_LIMIT);
  const hasMore = !searchTrimmed && !showAll && tracks.length > TOP_TRACKS_LIMIT;

  // Spotify results not already in local DB
  const localTitles = new Set(tracks.map((t) => t.title.toLowerCase()));
  const spotifyExtra = spotifyResults.filter(
    (r) => !localTitles.has(r.title.toLowerCase()),
  );

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'rgba(232, 221, 214, 0.5)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            transition: 'color 0.15s',
          }}
        >
          ← All Artists
        </Link>

        {/* Artist header card */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'flex-start',
            background: 'linear-gradient(135deg, #383852 0%, rgba(120, 66, 89, 0.35) 100%)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid rgba(120, 66, 89, 0.3)',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              background: '#1F313B',
              border: '3px solid #B94E56',
              boxShadow: '0 0 30px rgba(185, 78, 86, 0.3)',
            }}
          >
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="140px"
                priority
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  opacity: 0.3,
                }}
              >
                ♫
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 800,
                color: '#e8ddd6',
                letterSpacing: '-0.03em',
              }}
            >
              {artist.name}
            </h1>
            {artist.bio && (
              <p style={{ margin: '0.5rem 0 0', color: '#B94E56', fontSize: '0.875rem', fontWeight: 500 }}>
                {artist.bio}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  background: 'rgba(185, 78, 86, 0.12)',
                  border: '1px solid rgba(185, 78, 86, 0.3)',
                  color: '#B94E56',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {tracks.length} track{tracks.length !== 1 ? 's' : ''}
              </span>

              {isAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(190, 64, 57, 0.5)',
                    background: 'transparent',
                    color: 'rgba(190, 64, 57, 0.8)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {deleting ? 'Deleting...' : '× Delete Artist'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tracks list */}
        {tracks.length > 0 ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'rgba(232, 221, 214, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  flexShrink: 0,
                }}
              >
                {searchTrimmed ? `Results (${filteredTracks.length})` : 'Top Tracks'}
              </h2>

              <div style={{ position: 'relative', flex: '1', maxWidth: '320px' }}>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search tracks..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 2rem 0.5rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(120, 66, 89, 0.35)',
                    background: '#1F313B',
                    color: '#e8ddd6',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#B94E56')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(120, 66, 89, 0.35)')}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(232, 221, 214, 0.4)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {visibleTracks.length > 0 ? (
                visibleTracks.map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(232, 221, 214, 0.3)', fontSize: '0.85rem' }}>
                  No tracks match &ldquo;{search}&rdquo;
                </div>
              )}
            </div>

            {hasMore && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 66, 89, 0.3)',
                  background: 'transparent',
                  color: 'rgba(232, 221, 214, 0.5)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(185, 78, 86, 0.5)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B94E56';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(120, 66, 89, 0.3)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(232, 221, 214, 0.5)';
                }}
              >
                Show all {tracks.length} tracks
              </button>
            )}

            {/* Spotify extra results */}
            {searchTrimmed && (spotifyLoading || spotifyExtra.length > 0) && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'rgba(232, 221, 214, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {spotifyLoading ? 'Searching Spotify...' : `More on Spotify (${spotifyExtra.length})`}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {spotifyExtra.map((track, i) => (
                    <a
                      key={i}
                      href={track.spotifyUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(31, 49, 59, 0.5)',
                        border: '1px solid rgba(120, 66, 89, 0.15)',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(31, 49, 59, 0.9)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(31, 49, 59, 0.5)';
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#383852',
                          position: 'relative',
                        }}
                      >
                        {track.coverUrl ? (
                          <Image src={track.coverUrl} alt={track.title} fill style={{ objectFit: 'cover' }} sizes="48px" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B94E56' }}>♫</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#e8ddd6', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {track.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(232, 221, 214, 0.4)' }}>
                          {track.duration ? formatDuration(track.duration) : ''}
                          {track.releaseDate ? ` · ${track.releaseDate.slice(0, 4)}` : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#1DB954', flexShrink: 0, fontWeight: 600 }}>
                        ♫ Spotify
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {showAll && tracks.length > TOP_TRACKS_LIMIT && !searchTrimmed && (
              <button
                onClick={() => setShowAll(false)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 66, 89, 0.3)',
                  background: 'transparent',
                  color: 'rgba(232, 221, 214, 0.5)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(185, 78, 86, 0.5)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B94E56';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(120, 66, 89, 0.3)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(232, 221, 214, 0.5)';
                }}
              >
                Show less
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(232, 221, 214, 0.3)', fontSize: '0.9rem' }}>
            No tracks synced yet.
          </div>
        )}
      </div>
    </>
  );
}
