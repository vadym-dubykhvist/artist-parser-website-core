import Link from 'next/link';
import Image from 'next/image';
import { Track } from '@/lib/api';
import { formatDuration } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const platformStyles: Record<string, { bg: string; label: string; icon: string }> = {
  spotify: { bg: '#1F313B', label: 'Spotify', icon: '♫' },
  youtube: { bg: '#BE4039', label: 'YouTube', icon: '▶' },
  apple: { bg: '#784259', label: 'Apple', icon: '♪' },
};

export function TrackRow({ track }: { track: Track }) {
  const shortLinks = track.shortLinks ?? [];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        background: 'rgba(56, 56, 82, 0.4)',
        border: '1px solid rgba(120, 66, 89, 0.2)',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(56, 56, 82, 0.8)';
        (e.currentTarget as HTMLDivElement).style.borderColor =
          'rgba(185, 78, 86, 0.4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(56, 56, 82, 0.4)';
        (e.currentTarget as HTMLDivElement).style.borderColor =
          'rgba(120, 66, 89, 0.2)';
      }}
    >
      {/* Cover */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          background: '#383852',
        }}
      >
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="48px"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#B94E56',
            }}
          >
            ♫
          </div>
        )}
      </div>

      {/* Title */}
      <Link
        href={`/tracks/${track.slug}`}
        style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: '#e8ddd6',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {track.title}
        </p>
        {track.duration && (
          <p
            style={{
              margin: '0.1rem 0 0',
              fontSize: '0.75rem',
              color: 'rgba(232, 221, 214, 0.5)',
            }}
          >
            {formatDuration(track.duration)}
            {track.releaseDate && ` · ${track.releaseDate.slice(0, 4)}`}
          </p>
        )}
      </Link>

      {/* Platform buttons */}
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
        {shortLinks.map((sl) => {
          const style = platformStyles[sl.platform] ?? platformStyles.spotify;
          return (
            <a
              key={sl.id}
              href={`${API_URL}/s/${sl.code}`}
              target="_blank"
              rel="noopener noreferrer"
              title={style.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: style.bg,
                border: '1px solid rgba(185, 78, 86, 0.3)',
                color: '#e8ddd6',
                fontSize: '0.8rem',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.75')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
              }
            >
              {style.icon}
            </a>
          );
        })}
      </div>
    </div>
  );
}
