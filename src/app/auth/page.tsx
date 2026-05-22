"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const { error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      if (type === 'signup') {
        setSuccessMsg('Sign up successful! Please check your email for a confirmation link.');
      } else {
        router.push('/');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-card animate-fade-in">
      <div style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome to NaijaPredictor</h2>
        
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--accent-danger)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--accent-success)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={() => handleAuth('login')}
              disabled={loading}
            >
              Sign In
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, border: '1px solid var(--border-color)' }}
              onClick={() => handleAuth('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
