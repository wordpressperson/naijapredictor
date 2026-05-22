"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Market {
  id: string;
  question: string;
  status: string;
  total_yes: number;
  total_no: number;
  category?: string;
  expiry_date?: string;
}

export default function MarketCard({ market, userPoints }: { market: Market; userPoints: number }) {
  const [betAmount, setBetAmount] = useState('');
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalPool = Number(market.total_yes) + Number(market.total_no);
  const yesOdds = totalPool === 0 ? 50 : (Number(market.total_yes) / totalPool) * 100;
  const noOdds = totalPool === 0 ? 50 : (Number(market.total_no) / totalPool) * 100;

  const handleBet = async () => {
    if (!choice || !betAmount || isNaN(Number(betAmount)) || Number(betAmount) <= 0) {
      setError('Please select an outcome and enter a valid amount.');
      return;
    }
    if (Number(betAmount) > userPoints) {
      setError('Insufficient points.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { error } = await supabase.rpc('place_bet', {
        p_market_id: market.id,
        p_amount: Number(betAmount),
        p_choice: choice
      });

      if (error) throw error;
      
      setSuccess('Bet placed successfully!');
      setBetAmount('');
      setChoice(null);
      // Wait a moment before reloading to show success message
      setTimeout(() => window.location.reload(), 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = Boolean(market.expiry_date && new Date() > new Date(market.expiry_date));

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ 
            background: 'rgba(99, 102, 241, 0.15)', 
            color: 'var(--accent-primary)',
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            {market.category || 'Uncategorized'}
          </span>
          {market.expiry_date && (
            <span style={{ fontSize: '0.75rem', color: isExpired ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
              {isExpired ? 'Expired' : `Closes: ${new Date(market.expiry_date).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>{market.question}</h3>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--accent-success)' }}>Yes {yesOdds.toFixed(1)}%</span>
          <span style={{ color: 'var(--accent-danger)' }}>No {noOdds.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-yes" style={{ width: `${yesOdds}%` }}></div>
          <div className="progress-no" style={{ width: `${noOdds}%` }}></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Total Pool: {totalPool.toFixed(2)} Points
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${choice === 'yes' ? 'btn-success' : ''}`} 
            style={{ flex: 1, border: choice !== 'yes' ? '1px solid var(--border-color)' : '' }}
            onClick={() => setChoice('yes')}
          >
            Yes
          </button>
          <button 
            className={`btn ${choice === 'no' ? 'btn-danger' : ''}`} 
            style={{ flex: 1, border: choice !== 'no' ? '1px solid var(--border-color)' : '' }}
            onClick={() => setChoice('no')}
          >
            No
          </button>
        </div>
        
        <div>
          <input 
            type="number" 
            className="input-field" 
            placeholder="Amount to bet..." 
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
        </div>
        
        {error && <div style={{ color: 'var(--accent-danger)', fontSize: '0.875rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--accent-success)', fontSize: '0.875rem' }}>{success}</div>}
        
        <button 
          className="btn btn-primary" 
          onClick={handleBet}
          disabled={loading || !choice || !betAmount || isExpired}
          style={{ width: '100%' }}
        >
          {isExpired ? 'Market Expired' : (loading ? 'Processing...' : 'Place Bet')}
        </button>
      </div>
    </div>
  );
}
