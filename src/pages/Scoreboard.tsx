import React from 'react';
import PageLayout from '../components/PageLayout';
import fourGif from '../assets/4.gif';
import goldbarPng from '../assets/goldbar.png';
import { useNavigate } from 'react-router-dom';

const GREEN = '#03855c';
const ORANGE = '#d69229';
const RED = '#d92a2a';
const BG_COLOR = '#EDD1B2';

interface ScoreboardProps {
  atzencoins: number;
}

export default function Scoreboard({ atzencoins }: ScoreboardProps) {
  const navigate = useNavigate();
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
          margin: '0 auto 12px auto',
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
      </div>
    </PageLayout>
  );
} 