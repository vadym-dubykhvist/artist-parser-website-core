'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTrack, Track } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { Header } from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const platformConfig: Record<string, { label: string; icon: string; bg: string; border: string; desc: string }> = {
  spotify: { label: 'Spotify', icon: '♫', bg: '#1F313B', border: '#1DB954', desc: 'Listen on Spotify' },
  youtube: { label: 'YouTube Music', icon: '▶', bg: '#BE4039', border: '#BE4039', desc: 'Watch on YouTube Music' },
  apple:   { label: 'Apple Music',   icon: '♪', bg: '#784259', border: '#784259', desc: 'Listen on Apple Music' },
};

export default function TrackPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrack = useCallback(async () => {
    try {
      const data = await getTrack(slug);
      setTrack(data);
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '500px', margin: '3rem auto', padding: '0 2rem' }}>
          <div style={{ aspectRatio: '1', borderRadius: '20px', background: '#383852', opacity: 0.3 }} />
        </div>
      </>
    );
  }

  if (!track) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(232,221,214,0.5)' }}>Track not found.</p>
          <Link href="/" style={{ color: '#B94E56' }}>← Home</Link>
        </div>
      </>
    );
  }

  const shortLinks = track.shortLinks ?? [];

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Back */}
        {track.artist && (
          <Link
            href={`/artists/${track.artist.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'rgba(232, 221, 214, 0.5)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            ← {track.artist.name}
          </Link>
        )}

        {/* Track card — centered */}
        <div style={{ maxWidth: '460px', margin: '0 auto', textAlign: 'center' }}>
          {/* Cover */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '1.75rem',
              boxShadow: '0 20px 60px rgba(185, 78, 86, 0.2), 0 4px 20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(120, 66, 89, 0.4)',
            }}
          >
            {track.coverUrl ? (
              <Image
                src={track.coverUrl}
                alt={track.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="460px"
                priority
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #383852 0%, #784259 50%, #683536 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem',
                  opacity: 0.4,
                }}
              >
                ♫
              </div>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#e8ddd6',
              letterSpacing: '-0.03em',
            }}
          >
            {track.title}
          </h1>

          {/* Artist link */}
          {track.artist && (
            <Link
              href={`/artists/${track.artist.slug}`}
              style={{
                display: 'inline-block',
                marginTop: '0.4rem',
                fontSize: '1rem',
                color: '#B94E56',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {track.artist.name}
            </Link>
          )}

          {/* Meta */}
          <p style={{ margin: '0.4rem 0 2rem', fontSize: '0.82rem', color: 'rgba(232, 221, 214, 0.35)' }}>
            {[
              track.releaseDate && track.releaseDate.slice(0, 4),
              track.duration && formatDuration(track.duration),
              track.isrc,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {/* Platform buttons */}
          {shortLinks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {shortLinks.map((sl) => {
                const cfg = platformConfig[sl.platform] ?? platformConfig.spotify;
                return (
                  <a
                    key={sl.id}
                    href={`${API_URL}/s/${sl.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}33`,
                      color: '#e8ddd6',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      transition: 'opacity 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.opacity = '0.82';
                      (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                      (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Platform icon */}
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${cfg.border}33`,
                        border: `1px solid ${cfg.border}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {cfg.icon}
                    </span>

                    <span style={{ flex: 1, textAlign: 'left' }}>{cfg.desc}</span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'rgba(232, 221, 214, 0.35)',
                        fontFamily: 'monospace',
                      }}
                    >
                      /s/{sl.code}
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'rgba(232, 221, 214, 0.35)', fontSize: '0.875rem' }}>
              No platform links available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
