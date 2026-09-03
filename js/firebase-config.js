// ============================================================================
// Agnes Herbal Supplements — Firebase Bridge (OPTIONAL, free "Spark" plan is enough)
// ============================================================================
// Bila hatua hii, tovuti inaendelea kufanya kazi kama kawaida (localStorage
// pekee, kila kifaa peke yake). Ukitaka oda/notifications/status ziunganishwe
// LIVE kati ya duka lako (customer) na admin panel (wewe), fuata hatua hizi:
//
// 1) Nenda https://console.firebase.google.com → "Add project" (bure kabisa)
// 2) Ndani ya mradi: "Build" > "Firestore Database" > "Create database"
//    → chagua "Start in test mode" (unaweza kuimarisha rules baadaye) > chagua region.
// 3) Ndani ya mradi: "Build" > "Storage" > "Get started" (kwa ajili ya picha za bidhaa).
// 4) "Project settings" (gia) > chini "Your apps" > bofya "</>" (Web) > sajili app
//    → Firebase itakupa object ya "firebaseConfig" — inakili humu chini.
// 5) Weka faili hii kwenye kila ukurasa (tayari imeshaunganishwa: index.html,
//    admin.html, track-order.html).
//
// Mpaka uweke funguo zako halisi hapa chini, AHS_CLOUD_READY inabaki "false"
// na mfumo mzima unaendelea kufanya kazi kwa hali ya "local-only" salama.
// ============================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBgXJKv5ucQRJC4TY79qLghiA61esY57r8",
  authDomain: "agnes-1-console.firebaseapp.com",
  projectId: "agnes-1-console",
  storageBucket: "agnes-1-console.firebasestorage.app",
  messagingSenderId: "812719124598",
  appId: "1:812719124598:web:496dd01ab7d4f84b31ef57"
};

let AHS_CLOUD_READY = false;
let ahsDb = null;
let ahsStorage = null;
let ahsAuth = null;

(function initAhsCloud() {
  try {
    if (typeof firebase === 'undefined') return;
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith('PASTE_')) return;
    firebase.initializeApp(FIREBASE_CONFIG);
    ahsDb = firebase.firestore();
    // Huwasha "offline persistence" (IndexedDB cache) ili data ya Firestore
    // (mfano customProducts) ikae kwenye kifaa cha mteja. Ziara ya pili na
    // zinazofuata, bidhaa mpya zinaonekana PAPO HAPO kutoka kwenye cache
    // badala ya kusubiri mtandao — kisha zinajisasisha (sync) kimya kimya
    // mara mtandao ukiwepo. Ikiwa tab nyingine ya app iko wazi tayari,
    // hitilafu hii ni salama kupuuzwa (inashughulikiwa hapa chini).
    try {
      ahsDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err && (err.code === 'failed-precondition' || err.code === 'unimplemented')) {
          console.info('[Agnes] Firestore offline cache haipatikani kwenye kivinjari/tab hii (si hitilafu kubwa).');
        } else {
          console.warn('[Agnes] Firestore enablePersistence imeshindwa:', err);
        }
      });
    } catch (persistErr) {
      console.warn('[Agnes] Firestore enablePersistence haikupatikana kwenye SDK hii.', persistErr);
    }
    // Storage SDK haipakiwi kwenye kila ukurasa (mfano track-order.html
    // haihitaji upload wa picha), hivyo tunaifanya iwe ya hiari ili kutokosekana
    // kwake kusizime Firestore/live-sync kwenye kurasa hizo.
    if (typeof firebase.storage === 'function') {
      ahsStorage = firebase.storage();
    }
    if (firebase.auth) ahsAuth = firebase.auth();
    AHS_CLOUD_READY = true;
    console.info('[Agnes] Firebase imeunganishwa — sync ya live imewashwa.');
  } catch (e) {
    console.warn('[Agnes] Firebase haikuweza kuanzishwa. Mfumo unaendelea kwa localStorage pekee.', e);
    AHS_CLOUD_READY = false;
  }
  // Firebase sasa inapakia kwa njia isiyozuia (angalia index.html) — hivyo
  // inaweza kumaliza kupakia BAADA ya app.js kuanza. Tukio hili linaruhusu
  // app.js kuwasha "cloud sync" mara Firebase ikiwa tayari, hata kama hilo
  // linatokea sekunde kadhaa baada ya ukurasa kuonekana kwa mtumiaji.
  document.dispatchEvent(new CustomEvent('ahsCloudReady', { detail: { ready: AHS_CLOUD_READY } }));
})();

