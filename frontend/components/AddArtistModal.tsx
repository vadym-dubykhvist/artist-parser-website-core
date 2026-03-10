'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SpotifyArtist {
  name: string;
  imageUrl: string | null;
  bio: string;
  spotifyId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddArtistModal({ open, onClose, onAdded }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyArtist[]>([]);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const res = await fetch(
          `${API_URL}/artists/search?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error('Search failed');
        setResults(await res.json());
      } catch {
        setError('Search failed');
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query, token, API_URL]);

  const handleAdd = async (artist: SpotifyArtist) => {
    setSyncing(artist.spotifyId);
    setError('');
    try {
      const res = await fetch(`${API_URL}/artists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spotifyId: artist.spotifyId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      onAdded();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSyncing(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          width: '100%',
          maxWidth: '520px',
          padding: '0 1rem',
        }}
      >
        <div
          style={{
            background: '#383852',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(120, 66, 89, 0.5)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e8ddd6' }}>
                Add Artist
              </h2>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'rgba(232, 221, 214, 0.5)' }}>
                Search by artist name
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(120, 66, 89, 0.4)',
                borderRadius: '8px',
                color: 'rgba(232, 221, 214, 0.5)',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              x
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Drake, Taylor Swift, The Weeknd..."
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(120, 66, 89, 0.4)',
                background: '#1F313B',
                color: '#e8ddd6',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#B94E56')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(120, 66, 89, 0.4)')}
            />
            {searching && (
              <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232, 221, 214, 0.4)', fontSize: '0.75rem' }}>
                ...
              </span>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'rgba(190, 64, 57, 0.15)', border: '1px solid rgba(190, 64, 57, 0.4)', color: '#BE4039', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
              {results.map((artist) => (
                <button
                  key={artist.spotifyId}
                  onClick={() => handleAdd(artist)}
                  disabled={syncing === artist.spotifyId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(120, 66, 89, 0.25)',
                    background: syncing === artist.spotifyId ? 'rgba(190, 64, 57, 0.1)' : '#1F313B',
                    cursor: syncing === artist.spotifyId ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (syncing !== artist.spotifyId) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(185, 78, 86, 0.15)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(185, 78, 86, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1F313B';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(120, 66, 89, 0.25)';
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#383852', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>♫</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e8ddd6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {artist.name}
                    </div>
                    {artist.bio && (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(232, 221, 214, 0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {artist.bio}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: syncing === artist.spotifyId ? '#BE4039' : '#B94E56', flexShrink: 0 }}>
                    {syncing === artist.spotifyId ? 'Syncing...' : '+ Add'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && !error && (
            <p style={{ textAlign: 'center', color: 'rgba(232, 221, 214, 0.35)', fontSize: '0.85rem', margin: '1rem 0 0' }}>
              No artists found
            </p>
          )}
        </div>
      </div>
    </>
  );
}
