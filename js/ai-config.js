// ============================================================================
// Agnes Herbal Supplements — AI Assistant (bure)
// ============================================================================
// URL hii ni ya WAZI (public) na ni salama kuwekwa hapa — funguo halisi ya
// siri (GROQ_API_KEY) HAIJIWEKI HAPA — inakaa salama kwenye Cloudflare Worker
// pekee (ona cloudflare-worker/agnes-ai-worker.js kwa maelekezo kamili).
// ============================================================================

const AI_WORKER_URL = 'https://agnesaiworker.floribertinhowilliams.workers.dev';
const AI_SHARED_SECRET = ''; // hiari — weka neno lile lile ulilotumia kwenye Worker (SHARED_SECRET)

function aiAssistantConfigured() {
  return !!(AI_WORKER_URL && !AI_WORKER_URL.startsWith('PASTE_'));
}

// Ombi moja la pamoja kwenda kwa Worker — hutumika kwa "find" (chatbot ya
// kutafuta bidhaa) na "caption" (kuandika maelezo ya AI ya bidhaa).
async function aiWorkerCall(payload) {
  if (!aiAssistantConfigured()) throw new Error('AI_WORKER_URL haijawekwa kwenye js/ai-config.js');
  const resp = await fetch(AI_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: AI_SHARED_SECRET, ...payload }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) throw new Error(data.error || `Worker error ${resp.status}`);
  return data;
}
