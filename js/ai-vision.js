// Agnes Herbal Supplements — Client-side AI (TensorFlow.js + MobileNet)
// 100% bure milele: hakuna API key, hakuna akaunti, hakuna server, hakuna gharama.
// Model inashuka mara moja kutoka CDN (jsdelivr) na kufanya kazi ndani ya kivinjari
// cha mtumiaji mwenyewe — hakuna picha wala data inayotumwa nje ya kifaa chake.
//
// Tunatumia mbili kutoka kwenye model hiyo hiyo:
//  1) getEmbedding()  -> vector ya namba 1024 inayoelezea "maudhui" ya picha,
//     tunayotumia kwa ulinganisho wa mfanano wa kweli (cosine similarity) —
//     hii ni tofauti kabisa na ile ya awali iliyokuwa ikiangalia rangi za pixel 8x8.
//  2) classifyImage()  -> majina ya vitu vinavyoonekana kwenye picha (mfano
//     "bottle", "medicine", "vegetable"), tunayotumia kusaidia kutengeneza
//     maelezo (caption) yanayoendana na picha halisi iliyopakiwa, si kubahatisha.

let _aiModelPromise = null;
let _aiScriptsPromise = null;

function _loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Imeshindwa kupakia: ' + src));
    document.head.appendChild(s);
  });
}

// Loads tf.js + mobilenet lazily (only when AI feature is actually used) so
// visitors who never touch image-search/AI-caption never pay the ~5-10MB cost.
function ensureAiScripts() {
  if (!_aiScriptsPromise) {
    _aiScriptsPromise = _loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js')
      .then(() => _loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'));
  }
  return _aiScriptsPromise;
}

function loadAiModel() {
  if (!_aiModelPromise) {
    _aiModelPromise = ensureAiScripts().then(() => mobilenet.load({ version: 2, alpha: 1.0 }));
  }
  return _aiModelPromise;
}

// Real visual-similarity embedding (1024-d feature vector from MobileNet's
// second-to-last layer) — this is genuine learned image understanding, not a
// pixel/color heuristic.
async function getEmbedding(imgEl) {
  const model = await loadAiModel();
  const activation = model.infer(imgEl, true);
  const arr = await activation.data();
  activation.dispose();
  return Array.from(arr);
}

// Real object/content classification — top N labels MobileNet recognizes in
// the image (trained on ImageNet's 1000 categories).
async function classifyImage(imgEl, topK) {
  const model = await loadAiModel();
  return model.classify(imgEl, topK || 3);
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
