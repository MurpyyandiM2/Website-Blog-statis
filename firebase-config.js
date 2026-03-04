/**
 * FIREBASE CONFIGURATION - COMPAT MODE (v10.7.1)
 * 
 * LANGKAH SETUP:
 * 1. Buka Firebase Console: https://console.firebase.google.com/
 * 2. Pilih project "website-blog-statis"
 * 3. Klik ⚙️ Settings > Project settings > General
 * 4. Scroll ke "Your apps" > Klik ikon Web </>
 * 5. Copy config dan paste di bawah ini
 */

// ⚠️ KONFIGURASI FIREBASE - GANTI DENGAN NILAI ASLI ANDA
const firebaseConfig = {
    apiKey: "AIzaSyDZkXgWnKmYw-CIhtaxNA_blTNOyrcFlE4",
    authDomain: "website-blog-statis.firebaseapp.com",
    projectId: "website-blog-statis",
    storageBucket: "website-blog-statis.firebasestorage.app",
    messagingSenderId: "534397798684",
    appId: "1:534397798684:web:69be7a86aa3f03f8d952d9",
    measurementId: "G-HKLPJYP2GB"
};

// ============================================
// INITIALIZE FIREBASE
// ============================================
let db, storage, auth, app;

try {
    // Cek apakah Firebase sudah di-inisialisasi
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    } else {
        app = firebase.app();
        console.log('✅ Using existing Firebase app');
    }
    
    // Inisialisasi services
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();
    
    // Konfigurasi Firestore
    db.settings({
        ignoreUndefinedProperties: true,
        timestampBehavior: 'estimate'
    });
    
    console.log('✅ Firebase services ready:');
    console.log('   - Firestore: Ready');
    console.log('   - Storage: Ready');
    console.log('   - Auth: Ready');
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // Tampilkan error yang lebih detail
    if (error.code === 'auth/invalid-api-key') {
        console.error('⚠️ API Key tidak valid. Periksa firebase-config.js');
    } else if (error.code === 'auth/project-not-found') {
        console.error('⚠️ Project tidak ditemukan. Periksa projectId');
    }
}

// ============================================
// COLLECTION NAMES (KONSTANTA)
// ============================================
const COLLECTIONS = {
    TASKS: 'tasks',
    CERTIFICATES: 'certificates',
    CV: 'cv',
    SETTINGS: 'settings',
    CONTACTS: 'contacts'
};

// ============================================
// FIREBASE HELPER FUNCTIONS
// ============================================
const FirebaseHelper = {
    // Cek koneksi internet
    isOnline: () => navigator.onLine,
    
    // Enable offline persistence
    enableOffline: async () => {
        try {
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('📦 Offline persistence enabled');
            return true;
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open - persistence only in first tab');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser tidak support offline persistence');
            } else {
                console.error('❌ Persistence error:', err);
            }
            return false;
        }
    },

    // Helper untuk server timestamp
    timestamp: () => firebase.firestore.FieldValue.serverTimestamp(),

    // Helper untuk increment/decrement
    increment: (value) => firebase.firestore.FieldValue.increment(value),

    // Upload file ke Firebase Storage
    uploadFile: async (file, folder = 'uploads') => {
        if (!file) {
            throw new Error('No file provided');
        }
        
        // Validasi ukuran file (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error(`File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`);
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filePath = `${folder}/${timestamp}_${sanitizedName}`;
        
        const storageRef = storage.ref(filePath);
        
        // Upload dengan metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                uploadedAt: new Date().toISOString(),
                originalName: file.name,
                uploadedBy: 'portfolio-app'
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return {
            name: file.name,
            url: downloadURL,
            path: snapshot.ref.fullPath,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
        };
    },

    // Delete file dari Storage
    deleteFile: async (filePath) => {
        if (!filePath) return true;
        
        try {
            const fileRef = storage.ref(filePath);
            await fileRef.delete();
            console.log('🗑️ File deleted:', filePath);
            return true;
        } catch (error) {
            // Ignore jika file tidak ditemukan (sudah terhapus)
            if (error.code === 'storage/object-not-found') {
                console.log('ℹ️ File already deleted:', filePath);
                return true;
            }
            console.error('❌ Delete file error:', error);
            throw error;
        }
    },

    // Format timestamp dari Firestore ke tanggal Indonesia
    formatDate: (timestamp) => {
        if (!timestamp) return '-';
        
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
        
        return timestamp;
    },

    // Format datetime lengkap
    formatDateTime: (timestamp) => {
        if (!timestamp) return '-';
        
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return timestamp;
    }
};

// Export untuk debugging
console.log('🔧 FirebaseHelper loaded');
console.log('📚 Collections:', COLLECTIONS);
console.log('🌐 Online status:', FirebaseHelper.isOnline());
