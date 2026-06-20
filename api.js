// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGGYs1MZgFAvHBU9XSu-OjBKgQc8ttgCBvwA5Il7fbeW9ubSMCZLNpUOT2w2H0JwyPEg/exec';

// How many times to retry a failed save before giving up
const SAVE_RETRY_LIMIT = 3;
const SAVE_RETRY_DELAY_MS = 2000;

// State variables for the save queue to prevent rapid-fire saving spam
let isSaveInProgress = false;
let pendingSaveData = null;

// Optional: set this to a function(errorMessage) to show UI feedback on save failure
export let onSaveError = (msg) => console.error('[Save Error]', msg);
export let onSaveSuccess = () => console.log('[Save] Project saved successfully.');

/**
 * Performs a standard POST request to the Google Apps Script backend.
 */
async function postRequest(action, payload = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured. Please set APPS_SCRIPT_URL in api.js.');
  }

  const requestData = { action, ...payload };

  // Sending as 'text/plain' bypasses CORS preflight which Apps Script struggles with.
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Server returned a non-JSON response. The Apps Script may have crashed.');
  }

  if (result.status === 'success') {
    return result.data !== undefined ? result.data : result;
  } else {
    throw new Error(result.message || 'An unknown API error occurred.');
  }
}


// --- API Functions ---

export function signup(username, password) {
  return postRequest('signup', { username, password });
}

export function login(username, password) {
  return postRequest('login', { username, password });
}

export function listProjects(userId) {
  return postRequest('listProjects', { userId });
}

export function loadProject(userId, projectId) {
  return postRequest('loadProject', { userId, projectId });
}

export function deleteProject(userId, projectId) {
  return postRequest('deleteProject', { userId, projectId });
}


// --- Save Logic with Retry + Error Surfacing ---

/**
 * Attempts to save with up to SAVE_RETRY_LIMIT retries on failure.
 * Throws on final failure so the caller knows something went wrong.
 */
async function _saveWithRetry(userId, projectId, projectData, attempt = 1) {
  try {
    await postRequest('saveProject', { userId, projectId, projectData });
  } catch (error) {
    if (attempt < SAVE_RETRY_LIMIT) {
      console.warn(`[Save] Attempt ${attempt} failed, retrying in ${SAVE_RETRY_DELAY_MS}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, SAVE_RETRY_DELAY_MS));
      return _saveWithRetry(userId, projectId, projectData, attempt + 1);
    }
    // All retries exhausted — re-throw so _runSave can report it
    throw error;
  }
}

async function _runSave(userId, projectId, projectData) {
  try {
    await _saveWithRetry(userId, projectId, projectData);
    onSaveSuccess();
  } catch (error) {
    // Surface the error — don't silently swallow it
    onSaveError(`Save failed after ${SAVE_RETRY_LIMIT} attempts: ${error.message}`);
  } finally {
    // If more data came in while we were saving, process it now
    if (pendingSaveData) {
      const next = pendingSaveData;
      pendingSaveData = null;
      // Use setTimeout to avoid deep call stacks on rapid saves
      setTimeout(() => _runSave(next.userId, next.projectId, next.projectData), 0);
    } else {
      isSaveInProgress = false;
    }
  }
}

/**
 * Saves project data. Queues the latest save if one is already in progress,
 * so rapid auto-saves don't spam the server.
 */
export function saveProject(userId, projectId, projectData) {
  // Deep-clone at the point of call so mutations after this don't affect the saved data
  const dataToSave = JSON.parse(JSON.stringify(projectData));

  if (isSaveInProgress) {
    console.log('[Save] Save in progress — queuing latest data.');
    // Always overwrite the pending slot with the newest data
    pendingSaveData = { userId, projectId, projectData: dataToSave };
  } else {
    console.log('[Save] Starting save operation.');
    isSaveInProgress = true;
    _runSave(userId, projectId, dataToSave);
  }
}


// --- Form Data Functions ---

export function saveFormData(userId, projectId, formId, formData) {
  return postRequest('saveFormData', {
    userId,
    projectId,
    formId,
    data: formData,
  });
}

export function loadFormData(userId, projectId, formId) {
  return postRequest('loadFormData', { userId, projectId, formId });
}
