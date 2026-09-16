import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { unlockVault } from '../vault/vault';
import { refreshVaultStatus } from '../store/slices/vaultSlice';
import type { RootState, AppDispatch } from '../store';

export default function VaultUnlock() {
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((s: RootState) => s.auth.uid);
  const meta = useSelector((s: RootState) => s.vault.meta);
  
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !meta || !uid) return;
    
    setLoading(true);
    try {
      const success = await unlockVault(password, meta);
      if (success) {
        dispatch(refreshVaultStatus(uid));
      } else {
        toast.error('Incorrect master password');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="auth-header" style={{ paddingTop: 32 }}>
        <div className="shield-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1>Vault Locked</h1>
        <p>Enter your master password to unlock your vault.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input 
              className="input-field" 
              type={showPw ? 'text' : 'password'} 
              placeholder="Master Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              autoFocus
            />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !password}>
          {loading ? 'Unlocking...' : 'Unlock Vault'}
        </button>
      </form>
    </div>
  );
}
