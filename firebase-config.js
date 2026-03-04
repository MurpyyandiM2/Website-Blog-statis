/**
 * FIREBASE CONFIGURATION
 * 1. Daftar di https://firebase.google.com/
 * 2. Buat project baru
 * 3. Aktifkan Firestore Database dan Storage
 * 4. Copy config dari Project Settings > General > Your Apps
 */

const firebaseConfig = {
    apiKey: "GANTI_DENGAN_API_KEY_ANDA",
    authDomain: "portfolio-murpyyandi.firebaseapp.com",
    projectId: "portfolio-murpyyandi",
    storageBucket: "portfolio-murpyyandi.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Collection references
const COLLECTIONS = {
    TASKS: 'tasks',
    CERTIFICATES: 'certificates',
    CV: 'cv',
    SETTINGS: 'settings'
};

// Helper untuk cek koneksi
const FirebaseHelper = {
    isOnline: () => navigator.onLine,
    
    // Enable offline persistence
    enableOffline: async () => {
        try {
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('Offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.log('Multiple tabs open, persistence enabled in first tab only');
            } else if (err.code === 'unimplemented') {
                console.log('Browser does not support offline persistence');
            }
        }
    },

    // Timestamp helper
    timestamp: () => firebase.firestore.FieldValue.serverTimestamp(),

    // Upload file ke Storage
    uploadFile: async (file, path) => {
        const storageRef = storage.ref(`${path}/${Date.now()}_${file.name}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return {
            name: file.name,
            url: downloadURL,
            path: storageRef.fullPath,
            size: file.size,
            type: file.type
        };
    },

    // Delete file dari Storage
    deleteFile: async (path) => {
        if (!path) return;
        try {
            const storageRef = storage.ref(path);
            await storageRef.delete();
        } catch (error) {
            console.log('File not found or already deleted:', error);
        }
    }
};
