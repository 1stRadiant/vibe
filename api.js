// api.js

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGGYs1MZgFAvHBU9XSu-OjBKgQc8ttgCBvwA5Il7fbeW9ubSMCZLNpUOT2w2H0JwyPEg/exec';

const SAVE_RETRY_LIMIT = 3;
const SAVE_RETRY_DELAY_MS = 2000;      // grows with each attempt (2s, 4s, ...)
const REQUEST_TIMEOUT_MS = 60000;
const SAVE_TIMEOUT_MS = 300000;        // Apps Script can take a while on big projects

// Errors where retrying the same request cannot help.
const NON_RETRYABLE = /Missing required parameters|not found|permission|Invalid action|API URL is not configured/i;

export let onSaveError   = (msg) => console.error('[Save Error]', msg);
export let onSaveSuccess = (info) => console.log('[Save] OK', info);

// ─────────────────────────────────────────────
// Diagnostics
// ─────────────────────────────────────────────

/** Central diagnostic log – stored in memory and printed to console */
const _diagLog = [];
function _diag(level, msg, data) {
  const entry = { ts: new Date().toISOString(), level, msg, ...(data || {}) };
  _diagLog.push(entry);
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[api.js][${level.toUpperCase()}] ${msg}`, data || '');
}

/** Expose the log so you can inspect it from the console: import { getDiagLog } ... */
export function getDiagLog() { return [..._diagLog]; }

/** Print a formatted summary to the console */
export function printDiagSummary() {
  console.group('[api.js] Diagnostic Summary');
  _diagLog.forEach(e => {
    const prefix = `${e.ts} [${e.level.toUpperCase()}]`;
    if (e.payloadBytes) {
      console.log(`${prefix} ${e.msg} | size=${_fmt(e.payloadBytes)} | attempt=${e.attempt ?? '-'} | durationMs=${e.durationMs ?? '-'}`);
    } else {
      console.log(`${prefix} ${e.msg}`, e);
    }
  });
  console.groupEnd();
}

/**
 * Quick console-callable check for whether the Apps Script deployment is
 * reachable at all. Run `checkApiReachability()` from the browser devtools
 * (after importing this module) when you see "Network error" / "Failed to
 * fetch" and want to know if it's a deployment/access problem vs. something
 * else. Doesn't require login — just probes the endpoint.
 */
export async function checkApiReachability() {
  console.group('[api.js] Reachability check');
  console.log('Target URL:', APPS_SCRIPT_URL);
  console.log('navigator.onLine:', navigator.onLine);

  try {
    const t0 = performance.now();
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: '__ping__' }),
    });
    const ms = Math.round(performance.now() - t0);
    const text = await res.text();
    console.log(`Got an HTTP response in ${ms}ms — status ${res.status} ${res.statusText}`);
    console.log('Response preview:', text.slice(0, 300));
    if (text.trim().startsWith('<')) {
      console.warn('Response looks like HTML, not JSON — this is the classic sign that the '
        + 'deployment is redirecting to a Google sign-in / consent page instead of running your '
        + 'script. Check Deploy → Manage deployments → "Who has access" is set to "Anyone", '
        + 'then click "New version".');
    }
    console.groupEnd();
    return { reachable: true, status: res.status, preview: text.slice(0, 300) };
  } catch (err) {
    console.error('fetch() itself threw — the request never reached a server (or the response was '
      + 'blocked before JS could read it). Common causes: deployment access not set to "Anyone", '
      + 'a stale deployment URL, being offline, or a browser extension blocking the domain.');
    console.error('Raw error:', err.message);
    console.groupEnd();
    return { reachable: false, error: err.message };
  }
}

function _fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(2)} MB`;
}

// ─────────────────────────────────────────────
// Core POST
// ─────────────────────────────────────────────

