import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";

interface EmailRegisterFormProps {
  atzencoins: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const BEIGE = '#EDD1B2';
const GREEN = '#03855c';
const BG_COLOR = '#EDD1B2';

const EmailRegisterForm: React.FC<EmailRegisterFormProps> = ({ atzencoins, onSuccess, onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setLoading(false);
      setSuccess("Registration successful! Please check your email to verify your account.");
      // Optionally, you can call onSuccess() after verification or keep the overlay open
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: BG_COLOR, padding: 24, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320, maxWidth: 375, width: '100%' }}>
      <h2 style={{ color: BEIGE, marginBottom: 16 }}>Create Account</h2>
      {success ? (
        <>
          <div style={{ color: BEIGE, fontWeight: 600, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Registrierung erfolgreich!</div>
          <button type="button" onClick={onSuccess} style={{ background: GREEN, color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 18, width: '100%', marginBottom: 8, marginTop: 8 }}>
            Schließen
          </button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
          />
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ background: GREEN, color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 18, width: '100%', marginBottom: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button type="button" onClick={onCancel} style={{ background: 'none', color: '#888', border: 'none', marginTop: 8, cursor: 'pointer' }}>
            Cancel
          </button>
        </>
      )}
    </form>
  );
};

export default EmailRegisterForm; 