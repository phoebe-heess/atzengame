import React from 'react';

export default function Datenschutz() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#EDD1B2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      padding: '0 0 40px 0',
      overflow: 'visible',
    }}>
      {/* Green handle */}
      <div style={{ width: 80, height: 6, background: '#03855c', borderRadius: 3, margin: '32px auto 24px auto', zIndex: 1 }} />
      <h1 style={{ color: '#03855c', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24, zIndex: 1 }}>
        DATENSCHUTZ
      </h1>
      <div style={{ fontSize: 16, color: '#03855c', marginBottom: 12, maxWidth: 320, padding: '0 20px', textAlign: 'center', lineHeight: 1.6, zIndex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          Datenschutzerklärung
        </div>
        <div>Deine Daten werden ausschließlich zur Bereitstellung der App verwendet und nicht an Dritte weitergegeben.</div>
        <div>Mit der Nutzung der App stimmst du der Speicherung deiner Daten gemäß unserer Datenschutzerklärung zu.</div>
      </div>
    </div>
  );
} 