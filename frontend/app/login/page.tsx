'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Card */}
        <div
          style={{
            background: '#383852',
            borderRadius: '20px',
            padding: '2.5rem',
            border: '1px solid rgba(120, 66, 89, 0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Icon + title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #BE4039, #784259)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 8px 24px rgba(190, 64, 57, 0.3)',
              }}
            >
              ♫
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#e8ddd6',
                letterSpacing: '-0.02em',
              }}
            >
              Admin Login
            </h1>
            <p
              style={{
                margin: '0.4rem 0 0',
                fontSize: '0.85rem',
                color: 'rgba(232, 221, 214, 0.5)',
              }}
            >
              Sign in to manage artists
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'rgba(232, 221, 214, 0.7)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 66, 89, 0.4)',
                  background: '#1F313B',
                  color: '#e8ddd6',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = '#B94E56')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'rgba(120, 66, 89, 0.4)')
                }
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'rgba(232, 221, 214, 0.7)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(120, 66, 89, 0.4)',
                  background: '#1F313B',
                  color: '#e8ddd6',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = '#B94E56')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'rgba(120, 66, 89, 0.4)')
                }
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(190, 64, 57, 0.15)',
                  border: '1px solid rgba(190, 64, 57, 0.4)',
                  color: '#BE4039',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '10px',
                border: 'none',
                background: loading
                  ? 'rgba(190, 64, 57, 0.5)'
                  : 'linear-gradient(135deg, #BE4039, #B94E56)',
                color: '#e8ddd6',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 16px rgba(190, 64, 57, 0.35)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(232, 221, 214, 0.5)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.15s',
            }}
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
