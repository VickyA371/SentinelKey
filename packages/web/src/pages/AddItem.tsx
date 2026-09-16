import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { COLLECTIONS, CATEGORIES } from '@sentinelkey/shared';
import { db } from '../config/firebase';
import { encryptField, decryptField } from '../vault/vault';
import type { RootState } from '../store';
import MasterPasswordModal from '../components/MasterPasswordModal';

export default function AddItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id;
  const passedItem = location.state?.item;
  
  const uid = useSelector((s: RootState) => s.auth.uid);
  
  const [itemName, setItemName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>('general');
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(isEditing);
  const [pendingAction, setPendingAction] = useState<'delete' | 'save' | null>(null);

  useEffect(() => {
    if (isEditing && passedItem) {
      setItemName(passedItem.itemName);
      setCategory(passedItem.category?.toLowerCase() || 'general');
      setUsername(passedItem.username || '');
      setNotes(passedItem.notes || '');
      
      // Only password is encrypted in the mobile app schema
      if (passedItem.passwordEnc) {
        decryptField(passedItem.passwordEnc)
          .then(decPass => {
            setPassword(decPass);
            setDecrypting(false);
          })
          .catch(err => {
            console.error(err);
            toast.error('Failed to decrypt password');
            navigate('/');
          });
      } else {
        setDecrypting(false);
      }
    }
  }, [isEditing, passedItem, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !username || !password || !uid) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (isEditing) {
      setPendingAction('save');
      return;
    }
    
    await executeSave();
  };

  const executeSave = async () => {
    setPendingAction(null);
    setLoading(true);
    try {
      // Only encrypt password to match mobile app schema
      const encPass = await encryptField(password);
      
      const docRef = isEditing 
        ? doc(db, COLLECTIONS.PASSWORDS, id!)
        : doc(collection(db, COLLECTIONS.PASSWORDS));
        
      await setDoc(docRef, {
        userId: uid,
        title: itemName, // Mobile uses 'title'
        username: username,
        password: encPass,
        category: category,
        notes: notes,
      }, { merge: true });
      
      toast.success(isEditing ? 'Item updated' : 'Item added to vault');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save item. Make sure vault is unlocked.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePromptDelete = () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setPendingAction('delete');
  };
  
  const executeDelete = async () => {
    if (!uid || !id) return;
    setPendingAction(null);
    
    try {
      await deleteDoc(doc(db, COLLECTIONS.PASSWORDS, id));
      toast.success('Item deleted');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const handleModalSuccess = () => {
    if (pendingAction === 'delete') {
      executeDelete();
    } else if (pendingAction === 'save') {
      executeSave();
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < 16; i++) res += chars[Math.floor(Math.random() * chars.length)];
    setPassword(res);
  };

  if (decrypting) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="page-scroll fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        {isEditing && (
          <button type="button" onClick={handlePromptDelete} style={{ color: 'var(--c-red)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        )}
      </div>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--c-charcoal)', marginBottom: 24 }}>
        {isEditing ? 'Edit Item' : 'Add Item'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ... */}
        <div className="input-group">
          <label className="input-label">Item Name</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input className="input-field" type="text" placeholder="e.g. Google Account" value={itemName} onChange={e => setItemName(e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Username / Email</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input className="input-field" type="text" placeholder="name@example.com" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Password</label>
            <button type="button" onClick={generatePassword} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-deep-teal)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Generate</button>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </span>
            <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
              </svg>
            </button>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Category</label>
          <div className="category-selector">
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <div 
                key={cat} 
                className={`category-option ${category === cat.toLowerCase() ? 'selected' : ''}`}
                onClick={() => setCategory(cat.toLowerCase())}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Notes (Optional)</label>
          <div className="input-wrapper" style={{ height: 'auto', padding: '12px', alignItems: 'flex-start' }}>
            <textarea 
              className="input-field" 
              placeholder="Any additional info..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </form>

      <MasterPasswordModal
        isOpen={pendingAction !== null}
        message={`Enter your master password to ${pendingAction} this item.`}
        onSuccess={handleModalSuccess}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
