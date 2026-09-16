import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { verifyMasterPassword } from '../vault/vault';
import type { RootState } from '../store';

interface Props {
  isOpen: boolean;
  message: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MasterPasswordModal({ isOpen, message, onSuccess, onCancel }: Props) {
  const meta = useSelector((s: RootState) => s.vault.meta);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta) return;
    
    setLoading(true);
    try {
      const isValid = await verifyMasterPassword(password, meta);
      if (isValid) {
        setPassword('');
        onSuccess();
      } else {
        toast.error('Incorrect master password');
      }
    } catch (err) {
      toast.error('An error occurred verifying password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'var(--c-white)', borderRadius: 16, padding: 24,
        width: '100%', maxWidth: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>Security Verification</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--c-muted-blue-gray)' }}>
          {message}
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            placeholder="Master Password"
            className="input-field"
            style={{ width: '100%', marginBottom: 16 }}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => { setPassword(''); onCancel(); }}
              style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--c-charcoal)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !password}
              style={{ width: 'auto', padding: '8px 20px', minHeight: 'auto' }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
