import React from 'react';
import PageLayout from '../components/PageLayout';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  return (
    <PageLayout title="LOGIN" onClose={() => navigate('/')}>
      <div style={{ fontSize: 18, color: '#03855c', marginBottom: 12, maxWidth: 600, padding: '0 20px', textAlign: 'center', fontFamily: 'monospace' }}>
        Login Page
      </div>
    </PageLayout>
  );
} 