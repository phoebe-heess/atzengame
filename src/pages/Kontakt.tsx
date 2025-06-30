import React from 'react';

export default function Kontakt() {
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
        KONTAKT
      </h1>
      <div style={{ fontSize: 16, color: '#03855c', marginBottom: 12, maxWidth: 320, padding: '0 20px', textAlign: 'center', lineHeight: 1.6, zIndex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          Atzengold
        </div>
        <div>Atzenhofer Str. 76</div>
        <div>90768 Fürth</div>
        <div>Deutschland</div>
        <div style={{ marginTop: 12 }}>Telefon: +49 (0) 176 6 2345 740</div>
        <div>E-Mail: gp@atzengold.net</div>
      </div>
    </div>
  );
} 