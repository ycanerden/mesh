/* ========================================
   Firebase Configuration — Vibe Coder
   ======================================== */

// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g. "vibe-coder-dashboard")
// 3. Click "Web" app icon (</>), register app name
// 4. Copy the firebaseConfig object and paste it below
// 5. Go to Firestore Database > Create database > Start in Test Mode
// 6. Done! The dashboard will read from Firestore

const firebaseConfig = {
    // ⚠️ PASTE YOUR CONFIG HERE — get it from Firebase Console > Project Settings > Your Apps
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let firebaseReady = false;

function initFirebase() {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.log('[Firebase] No config set — using local data.');
            return false;
        }
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('[Firebase] Connected ✓');
        return true;
    } catch (e) {
        console.warn('[Firebase] Init failed:', e.message);
        return false;
    }
}

// --- Firestore Read Helpers ---

async function loadToolsFromFirebase() {
    if (!firebaseReady) return null;
    try {
        const snapshot = await db.collection('tools').orderBy('name').get();
        if (snapshot.empty) return null;
        const tools = [];
        snapshot.forEach(doc => {
            tools.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Firebase] Loaded ${tools.length} tools from Firestore`);
        return tools;
    } catch (e) {
        console.warn('[Firebase] Could not load tools:', e.message);
        return null;
    }
}

async function loadTrendingFromFirebase() {
    if (!firebaseReady) return null;
    try {
        const snapshot = await db.collection('trending').orderBy('stars', 'desc').limit(20).get();
        if (snapshot.empty) return null;
        const repos = [];
        snapshot.forEach(doc => {
            repos.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Firebase] Loaded ${repos.length} trending repos from Firestore`);
        return repos;
    } catch (e) {
        console.warn('[Firebase] Could not load trending:', e.message);
        return null;
    }
}

// Seed tools from hardcoded BUILDER_TOOLS to Firestore (one-time use)
async function seedToolsToFirebase(tools) {
    if (!firebaseReady) {
        console.error('[Firebase] Not connected — cannot seed.');
        return;
    }
    const batch = db.batch();
    tools.forEach(tool => {
        const docRef = db.collection('tools').doc(tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        batch.set(docRef, {
            ...tool,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: 'seed'
        });
    });
    await batch.commit();
    console.log(`[Firebase] Seeded ${tools.length} tools ✓`);
}
