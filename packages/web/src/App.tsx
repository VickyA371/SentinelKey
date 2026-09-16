import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { COLLECTIONS } from '@sentinelkey/shared';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import type { RootState, AppDispatch } from './store';
import { setData, clearData } from './store/slices/authSlice';
import { refreshVaultStatus, resetVault } from './store/slices/vaultSlice';
import { clearSecuritySettings } from './store/slices/securitySlice';
import { lockVault, isVaultUnlocked } from './vault/vault';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VaultSetup from './pages/VaultSetup';
import VaultUnlock from './pages/VaultUnlock';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import Settings from './pages/Settings';

const AUTO_LOCK_AFTER_MS = 60_000;

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);
  const backgroundedAt = useRef<number | null>(null);

  const uid = useSelector((s: RootState) => s.auth.uid);
  const isAccountVerified = useSelector((s: RootState) => s.auth.isAccountVerified);
  const vaultStatus = useSelector((s: RootState) => s.vault.status);

  const isLoggedIn = !!uid && !!isAccountVerified;
  const needsVerification = !!uid && !isAccountVerified;

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as any;
            dispatch(setData({
              uid: data.uid,
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber || '',
              createdAt: data.createdAt,
              isAccountVerified: user.emailVerified,
            }));
          }
        } catch (error) {
          console.error('Auth state: error fetching user data:', error);
          dispatch(clearData());
        } finally {
          setInitializing(false);
        }
      } else {
        lockVault();
        dispatch(resetVault());
        dispatch(clearSecuritySettings());
        dispatch(clearData());
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, [dispatch]);

  // Refresh vault status when logged in
  useEffect(() => {
    if (isLoggedIn && uid) {
      dispatch(refreshVaultStatus(uid));
    }
  }, [isLoggedIn, uid, dispatch]);

  // Auto-lock on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (backgroundedAt.current === null) backgroundedAt.current = Date.now();
      } else {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since === null) return;
        const awayMs = Date.now() - since;
        if (awayMs >= AUTO_LOCK_AFTER_MS && isVaultUnlocked()) {
          lockVault();
          if (uid) dispatch(refreshVaultStatus(uid));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [uid, dispatch]);

  if (initializing) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      {isLoggedIn ? (
        // Vault gate
        vaultStatus === 'unknown' ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : vaultStatus === 'needsSetup' ? (
          <VaultSetup />
        ) : vaultStatus === 'locked' ? (
          <VaultUnlock />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/edit/:id" element={<AddItem />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )
      ) : needsVerification ? (
        <div className="page fade-in" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="auth-header" style={{ paddingTop: 0 }}>
            <div className="shield-icon" style={{ width: 56, height: 56, margin: '0 auto 16px', background: 'linear-gradient(135deg, #0E5F73, #4F7A87)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1>Verify Your Email</h1>
            <p style={{ marginTop: 8 }}>We've sent a verification link to your email. Please check your inbox and verify to continue.</p>
          </div>
          <button className="btn-secondary" style={{ maxWidth: 200 }} onClick={() => auth.signOut()}>
            Sign Out
          </button>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
