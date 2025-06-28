import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

interface EmailLoginFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GREEN = '#03855c';
const BG_COLOR = '#EDD1B2';
const BEIGE = '#EDD1B2';

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: BG_COLOR, padding: 24, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320, maxWidth: 375, width: '100%' }}>
      <h2 style={{ color: BEIGE, marginBottom: 16, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700 }}>Anmelden</h2>
      
      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ 
          marginBottom: 12, 
          padding: 12, 
          borderRadius: 8, 
          border: '1px solid #ccc', 
          width: '100%',
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: 16
        }}
      />
      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ 
          marginBottom: 12, 
          padding: 12, 
          borderRadius: 8, 
          border: '1px solid #ccc', 
          width: '100%',
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: 16
        }}
      />
      {error && (
        <div style={{ 
          color: BEIGE, 
          marginBottom: 12,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: 14,
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      <button 
        type="submit" 
        disabled={loading} 
        style={{ 
          background: GREEN, 
          color: '#fff', 
          padding: '14px 24px', 
          borderRadius: 10, 
          border: 'none', 
          fontWeight: 600, 
          fontSize: 17, 
          width: '100%', 
          marginBottom: 8,
          fontFamily: 'Montserrat, Arial, sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Anmeldung...' : 'Anmelden'}
      </button>
      <button 
        type="button" 
        onClick={onCancel} 
        style={{ 
          background: 'none', 
          color: GREEN, 
          border: 'none', 
          marginTop: 8, 
          cursor: 'pointer',
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: 16,
          fontWeight: 600
        }}
      >
        Zurück
      </button>
    </form>
  );
};

export default EmailLoginForm; 