/* ===================== ADMIN AUTHENTICATION ===================== */
// Muhimu: hii ndiyo njia pekee salama ya Firestore Security Rules kujua
// "huyu ni admin wa kweli" — password ya ndani ya JS (js/admin.js) haitoshi
// peke yake kwa sababu mtu yeyote anaweza kuisoma kwenye source code.
function cloudSignIn(email, password) {
  if (!ahsAuth) return Promise.reject(new Error('Firebase Auth haijaanzishwa'));
  return ahsAuth.signInWithEmailAndPassword(email, password);
}
function cloudSignOut() {
  if (!ahsAuth) return Promise.resolve();
  return ahsAuth.signOut();
}
function cloudCurrentUser() {
  return ahsAuth ? ahsAuth.currentUser : null;
}

/* ===================== ORDERS ===================== */
function cloudPushOrder(order) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('orders').doc(order.id).set({
    ...order,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    statusUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(() => true).catch(err => { console.warn('cloudPushOrder', err); return false; });
}
// Real-time: admin panel hupokea oda mpya papo hapo ikiwa online, na
// zote alizokosa zikiwa offline zinajaa moja kwa moja mara tu akiwa online tena
// (hii ni tabia ya asili ya Firestore, hakuna usanidi wa ziada unaohitajika).
function cloudListenOrders(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('orders').orderBy('date', 'desc').limit(300).onSnapshot(snap => {
    const orders = [];
    snap.forEach(doc => orders.push(doc.data()));
    callback(orders);
  }, err => console.warn('cloudListenOrders', err));
}
function cloudUpdateOrderStatus(orderId, status) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('orders').doc(orderId).update({
    status, statusUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => true).catch(err => { console.warn('cloudUpdateOrderStatus', err); return false; });
}
function cloudListenOneOrder(orderId, callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('orders').doc(orderId).onSnapshot(doc => {
    if (doc.exists) callback(doc.data());
  }, err => console.warn('cloudListenOneOrder', err));
}

/* ===================== PRODUCT OVERRIDES (picha, caption, MOQ) ===================== */
function cloudSaveProduct(id, data) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('productOverrides').doc(String(id)).set(data, { merge: true })
    .then(() => true).catch(err => { console.warn('cloudSaveProduct', err); return false; });
}
function cloudListenProducts(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('productOverrides').onSnapshot(snap => {
    const map = {};
    snap.forEach(doc => map[doc.id] = doc.data());
    callback(map);
  }, err => console.warn('cloudListenProducts', err));
}

/* ===================== BIDHAA MPYA (customProducts, "➕ Ongeza Bidhaa") ===================== */
// Namba ya "id" ya kila bidhaa mpya inatolewa kwa transaction (counter salama
// dhidi ya migongano ikiwa admin anaongeza bidhaa kwenye vifaa viwili kwa
// wakati mmoja) — inaendelea moja kwa moja baada ya bidhaa 288 za mwisho
// zilizopo kwenye js/products-data.js (yaani 288, 289, 290...) ili ionekane
// kama orodha MOJA inayoendelea, siyo namba kubwa zisizoeleweka.
function cloudNextProductId() {
  if (!AHS_CLOUD_READY) return Promise.reject(new Error('Firebase haijaanzishwa bado.'));
  const counterRef = ahsDb.collection('meta').doc('productCounter');
  return ahsDb.runTransaction(tx => tx.get(counterRef).then(doc => {
    const current = (doc.exists && typeof doc.data().next === 'number') ? doc.data().next : PRODUCTS.length;
    tx.set(counterRef, { next: current + 1 }, { merge: true });
    return current;
  }));
}
function cloudSaveNewProduct(product) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('customProducts').doc(String(product.id)).set({
    ...product, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => true);
  // Kwa makusudi HATUNASI (catch) hitilafu hapa — tunaiacha ipande kwenda
  // js/admin.js ili iweze kuonyesha sababu halisi (mfano "permission-denied"
  // ikiwa hujaingia kama admin wa kweli) badala ya kusema tu "imeshindwa".
}
function cloudListenCustomProducts(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('customProducts').onSnapshot(snap => {
    const list = [];
    snap.forEach(doc => list.push(doc.data()));
    callback(list);
  }, err => console.warn('cloudListenCustomProducts', err));
}
function cloudDeleteCustomProduct(id) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('customProducts').doc(String(id)).delete()
    .then(() => true).catch(err => { console.warn('cloudDeleteCustomProduct', err); return false; });
}

