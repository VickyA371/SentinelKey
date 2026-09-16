import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../config/firebase';
import { lockVault } from '../vault/vault';
import { refreshVaultStatus } from '../store/slices/vaultSlice';
import type { RootState, AppDispatch } from '../store';

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { fullName, email } = useSelector((s: RootState) => s.auth);
  const uid = useSelector((s: RootState) => s.auth.uid);

  const handleLockVault = () => {
    lockVault();
    if (uid) dispatch(refreshVaultStatus(uid));
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <div className="page-scroll fade-in">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
      </div>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--c-charcoal)', marginBottom: 24 }}>
        Settings
      </h1>

      <div className="profile-section">
        <div className="profile-avatar">
          {fullName ? fullName.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="profile-name">{fullName || 'User'}</div>
        <div className="profile-email">{email}</div>
      </div>

      <div className="settings-section-header">Security</div>
      
      <div className="settings-item" onClick={handleLockVault}>
        <div className="settings-item-icon" style={{ background: 'rgba(229, 72, 77, 0.1)', color: 'var(--c-red)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div className="settings-item-content">
          <div className="settings-item-title">Lock Vault</div>
          <div className="settings-item-subtitle" style={{ color: 'var(--c-muted-blue-gray)' }}>Require master password to view items</div>
        </div>
      </div>

      <div className="settings-section-header" style={{ marginTop: 24 }}>Account</div>
      
      <div className="settings-item" onClick={handleSignOut}>
        <div className="settings-item-icon" style={{ background: 'var(--c-ice-gray)', color: 'var(--c-charcoal)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <div className="settings-item-content">
          <div className="settings-item-title">Sign Out</div>
          <div className="settings-item-subtitle" style={{ color: 'var(--c-muted-blue-gray)' }}>End your session</div>
        </div>
      </div>
      
      <div className="meta-footer">
        <div className="version">SentinelKey Web v0.0.1</div>
        <div className="encrypted">End-to-End Encrypted</div>
      </div>
    </div>
  );
}
