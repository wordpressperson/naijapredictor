"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{ 
      borderBottom: '1px solid var(--border-color)', 
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '70px' 
      }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
          Naija<span style={{ color: 'var(--accent-primary)' }}>Predictor</span>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session ? (
            <>
              {profile?.is_admin && (
                <Link href="/admin" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  Admin Portal
                </Link>
              )}
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                color: 'var(--accent-primary)'
              }}>
                {profile ? `${Number(profile.points).toFixed(2)} Points` : 'Loading...'}
              </div>
              <button onClick={handleSignOut} className="btn" style={{ border: '1px solid var(--border-color)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="btn btn-primary">
              Sign In / Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
