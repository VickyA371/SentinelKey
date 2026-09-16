import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createMasterPasswordSchema } from '@sentinelkey/shared';
import { createVault, saveVaultMeta } from '../vault/vaultStorage';
import { createVault as createCryptoVault } from '../vault/vault';
import { refreshVaultStatus } from '../store/slices/vaultSlice';
import type { RootState, AppDispatch } from '../store';

export default function VaultSetup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const uid = useSelector((s: RootState) => s.auth.uid);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!password) e.password = 'Master password is required';
    else if (password.length < 10) e.password = 'Master password must be at least 10 characters';
    
    if (password !== confirmPassword) e.confirm = 'Passwords must match';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !uid) return;
    
    setLoading(true);
    try {
      const meta = await createCryptoVault(password);
      await saveVaultMeta(uid, meta);
      dispatch(refreshVaultStatus(uid));
      toast.success('Vault created successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to setup vault. Please try again.');
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
        <h1>Setup Your Vault</h1>
        <p>Create a master password to encrypt your data. <strong style={{ color: '#E5484D' }}>Keep it safe! We cannot recover it.</strong></p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Master Password</label>
          <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input 
              className="input-field" 
              type={showPw ? 'text' : 'password'} 
              placeholder="At least 10 characters" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
              </svg>
            </button>
          </div>
          <span className="input-error">{errors.password || ''}</span>
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Master Password</label>
          <div className={`input-wrapper ${errors.confirm ? 'error' : ''}`}>
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input 
              className="input-field" 
              type={showPw ? 'text' : 'password'} 
              placeholder="Re-enter master password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
          </div>
          <span className="input-error">{errors.confirm || ''}</span>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Securing Vault...' : 'Create Vault'}
        </button>
      </form>
    </div>
  );
}
