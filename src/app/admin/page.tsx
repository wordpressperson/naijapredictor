"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [markets, setMarkets] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [category, setCategory] = useState("Sports");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdmin = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      router.push('/');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!profileData?.is_admin) {
      router.push('/');
      return;
    }

    setProfile(profileData);
    fetchMarkets();
  };

  const fetchMarkets = async () => {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMarkets(data);
    setLoading(false);
  };

  const createMarket = async () => {
    if (!newQuestion || !expiryDate) {
      alert("Please enter a question and an expiry date.");
      return;
    }
    setActionLoading(true);
    
    // Ensure expiryDate is a valid ISO string
    const expiryISO = new Date(expiryDate).toISOString();

    const { error } = await supabase.from('markets').insert([
      { question: newQuestion, category, expiry_date: expiryISO }
    ]);
    
    if (!error) {
      setNewQuestion("");
      setExpiryDate("");
      fetchMarkets();
    } else {
      alert("Error creating market: " + error.message);
    }
    
    setActionLoading(false);
  };

  const resolveMarket = async (marketId: string, outcome: 'yes' | 'no') => {
    if (!confirm(`Are you sure you want to resolve this market as ${outcome.toUpperCase()}?`)) return;
    
    setActionLoading(true);
    const { error } = await supabase.rpc('resolve_market', {
      p_market_id: marketId,
      p_outcome: outcome
    });

    if (error) {
      alert("Error resolving market: " + error.message);
    } else {
      fetchMarkets();
    }
    setActionLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading admin portal...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Create New Market</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Question</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="E.g., Will Nigeria win the AFCON?" 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Category</label>
              <select 
                className="input-field" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Sports">Sports</option>
                <option value="Music">Music</option>
                <option value="Politics">Politics</option>
                <option value="Films">Films</option>
                <option value="Crypto">Crypto</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Expiry Date</label>
              <input 
                type="datetime-local" 
                className="input-field" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={createMarket}
            disabled={actionLoading || !newQuestion || !expiryDate}
            style={{ alignSelf: 'flex-start' }}
          >
            Create Market
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Manage Markets</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {markets.map(market => (
            <div key={market.id} style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '1rem', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{market.question}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '0.1rem 0.5rem', 
                    borderRadius: '4px',
                    marginRight: '0.5rem'
                  }}>{market.category || 'Uncategorized'}</span>
                  <span>Expires: {market.expiry_date ? new Date(market.expiry_date).toLocaleDateString() : 'No Expiry'}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Status: {market.status} | Yes: {market.total_yes} | No: {market.total_no}
                  {market.outcome && ` | Outcome: ${market.outcome.toUpperCase()}`}
                </div>
              </div>
              
              {market.status === 'open' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-success" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => resolveMarket(market.id, 'yes')}
                    disabled={actionLoading}
                  >
                    Resolve YES
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => resolveMarket(market.id, 'no')}
                    disabled={actionLoading}
                  >
                    Resolve NO
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {markets.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No markets found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
