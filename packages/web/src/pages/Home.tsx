import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, CATEGORIES, getCategoryIcon, getDynamicColor } from '@sentinelkey/shared';
import { decryptField } from '../vault/vault';
import type { RootState } from '../store';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const uid = useSelector((s: RootState) => s.auth.uid);
  
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    
    const q = query(
      collection(db, COLLECTIONS.PASSWORDS),
      where('userId', '==', uid)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const decryptedItems = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            itemName: data.title || data.itemName, // Mobile uses 'title'
            category: data.category || 'General',
            username: data.username,
            passwordEnc: data.password,
            notes: data.notes
          };
        });
        setItems(decryptedItems);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse vault items');
      } finally {
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, [uid]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || (item.category && item.category.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-scroll fade-in" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px', background: 'var(--c-white)', borderBottom: '1px solid var(--c-ice-gray)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--c-charcoal)' }}>My Vault</h1>
          <button onClick={() => navigate('/settings')} style={{ padding: 8, background: 'var(--c-off-white)', borderRadius: '50%', color: 'var(--c-deep-teal)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
        
        <div className="search-bar">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--c-muted-blue-gray)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        
        <div className="category-tabs" style={{ paddingBottom: 0, marginTop: 16 }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: 20 }}>
        {loading ? (
          <div className="loading-container" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>No passwords found</h3>
            <p>Tap the + button below to add your first password to the vault.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="vault-item card-clickable" 
                style={{ background: 'var(--c-white)', border: '1px solid var(--c-ice-gray)' }}
                onClick={() => navigate(`/edit/${item.id}`, { state: { item } })}
              >
                <div className="vault-item-icon" style={{ backgroundColor: getDynamicColor(item.id) }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Render different icons based on category. Fallback to key */}
                    {item.category === 'Finance' ? (
                      <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>
                    ) : item.category === 'Work' ? (
                      <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
                    ) : (
                      <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>
                    )}
                  </svg>
                </div>
                <div className="vault-item-info">
                  <div className="vault-item-title">{item.itemName}</div>
                  <div className="vault-item-category" style={{ textTransform: 'capitalize' }}>
                    {item.category === 'other' ? 'Other' : item.category}
                  </div>
                </div>
                <svg className="vault-item-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => navigate('/add')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
}
