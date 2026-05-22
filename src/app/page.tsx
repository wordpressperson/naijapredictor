"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MarketCard from "@/components/MarketCard";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [markets, setMarkets] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(profileData);
    }

    const { data: marketsData } = await supabase
      .from('markets')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (marketsData) setMarkets(marketsData);
    setLoading(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading markets...</div>;
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 className="animate-fade-in">Predict the Future of Naija</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Use your points to predict outcomes on politics, sports, and pop culture in Nigeria. Parimutuel odds adjust dynamically!
        </p>
      </div>

      {!profile && (
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          border: '1px solid rgba(99, 102, 241, 0.3)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sign in to start predicting!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You&apos;ll get 10 free points upon signup.</p>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '2rem' 
      }}>
        {markets.map((market) => (
          <MarketCard 
            key={market.id} 
            market={market} 
            userPoints={profile ? Number(profile.points) : 0} 
          />
        ))}

        {markets.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
            No open markets currently available. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
