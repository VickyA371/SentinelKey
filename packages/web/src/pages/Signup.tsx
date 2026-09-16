import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { COLLECTIONS } from '@sentinelkey/shared';
import { auth, db } from '../config/firebase';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', terms: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | boolean) => setForm(p => ({ ...p, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) e.fullName = 'Full name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address';
    if (!form.phoneNumber || form.phoneNumber.length < 10) e.phoneNumber = 'Phone number must be at least 10 digits';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password.length > 15) e.password = 'Password must be at most 15 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords must match';
    if (!form.terms) e.terms = 'You must accept the terms and conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const { uid } = cred.user;
      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        uid,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        createdAt: new Date().toISOString(),
      });
      await sendEmailVerification(cred.user);
      toast.success('Account created! Please verify your email.');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') toast.error('This email is already registered.');
      else if (err?.code === 'auth/invalid-email') toast.error('Invalid email address.');
      else toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-scroll fade-in">
      <div className="auth-header" style={{ paddingTop: 24 }}>
        <div className="shield-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h1>Create Account</h1>
        <p>Start securing your digital life</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Full Name', field: 'fullName', type: 'text', placeholder: 'John Doe', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          { label: 'Email Address', field: 'email', type: 'email', placeholder: 'name@example.com', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
          { label: 'Phone Number', field: 'phoneNumber', type: 'tel', placeholder: '+1234567890', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
        ].map(({ label, field, type, placeholder, icon }) => (
          <div className="input-group" key={field}>
            <label className="input-label">{label}</label>
            <div className={`input-wrapper ${errors[field] ? 'error' : ''}`}>
              <span className="input-icon">{icon}</span>
              <input className="input-field" type={type} placeholder={placeholder} value={(form as any)[field]} onChange={e => update(field, e.target.value)} />
            </div>
            <span className="input-error">{errors[field] || ''}</span>
          </div>
        ))}

        {['password', 'confirmPassword'].map((field, i) => (
          <div className="input-group" key={field}>
            <label className="input-label">{i === 0 ? 'Password' : 'Confirm Password'}</label>
            <div className={`input-wrapper ${errors[field] ? 'error' : ''}`}>
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input className="input-field" type={showPw ? 'text' : 'password'} placeholder={i === 0 ? '••••••••••' : 'Re-enter password'} value={(form as any)[field]} onChange={e => update(field, e.target.value)} />
              {i === 0 && (
                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              )}
            </div>
            <span className="input-error">{errors[field] || ''}</span>
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
          <input type="checkbox" checked={form.terms} onChange={e => update('terms', e.target.checked)} style={{ marginTop: 3, accentColor: '#0E5F73', width: 18, height: 18 }} />
          <span style={{ fontSize: '0.8125rem', color: '#4F7A87', lineHeight: 1.4 }}>
            I agree to the <span style={{ color: '#0E5F73', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: '#0E5F73', fontWeight: 600 }}>Privacy Policy</span>
          </span>
        </label>
        {errors.terms && <span className="input-error">{errors.terms}</span>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: '#8CA3AD' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/')} style={{ color: '#0E5F73', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>Login</button>
      </p>
    </div>
  );
}