async function postRequest(action, payload = {}, { attempt = 1, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured.');
  }

  const requestData = { action, ...payload };
  const body = JSON.stringify(requestData);
  const payloadBytes = new TextEncoder().encode(body).length;

  _diag('info', `POST → ${action}`, { payloadBytes, sizeFormatted: _fmt(payloadBytes), attempt });

  const t0 = performance.now();

  let response;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      signal: controller ? controller.signal : undefined,
    });
  } catch (networkErr) {
    if (timer) clearTimeout(timer);
    const durationMs = Math.round(performance.now() - t0);
    if (networkErr.name === 'AbortError') {
      _diag('error', `Timeout on ${action}`, { payloadBytes, durationMs, attempt });
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s (${action}).`);
    }
    _diag('error', `Network error on ${action}`, { payloadBytes, durationMs, attempt, error: networkErr.message });

    // The browser's raw "Failed to fetch" means the request never got a usable
    // response at all — it's almost never a code bug at this point. Give a
    // message that points at the actual likely cause instead of the opaque
    // browser text, since that saves a lot of debugging time.
    const hint = navigator.onLine === false
      ? 'You appear to be offline — check your internet connection.'
      : 'This usually means the Apps Script deployment is unreachable: check that '
        + '"Who has access" is set to "Anyone" in Deploy → Manage deployments (and that you '
        + 'clicked "New version" after changing it), that the deployment URL in api.js is still '
        + 'the active one, and that no browser extension/ad-blocker is blocking script.google.com.';
    throw new Error(`Network error: could not reach the API (${networkErr.message}). ${hint}`);
  }

  if (timer) clearTimeout(timer);
  const durationMs = Math.round(performance.now() - t0);

  if (!response.ok) {
    _diag('error', `HTTP ${response.status} on ${action}`, { payloadBytes, durationMs, attempt, status: response.status });
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  // Capture raw text first so we can log it if JSON parse fails
  const rawText = await response.text();

  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    _diag('error', `Non-JSON response on ${action}`, {
      payloadBytes, durationMs, attempt,
      responsePreview: rawText.slice(0, 300),
    });
    throw new Error(`Server returned non-JSON. Preview: ${rawText.slice(0, 200)}`);
  }

  if (result.status === 'success') {
    _diag('info', `POST ← ${action} OK`, { payloadBytes, durationMs, attempt });
    return result.data !== undefined ? result.data : result;
  } else {
    _diag('error', `API error on ${action}`, { payloadBytes, durationMs, attempt, serverMessage: result.message });
    throw new Error(result.message || 'An unknown API error occurred.');
  }
}

// ─────────────────────────────────────────────
// Standard API functions
// ─────────────────────────────────────────────

export function signup(username, password)         { return postRequest('signup',       { username, password }); }
export function login(username, password)          { return postRequest('login',        { username, password }); }
export function listProjects(userId)               { return postRequest('listProjects', { userId }); }
export function loadProject(userId, projectId)     { return postRequest('loadProject',  { userId, projectId }); }
export function deleteProject(userId, projectId)   { return postRequest('deleteProject',{ userId, projectId }); }

// ─────────────────────────────────────────────
// Save with retry
//
// The server gzips the project and splits it across cells (a Sheets cell holds
// at most 50,000 characters), verifies what it stored, and only then switches
// the project over to the new copy. The client:
//   • snapshots the project as a JSON string the moment saveProject() is called
//   • sends its length so the server can detect a truncated upload
//   • checks the server's reported size matches what was sent
//   • queues saves PER PROJECT, keeping only the newest pending snapshot
//   • returns a promise that resolves once that data (or newer data) is saved
// ─────────────────────────────────────────────

async function _saveWithRetry(userId, projectId, json, attempt = 1) {
  try {
    const result = await postRequest(
      'saveProject',
      { userId, projectId, projectData: json, projectDataChars: json.length },
      { attempt, timeoutMs: SAVE_TIMEOUT_MS }
    );
    if (result && typeof result.chars === 'number' && result.chars !== json.length) {
      throw new Error(`Server stored ${result.chars} characters but ${json.length} were sent.`);
    }
    return result;
  } catch (error) {
    if (attempt < SAVE_RETRY_LIMIT && !NON_RETRYABLE.test(error.message)) {
      const delay = SAVE_RETRY_DELAY_MS * attempt;
      _diag('warn', `Save attempt ${attempt} failed, retrying in ${delay}ms...`, { error: error.message });
      await new Promise(r => setTimeout(r, delay));
      return _saveWithRetry(userId, projectId, json, attempt + 1);
    }
    throw error;
  }
}

// key -> { json, userId, projectId, waiters: [{resolve, reject}] }
const _pendingSaves = new Map();
const _saveOrder = [];          // keys waiting to run, in order
let _saveRunning = false;

async function _drainSaveQueue() {
  if (_saveRunning) return;
  _saveRunning = true;
  try {
    while (_saveOrder.length) {
      const key = _saveOrder.shift();
      const job = _pendingSaves.get(key);
      _pendingSaves.delete(key);
      if (!job) continue;

      const sizeBytes = new TextEncoder().encode(job.json).length;
      try {
        const result = await _saveWithRetry(job.userId, job.projectId, job.json);
        const info = { projectId: job.projectId, sizeFormatted: _fmt(sizeBytes), ...(result || {}) };
        onSaveSuccess(info);
        job.waiters.forEach(w => w.resolve(info));
      } catch (error) {
        const msg = `Save failed after ${SAVE_RETRY_LIMIT} attempts: ${error.message}`;
        onSaveError(msg);
        const err = new Error(msg);
        job.waiters.forEach(w => w.reject(err));
      }
    }
  } finally {
    _saveRunning = false;
  }
}

export function saveProject(userId, projectId, projectData) {
  let json;
  try {
    json = typeof projectData === 'string' ? projectData : JSON.stringify(projectData);
  } catch (e) {
    onSaveError(`Could not serialise project: ${e.message}`);
    return Promise.reject(e);
  }
  if (!json) {
    const err = new Error('Nothing to save (project data is empty).');
    onSaveError(err.message);
    return Promise.reject(err);
  }

  const key = `${userId}|${projectId}`;
  _diag('info', 'saveProject called', { sizeFormatted: _fmt(new TextEncoder().encode(json).length), projectId });

  const promise = new Promise((resolve, reject) => {
    const existing = _pendingSaves.get(key);
    if (existing) {
      // A newer snapshot replaces the queued one; everyone waiting gets this result.
      _diag('info', 'Save already queued for this project — replacing with latest data');
      existing.json = json;
      existing.waiters.push({ resolve, reject });
    } else {
      _pendingSaves.set(key, { userId, projectId, json, waiters: [{ resolve, reject }] });
      _saveOrder.push(key);
    }
  });
  // Fire-and-forget callers (autosave) shouldn't produce "unhandled rejection" noise;
  // failures are still reported through onSaveError, and awaiting callers still see them.
  promise.catch(() => {});

  _drainSaveQueue();
  return promise;
}

export function hasPendingSaves() {
  return _saveRunning || _pendingSaves.size > 0;
}

// ─────────────────────────────────────────────
// Size probe — call this from the browser console
// to find where saves start failing.
//
// Usage:
//   import('/your/path/api.js').then(m => m.probePayloadSizes('user-xxx', 'test-project'))
//
// Or if already imported:
//   probePayloadSizes('user-xxx', 'test-project')
// ─────────────────────────────────────────────

export async function probePayloadSizes(userId, projectId) {
  // Test payload sizes in KB steps
  const sizes = [10, 50, 100, 200, 500, 800, 1000];
  console.group('[api.js] Payload size probe');

  for (const kb of sizes) {
    // Generate a dummy string of exactly ~kb kilobytes
    const filler = 'x'.repeat(kb * 1024);
    const fakeData = { _probe: true, size: `${kb}KB`, content: filler };

    const body = JSON.stringify({ action: 'saveProject', userId, projectId, projectData: fakeData });
    const actualBytes = new TextEncoder().encode(body).length;

    console.log(`Testing ~${kb} KB payload (actual: ${_fmt(actualBytes)})...`);
    const t0 = performance.now();
    try {
      const json = JSON.stringify(fakeData);
      await postRequest('saveProject', { userId, projectId, projectData: json, projectDataChars: json.length }, { timeoutMs: SAVE_TIMEOUT_MS });
      console.log(`  ✅ ${_fmt(actualBytes)} — OK in ${Math.round(performance.now()-t0)}ms`);
    } catch (err) {
      console.error(`  ❌ ${_fmt(actualBytes)} — FAILED in ${Math.round(performance.now()-t0)}ms: ${err.message}`);
      console.warn('  Stopping probe here — this is likely your size ceiling.');
      break;
    }
  }

  console.groupEnd();
  console.log('Full diag log available via getDiagLog()');
}

// ─────────────────────────────────────────────
// Form data
// ─────────────────────────────────────────────

export function saveFormData(userId, projectId, formId, formData) {
  return postRequest('saveFormData', { userId, projectId, formId, data: formData });
}

export function loadFormData(userId, projectId, formId) {
  return postRequest('loadFormData', { userId, projectId, formId });
                               }
