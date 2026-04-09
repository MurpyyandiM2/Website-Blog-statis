/**
 * FIREBASE CONFIGURATION & HELPER
 * Compatible with Firebase SDK v10.7.1 (Compat Mode)
 * 
 * PENTING: GANTI firebaseConfig dengan kredensial dari Firebase Console Anda!
 */

// ============================================
// 1. FIREBASE PROJECT CONFIG
// ============================================
const firebaseConfig = {
    apiKey: "GANTI_DENGAN_API_KEY_ANDA",
    authDomain: "GANTI_PROJECT_ID.firebaseapp.com",
    projectId: "GANTI_PROJECT_ID_ANDA",
    storageBucket: "GANTI_PROJECT_ID.appspot.com",
    messagingSenderId: "GANTI_SENDER_ID",
    appId: "GANTI_APP_ID",
    measurementId: "G_MEASUREMENT_ID" // Opsional
};

// ============================================
// 2. INITIALIZE FIREBASE (COMPAT MODE)
// ============================================
firebase.initializeApp(firebaseConfig);

// ============================================
// 3. GLOBAL INSTANCES (DIANGKAT OLEH script.js)
// ============================================
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// ============================================
// 4. COLLECTION CONSTANTS
// ============================================
const COLLECTIONS = {
    TASKS: 'tasks',
    CERTIFICATES: 'certificates',
    CV: 'cv'
};

// ============================================
// 5. FIREBASE HELPER UTILITIES
// ============================================
const FirebaseHelper = {
    // Enable offline persistence (sync antar tab)
    enableOffline: async () => {
        try {
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('✅ Firestore offline persistence enabled');
            return true;
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Persistence only works in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser does not support offline persistence.');
            }
            return false;
        }
    },

    // Server timestamp helper
    timestamp: () => firebase.firestore.FieldValue.serverTimestamp(),

    // Check connection status
    isOnline: () => navigator.onLine,

    // Universal file upload handler (PDF, PPT, VIDEO, IMG, DLL)
    uploadFile: async (file, folder) => {
        if (!file) return null;

        // Generate unique filename agar tidak tertimpa
        const ext = file.name.split('.').pop();
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const storageRef = storage.ref(`${folder}/${uniqueName}`);

        // Metadata untuk tracking
        const metadata = {
            contentType: file.type,
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString()
            }
        };

        // Upload file
        await storageRef.put(file, metadata);
        const downloadURL = await storageRef.getDownloadURL();

        return {
            url: downloadURL,
            path: storageRef.fullPath,
            name: file.name,
            type: file.type,
            size: file.size
        };
    },

    // Delete file dari Firebase Storage
    deleteFile: async (filePath) => {
        if (!filePath) return;
        try {
            await storage.ref(filePath).delete();
            console.log(`✅ Deleted storage file: ${filePath}`);
        } catch (error) {
            // Abaikan error "file not found" saat cleanup
            if (error.code !== 'storage/object-not-found') {
                console.error(`❌ Gagal menghapus ${filePath}:`, error.message);
            }
        }
    }
};

// ============================================
// 6. EXPORT KE WINDOW (GLOBAL SCOPE)
// ============================================
window.FirebaseHelper = FirebaseHelper;
window.COLLECTIONS = COLLECTIONS;
window.db = db;
window.storage = storage;
window.auth = auth;
