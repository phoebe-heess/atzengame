import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import atzengoldLogo from '../assets/atzengold-logo.png';
import BurgerMenu from '../components/BurgerMenu';
import { pointsService } from '../services/pointsService';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import fourGif from '../assets/4.gif';
import goldbarPng from '../assets/goldbar.png';

interface ScoreboardEntry {
  userId: string;
  points: number;
  pendingPoints?: number;
  totalPoints?: number;
  walletAddress?: string;
}

interface ScoreboardProps {
  atzencoins: number;
}

const GREEN = '#03855c';
const RED = '#d92a2a';
const BG_COLOR = '#EDD1B2';

export default function Scoreboard({ atzencoins }: ScoreboardProps) {
  const navigate = useNavigate();
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const handleShowLoginRegister = () => {
    // Handle login/register display
    console.log('Show login/register');
  };

  const fetchScoreboard = async () => {
    try {
      setLoading(true);
      // For demo, we'll use the test user
      const testUser = 'test@example.com';
      
      // Get user points
      const points = await pointsService.getCurrentPoints(testUser);
      
      // Get wallet address
      const walletResponse = await fetch(`http://localhost:3000/api/user-wallet/${testUser}`);
      const walletData = await walletResponse.json();
      
      // Get detailed points info
      const detailedResponse = await fetch(`http://localhost:3000/api/user-points/${testUser}`);
      const detailedData = await detailedResponse.json();
      
      const entry: ScoreboardEntry = {
        userId: testUser,
        points: detailedData.points || points,
        pendingPoints: detailedData.pendingPoints || 0,
        totalPoints: detailedData.totalPoints || points,
        walletAddress: walletData.walletAddress
      };
      
      setScoreboard([entry]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      setError('Failed to load scoreboard');
    } finally {
      setLoading(false);
    }
  };

  const copyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout title="PROFIL" onClose={() => navigate('/')} hideCloseButton={true}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: GREEN, 
          fontFamily: 'Montserrat, monospace', 
          fontWeight: 700, 
          fontSize: 24 
        }}>
          Loading...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="PROFIL" onClose={() => navigate('/')} hideCloseButton={true}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: GREEN, 
          fontFamily: 'Montserrat, monospace', 
          fontWeight: 700, 
          fontSize: 24 
        }}>
          {error}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="PROFIL" onClose={() => navigate('/')} hideCloseButton={true}>
      <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', paddingBottom: 100 }}>
        {/* Atzencoins Card */}
        <div style={{
          width: '100%',
          maxWidth: 340,
          margin: '0 auto 28px auto',
          background: BG_COLOR,
          borderRadius: 16,
          boxShadow: '0 2px 8px #0001',
          padding: '24px 0 18px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'monospace',
        }}>
          <div style={{ color: GREEN, fontWeight: 700, fontSize: 22, marginBottom: 10, letterSpacing: 1 }}>Atzencoins</div>
          <div style={{ background: GREEN, color: BG_COLOR, fontWeight: 700, fontSize: 28, borderRadius: 18, padding: '8px 18px', minWidth: 120, height: 56, marginBottom: 4, boxShadow: '0 2px 8px #0001', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{atzencoins}</div>
        </div>
        
        {/* Collectibles Card */}
        <div style={{
          width: '100%',
          maxWidth: 340,
          margin: '0 auto 28px auto',
          background: BG_COLOR,
          borderRadius: 16,
          boxShadow: '0 2px 8px #0001',
          padding: '24px 0 18px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'monospace',
        }}>
          <div style={{ color: GREEN, fontWeight: 700, fontSize: 22, marginBottom: 18, letterSpacing: 1 }}>Sammelobjekte</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: 'relative', width: 56, height: 72, filter: 'grayscale(1)', opacity: 0.5, background: BG_COLOR, borderRadius: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <img src={fourGif} alt="Collectible" style={{ width: 48, height: 64, objectFit: 'contain', borderRadius: 6, marginBottom: 4 }} />
                <span style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', color: RED, fontWeight: 900, fontSize: 18, letterSpacing: 2, textShadow: '0 1px 4px #fff', fontFamily: 'monospace' }}>SOON</span>
              </div>
            ))}
          </div>
        </div>

        {/* Win Real Gold Card */}
        <div style={{
          width: '100%',
          maxWidth: 340,
          margin: '0 auto 28px auto',
          background: BG_COLOR,
          borderRadius: 16,
          boxShadow: '0 2px 8px #0001',
          padding: '24px 0 18px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'monospace',
        }}>
          <div style={{ color: GREEN, fontWeight: 700, fontSize: 22, marginBottom: 18, letterSpacing: 1 }}>Echtes Gold gewinnen</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 56, height: 72, filter: 'grayscale(1)', opacity: 0.5, background: BG_COLOR, borderRadius: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <img src={goldbarPng} alt="Goldbarren" style={{ width: 48, height: 32, objectFit: 'contain', borderRadius: 6, marginBottom: 4 }} />
              <span style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', color: RED, fontWeight: 900, fontSize: 18, letterSpacing: 2, textShadow: '0 1px 4px #fff', fontFamily: 'monospace' }}>SOON</span>
            </div>
          </div>
        </div>
        
        {/* User ID Section - At Bottom */}
        {scoreboard.map((entry, index) => (
          entry.walletAddress && (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: BG_COLOR,
                borderRadius: 16,
                boxShadow: '0 2px 8px #0001',
                padding: '16px',
                margin: '20px auto 0 auto',
                maxWidth: 340
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: GREEN, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', opacity: 0.6 }}>Your ID:</span>
                <code style={{ 
                  fontSize: 12, 
                  background: BG_COLOR, 
                  padding: '6px 12px', 
                  borderRadius: 8, 
                  border: `2px solid ${GREEN}`, 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  color: GREEN,
                  fontWeight: 100,
                  opacity: 0.6
                }}>
                  {entry.walletAddress}
                </code>
                <button
                  onClick={() => copyWalletAddress(entry.walletAddress!)}
                  style={{
                    background: GREEN,
                    color: BG_COLOR,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    opacity: 0.6
                  }}
                >
                  {copiedAddress === entry.walletAddress ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )
        ))}

      </div>
    </PageLayout>
  );
} 