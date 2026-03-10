'use client';

import { useState, useEffect, useCallback } from 'react';
import { getArtists, Artist } from '@/lib/api';
import { ArtistCard } from '@/components/ArtistCard';
import { AddArtistModal } from '@/components/AddArtistModal';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAdmin, token } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchArtists = useCallback(async () => {
    try {
      const data = await getArtists();
      setArtists(data);
    } catch {
      // API might not be running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this artist and all their tracks?')) return;
    setDeletingId(id);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      await fetch(`${API_URL}/artists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Failed to delete artist');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header onAddArtist={() => setModalOpen(true)} />

      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem' }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#e8ddd6',
              letterSpacing: '-0.03em',
            }}
          >
            Artists
          </h1>
          <p
            style={{
              margin: '0.4rem 0 0',
              color: 'rgba(232, 221, 214, 0.45)',
              fontSize: '0.875rem',
            }}
          >
            {loading
              ? 'Loading...'
              : artists.length > 0
                ? `${artists.length} artist${artists.length !== 1 ? 's' : ''} in the collection`
                : 'No artists yet'}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: '16px',
                  background: '#383852',
                  opacity: 0.4,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : artists.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {artists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                isAdmin={isAdmin}
                deleting={deletingId === artist.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: '#383852',
              borderRadius: '20px',
              border: '1px dashed rgba(120, 66, 89, 0.4)',
            }}
          >
            <div
              style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}
            >
              ♫
            </div>
            <p
              style={{
                color: 'rgba(232, 221, 214, 0.5)',
                margin: '0 0 1.5rem',
                fontSize: '0.95rem',
              }}
            >
              No artists yet.
            </p>
            {isAdmin ? (
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #BE4039, #B94E56)',
                  color: '#e8ddd6',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(190, 64, 57, 0.3)',
                }}
              >
                + Add First Artist
              </button>
            ) : (
              <p
                style={{
                  color: 'rgba(232, 221, 214, 0.3)',
                  fontSize: '0.8rem',
                  margin: 0,
                }}
              >
                Log in as admin to add artists
              </p>
            )}
          </div>
        )}
      </div>

      <AddArtistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={fetchArtists}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </>
  );
}
