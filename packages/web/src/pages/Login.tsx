import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { COLLECTIONS } from '@sentinelkey/shared';
import { auth, db } from '../config/firebase';
import { setData } from '../store/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const { uid, emailVerified } = cred.user;
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as any;
        dispatch(setData({
          uid: data.uid,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber || '',
          createdAt: data.createdAt,
          isAccountVerified: emailVerified,
        }));
        if (emailVerified) toast.success('Logged in successfully!');
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.');
      } else if (code === 'auth/invalid-email') {
        toast.error('That email address is invalid!');
      } else {
        toast.error('An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="auth-header">
        <div className="shield-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1>Welcome Back</h1>
        <p>Access your encrypted vault securely</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input className="input-field" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <span className="input-error">{errors.email || ''}</span>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Password</label>
            <button type="button" onClick={() => navigate('/forgot-password')} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0E5F73', cursor: 'pointer', background: 'none', border: 'none' }}>
              Forgot Password?
            </button>
          </div>
          <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPw ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
              </svg>
            </button>
          </div>
          <span className="input-error">{errors.password || ''}</span>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Logging in...</> : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: '#8CA3AD' }}>
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')} style={{ color: '#0E5F73', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>
          Create Account
        </button>
      </p>
    </div>
  );
}
