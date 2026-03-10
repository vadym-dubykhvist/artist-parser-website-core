'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Artist } from '@/lib/api';

interface Props {
  artist: Artist;
  isAdmin?: boolean;
  deleting?: boolean;
  onDelete?: (id: number) => void;
}

export function ArtistCard({ artist, isAdmin, deleting, onDelete }: Props) {
  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/artists/${artist.slug}`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: '#383852',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(120, 66, 89, 0.3)',
            transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            opacity: deleting ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (deleting) return;
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLDivElement).style.borderColor = '#B94E56';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(185, 78, 86, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(120, 66, 89, 0.3)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #383852 0%, #784259 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  opacity: 0.4,
                }}
              >
                ♫
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(31,49,59,0.9) 0%, transparent 55%)',
              }}
            />
          </div>
          <div style={{ padding: '0.875rem' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#e8ddd6',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {artist.name}
            </h3>
            {artist.bio && (
              <p
                style={{
                  margin: '0.2rem 0 0',
                  fontSize: '0.72rem',
                  color: '#B94E56',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: 500,
                }}
              >
                {artist.bio}
              </p>
            )}
          </div>
        </div>
      </Link>

      {isAdmin && onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(artist.id);
          }}
          disabled={deleting}
          title="Delete artist"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            border: '1px solid rgba(190, 64, 57, 0.5)',
            background: 'rgba(31, 49, 59, 0.85)',
            color: '#B94E56',
            fontSize: '1rem',
            cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.15s',
            zIndex: 10,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(190, 64, 57, 0.85)';
            (e.currentTarget as HTMLButtonElement).style.color = '#e8ddd6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(31, 49, 59, 0.85)';
            (e.currentTarget as HTMLButtonElement).style.color = '#B94E56';
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