/* ===================== MPANGILIO WA DUKA (Bidhaa za Leo + Ofa za Kundi) ===================== */
// Hati MOJA tu ("meta/homepageSettings") inayoshikilia: (1) orodha ya bidhaa
// alizochagua admin ziwe za kwanza kuonekana ("featuredToday", kwa mfuatano
// alioupanga), na (2) asilimia ya ofa kwa kila kundi ("categoryOffers").
// Inatumia collection "meta" iliyopo tayari (Firestore Rules zake tayari
// zinaruhusu kila mtu kusoma, admin pekee kuandika) — hakuna rules mpya
// zinazohitajika.
function cloudSaveHomepageSettings(data) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('meta').doc('homepageSettings').set(data, { merge: false })
    .then(() => true).catch(err => { console.warn('cloudSaveHomepageSettings', err); return false; });
}
function cloudListenHomepageSettings(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('meta').doc('homepageSettings').onSnapshot(doc => {
    callback(doc.exists ? doc.data() : { featuredToday: [], categoryOffers: {} });
  }, err => console.warn('cloudListenHomepageSettings', err));
}

/* ===================== ADMIN ONLINE PRESENCE ===================== */
function cloudSetPresence(online) {
  if (!AHS_CLOUD_READY) return;
  ahsDb.collection('meta').doc('presence').set({
    online, ts: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(() => {});
}
function cloudListenPresence(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('meta').doc('presence').onSnapshot(doc => {
    callback(doc.exists ? doc.data() : { online: false });
  }, err => console.warn('cloudListenPresence', err));
}

/* ===================== WATEJA WALIO ONLINE (VISITOR PRESENCE) ===================== */
// Kila kivinjari cha mteja kinaandika/kusasisha hati YAKE TU (deviceId yake)
// kila baada ya sekunde ~25 kwenye "visitorPresence/{deviceId}", likionyesha
// muda wa mwisho alioonekana (lastSeen). Admin anapobofya kitufe "Wangapi
// Wapo Online", tunasoma hati ZOTE na kuhesabu zile ambazo lastSeen ni ndani
// ya dakika iliyopita — hiyo ndiyo idadi ya watu walio online sasa hivi.
function cloudHeartbeatPresence(deviceId) {
  if (!AHS_CLOUD_READY || !deviceId) return Promise.resolve(false);
  return ahsDb.collection('visitorPresence').doc(deviceId).set({
    deviceId,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(() => true).catch(() => false);
}
function cloudCountOnlineVisitors(windowSeconds) {
  if (!AHS_CLOUD_READY) return Promise.resolve(0);
  return ahsDb.collection('visitorPresence').get().then(snap => {
    const cutoff = Date.now() - (windowSeconds || 60) * 1000;
    let count = 0;
    snap.forEach(doc => {
      const d = doc.data();
      if (d.lastSeen && d.lastSeen.toMillis && d.lastSeen.toMillis() > cutoff) count++;
    });
    return count;
  }).catch(err => { console.warn('cloudCountOnlineVisitors', err); return 0; });
}

/* ===================== APP UPDATE PUSH ("Tuma Update kwa Vifaa Vyote") ===================== */
// Admin anapobofya kitufe kwenye admin.html, tunaandika toleo jipya (namba ya
// muda/timestamp) kwenye meta/appVersion. Kila kifaa cha mteja kinachofuatilia
// hati hii (angalia initAppVersionWatch() kwenye js/app.js) kinaona mabadiliko
// HAPO HAPO (Firestore realtime), kinalazimisha Service Worker kukagua toleo
// jipya la sw.js, na kinaandika "ack" yake ili admin aone limefika.
function cloudPushAppUpdate() {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  const version = String(Date.now());
  return ahsDb.collection('meta').doc('appVersion').set({
    version, pushedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(() => version).catch(err => { console.warn('cloudPushAppUpdate', err); return false; });
}
function cloudListenAppVersion(callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('meta').doc('appVersion').onSnapshot(doc => {
    if (doc.exists) callback(doc.data());
  }, err => console.warn('cloudListenAppVersion', err));
}
function cloudAckAppVersion(version, deviceId) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  return ahsDb.collection('meta').doc('appVersion').collection('acks').doc(deviceId).set({
    deviceId, version, ackedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => true).catch(err => { console.warn('cloudAckAppVersion', err); return false; });
}
// Idadi ya vifaa vilivyothibitisha KWA TOLEO HILI MAALUM (siyo jumla ya wote
// waliowahi kutumia tovuti) — hii ndiyo tunayoionyesha kwa admin, ikiwa wazi
// kwamba vifaa vilivyo nje ya mtandao vitaonekana hapa mara tu vitakaporudi
// mtandaoni, si papo hapo.
function cloudListenAckCount(version, callback) {
  if (!AHS_CLOUD_READY) return () => {};
  return ahsDb.collection('meta').doc('appVersion').collection('acks')
    .where('version', '==', version)
    .onSnapshot(snap => callback(snap.size), err => console.warn('cloudListenAckCount', err));
}


function cloudUploadImage(productId, file, onProgress) {
  if (!AHS_CLOUD_READY) return Promise.reject(new Error('Firebase haijaanzishwa bado.'));
  const path = `products/${productId}/${Date.now()}_${file.name}`;
  const ref = ahsStorage.ref().child(path);
  const task = ref.put(file);
  return new Promise((resolve, reject) => {
    task.on('state_changed', snap => {
      if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
    }, reject, () => {
      task.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
    });
  });
}
/* ===================== NEWSLETTER ===================== */
// Emails huhifadhiwa kwenye Firestore (siyo tu localStorage ya mteja) ili
// zifike kwako kwenye admin.html. doc ID = email yenyewe, kwa hiyo mtu
// akijisajili mara mbili haziongezeki mara mbili.
function cloudSaveNewsletterEmail(email) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  const safeId = email.toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  return ahsDb.collection('newsletter').doc(safeId).set({
    email: email.toLowerCase(), date: new Date().toISOString()
  }).then(() => true).catch(err => { console.warn('cloudSaveNewsletterEmail', err); return false; });
}
function cloudListNewsletter() {
  if (!AHS_CLOUD_READY) return Promise.resolve([]);
  return ahsDb.collection('newsletter').orderBy('date', 'desc').get()
    .then(snap => snap.docs.map(d => d.data()))
    .catch(err => { console.warn('cloudListNewsletter', err); return []; });
}

function cloudDeleteImage(url) {
  if (!AHS_CLOUD_READY) return Promise.resolve(false);
  try {
    return ahsStorage.refFromURL(url).delete().then(() => true).catch(() => false);
  } catch (e) { return Promise.resolve(false); }
}

/* ===================== VISIBLE CONNECTION STATUS BADGE ===================== */
// Sets AHS_CLOUD_READY to true only when the SDK objects were created — it does
// NOT prove the device can actually reach Firestore (a blocked network, strict
// ad-blocker, or firewall can still silently fail later). This does a real
// round-trip read so the badge reflects what's actually true on THIS device,
// with no developer tools required to check it.
function initCloudStatusBadge() {
  const badge = document.getElementById('cloudStatusBadge');
  if (!badge) return;
  function setBadge(state, label) {
    badge.className = 'cloud-status-badge ' + state;
    badge.textContent = label;
  }
  if (!AHS_CLOUD_READY) {
    setBadge('offline', '🔴 Local Only');
    return;
  }
  setBadge('checking', '🟡 Inakagua...');
  ahsDb.collection('meta').doc('presence').get()
    .then(() => setBadge('online', '🟢 Live'))
    .catch(() => setBadge('offline', '🔴 Mtandao Umezuiwa'));
}
document.addEventListener('DOMContentLoaded', () => setTimeout(initCloudStatusBadge, 300));
document.addEventListener('ahsCloudReady', initCloudStatusBadge);
