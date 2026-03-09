// ─── Firebase Config (hardcoded) ────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB_yP3b-yBPELQpeLj1eMMWbxkPIhlY9JE",
  authDomain: "fk-web-1a97e.firebaseapp.com",
  projectId: "fk-web-1a97e",
  storageBucket: "fk-web-1a97e.firebasestorage.app",
  messagingSenderId: "635823075098",
  appId: "1:635823075098:web:05413da3ea843c27f046a3"
};

// ─── APP Object ─────────────────────────────────────────────────────────────
const APP = {
  _db: null,
  _initDone: false,

  async initFirebase() {
    if (this._db && this._initDone) return this._db;
    this._initDone = true;
    
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded');
      return null;
    }
    
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      this._db = firebase.firestore();
      
      // Enable offline persistence
      this._db.enablePersistence({ synchronizeTabs: true })
        .catch(e => console.log('Persistence error:', e));
        
      console.log('Firebase connected successfully');
      return this._db;
    } catch(e) {
      console.error('Firebase init error:', e);
      this._db = null;
      return null;
    }
  },

  async _get(key) {
    const db = await this.initFirebase();
    if (!db) {
      // Fallback to localStorage
      const v = localStorage.getItem('fk_' + key);
      return v ? JSON.parse(v) : null;
    }
    try {
      const doc = await db.collection('store').doc(key).get();
      if (doc.exists) {
        // Update local cache
        localStorage.setItem('fk_' + key, JSON.stringify(doc.data().value));
        return doc.data().value;
      }
    } catch(e) {
      console.error('Firestore get error:', e);
    }
    // Fallback
    const v = localStorage.getItem('fk_' + key);
    return v ? JSON.parse(v) : null;
  },

  async _set(key, value) {
    const db = await this.initFirebase();
    // Always save to localStorage as backup
    localStorage.setItem('fk_' + key, JSON.stringify(value));
    
    if (!db) {
      console.log('Saved to localStorage only (Firebase not connected)');
      return { localSaved: true, remoteSaved: false, reason: 'firebase_not_connected' };
    }
    
    try {
      await db.collection('store').doc(key).set({ value });
      console.log('Saved to Firebase + localStorage');
      return { localSaved: true, remoteSaved: true };
    } catch(e) {
      console.error('Firestore set error:', e);
      return { localSaved: true, remoteSaved: false, reason: e && e.message ? e.message : String(e) };
    }
  },

  _local(key) {
    try { 
      const v = localStorage.getItem('fk_' + key); 
      return v ? JSON.parse(v) : null; 
    } catch(e) { return null; }
  },

  // ── Products ──────────────────────────────────────────────────────────────
  async getProductsAsync() {
    const remote = await this._get('products');
    if (remote) return remote;
    return this._local('products') || [];
  },

  getProducts() {
    return this._local('products') || [];
  },

  async saveProducts(products) {
    return await this._set('products', products);
  },

  // ── UPI ───────────────────────────────────────────────────────────────────
  async getUpiAsync() {
    const remote = await this._get('upi');
    if (remote) return remote;
    return this._local('upi') || { upiId: '', name: 'Store', note: 'Order Payment' };
  },

  getUpi() {
    return this._local('upi') || { upiId: '', name: 'Store', note: 'Order Payment' };
  },

  async saveUpi(config) {
    return await this._set('upi', config);
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  async getBannersAsync() {
    const db = await this.initFirebase();
    if (!db) return this._local('banners') || [];

    try {
      const snap = await db.collection('store_banners').orderBy('idx').get();
      if (!snap.empty) {
        const list = snap.docs
          .map(d => d.data().value)
          .filter(v => typeof v === 'string' && v.trim());
        localStorage.setItem('fk_banners', JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.error('Firestore get banners error:', e);
    }

    const legacy = await this._get('banners');
    if (legacy && Array.isArray(legacy) && legacy.length) return legacy;
    return this._local('banners') || [];
  },

  getBanners() {
    return this._local('banners') || [];
  },

  async saveBanners(banners) {
    const list = (banners || []).filter(v => typeof v === 'string' && v.trim());
    localStorage.setItem('fk_banners', JSON.stringify(list));

    const db = await this.initFirebase();
    if (!db) {
      return { localSaved: true, remoteSaved: false, reason: 'firebase_not_connected' };
    }

    try {
      const col = db.collection('store_banners');
      const old = await col.get();
      const batch = db.batch();

      old.forEach(doc => batch.delete(doc.ref));
      list.forEach((value, idx) => {
        const ref = col.doc('b_' + String(idx).padStart(3, '0'));
        batch.set(ref, { idx, value, updatedAt: Date.now() });
      });

      await batch.commit();
      await db.collection('store').doc('banners').delete().catch(() => {});
      return { localSaved: true, remoteSaved: true, count: list.length };
    } catch (e) {
      console.error('Firestore save banners error:', e);
      return { localSaved: true, remoteSaved: false, reason: e && e.message ? e.message : String(e) };
    }
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  getProductById(id) { return this.getProducts().find(p => p.id === id) || null; },
  async getProductByIdAsync(id) { const all = await this.getProductsAsync(); return all.find(p => p.id === id) || null; },
  getOffPercent(price, mrp) { return (mrp > price) ? Math.round(((mrp - price) / mrp) * 100) : 0; },
  generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
};

