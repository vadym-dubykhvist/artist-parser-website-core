'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onAddArtist?: () => void;
}

export function Header({ onAddArtist }: HeaderProps) {
  const { isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header
      style={{
        background: '#383852',
        borderBottom: '1px solid rgba(120, 66, 89, 0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #BE4039, #784259)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(190, 64, 57, 0.3)',
            }}
          >
            ♫
          </div>
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#e8ddd6',
              letterSpacing: '-0.02em',
            }}
          >
            Artist Hub
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAdmin ? (
            <>
              {/* Admin badge */}
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(190, 64, 57, 0.15)',
                  border: '1px solid rgba(190, 64, 57, 0.4)',
                  color: '#BE4039',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Admin
              </span>

              {/* Add Artist button (only on home page) */}
              {isHome && onAddArtist && (
                <button
                  onClick={onAddArtist}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #BE4039, #B94E56)',
                    color: '#e8ddd6',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(190, 64, 57, 0.3)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
                  }
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
                  Add Artist
                </button>
              )}

              {/* User email */}
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(232, 221, 214, 0.5)',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 66, 89, 0.5)',
                  background: 'transparent',
                  color: 'rgba(232, 221, 214, 0.6)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    '#B94E56';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B94E56';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(120, 66, 89, 0.5)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(232, 221, 214, 0.6)';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(120, 66, 89, 0.5)',
                color: 'rgba(232, 221, 214, 0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  '#B94E56';
                (e.currentTarget as HTMLAnchorElement).style.color = '#e8ddd6';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'rgba(120, 66, 89, 0.5)';
                (e.currentTarget as HTMLAnchorElement).style.color =
                  'rgba(232, 221, 214, 0.7)';
              }}
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
