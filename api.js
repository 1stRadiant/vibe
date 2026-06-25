// api.js

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGGYs1MZgFAvHBU9XSu-OjBKgQc8ttgCBvwA5Il7fbeW9ubSMCZLNpUOT2w2H0JwyPEg/exec';

const SAVE_RETRY_LIMIT = 3;
const SAVE_RETRY_DELAY_MS = 2000;

let isSaveInProgress = false;
let pendingSaveData = null;

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

function _fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(2)} MB`;
}

// ─────────────────────────────────────────────
// Core POST
// ─────────────────────────────────────────────

async function postRequest(action, payload = {}, { attempt = 1 } = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured.');
  }

  const requestData = { action, ...payload };
  const body = JSON.stringify(requestData);
  const payloadBytes = new TextEncoder().encode(body).length;

  _diag('info', `POST → ${action}`, { payloadBytes, sizeFormatted: _fmt(payloadBytes), attempt });

  const t0 = performance.now();

  let response;
  try {
    response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
  } catch (networkErr) {
    const durationMs = Math.round(performance.now() - t0);
    _diag('error', `Network error on ${action}`, { payloadBytes, durationMs, attempt, error: networkErr.message });
    throw new Error(`Network error: ${networkErr.message}`);
  }

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
// ─────────────────────────────────────────────

async function _saveWithRetry(userId, projectId, projectData, attempt = 1) {
  try {
    // Pre-stringify projectData into a plain string BEFORE it enters the JSON envelope.
    // This means Apps Script receives it as a string value and can call setValue() directly
    // without re-serialising a nested object — which is where GAS silently corrupts large trees.
    const projectDataString = typeof projectData === 'string'
      ? projectData
      : JSON.stringify(projectData);
    _diag('info', `_saveWithRetry: pre-stringified projectData`, {
      type: typeof projectDataString,
      chars: projectDataString.length,
      attempt,
    });
    await postRequest('saveProject', { userId, projectId, projectData: projectDataString }, { attempt });
  } catch (error) {
    if (attempt < SAVE_RETRY_LIMIT) {
      _diag('warn', `Save attempt ${attempt} failed, retrying...`, { error: error.message });
      await new Promise(r => setTimeout(r, SAVE_RETRY_DELAY_MS));
      return _saveWithRetry(userId, projectId, projectData, attempt + 1);
    }
    throw error;
  }
}

async function _runSave(userId, projectId, projectData) {
  try {
    await _saveWithRetry(userId, projectId, projectData);
    const sizeBytes = new TextEncoder().encode(JSON.stringify(projectData)).length;
    onSaveSuccess({ sizeFormatted: _fmt(sizeBytes) });
  } catch (error) {
    onSaveError(`Save failed after ${SAVE_RETRY_LIMIT} attempts: ${error.message}`);
  } finally {
    if (pendingSaveData) {
      const next = pendingSaveData;
      pendingSaveData = null;
      setTimeout(() => _runSave(next.userId, next.projectId, next.projectData), 0);
    } else {
      isSaveInProgress = false;
    }
  }
}

export function saveProject(userId, projectId, projectData) {
  const dataToSave = JSON.parse(JSON.stringify(projectData));
  const sizeBytes  = new TextEncoder().encode(JSON.stringify(dataToSave)).length;
  _diag('info', `saveProject called`, { sizeFormatted: _fmt(sizeBytes), projectId });

  if (isSaveInProgress) {
    _diag('info', 'Save in progress — queuing latest data');
    pendingSaveData = { userId, projectId, projectData: dataToSave };
  } else {
    isSaveInProgress = true;
    _runSave(userId, projectId, dataToSave);
  }
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
      await postRequest('saveProject', { userId, projectId, projectData: fakeData });
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
