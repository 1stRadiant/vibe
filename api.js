// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGGYs1MZgFAvHBU9XSu-OjBKgQc8ttgCBvwA5Il7fbeW9ubSMCZLNpUOT2w2H0JwyPEg/exec';

// State variables for the save queue to prevent rapid-fire saving spam
let isSaveInProgress = false;
let pendingSaveData = null; 

/**
 * Performs a standard POST request to the Google Apps Script backend.
 */
async function postRequest(action, payload = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured. Please set APPS_SCRIPT_URL in api.js.');
  }

  // Combine action with the payload
  const requestData = { action, ...payload };

  try {
    // Sending as 'text/plain' completely bypasses CORS preflight (OPTIONS) requests
    // which Apps Script notoriously struggles with. Apps Script will parse the text back into JSON.
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      // Some endpoints return 'data', some just return a success message
      return result.data !== undefined ? result.data : result;
    } else {
      throw new Error(result.message || 'An unknown API error occurred.');
    }
  } catch (error) {
    throw new Error(`API Request failed: ${error.message}`);
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


// --- Vastly Simplified Save Logic ---

async function _runSave(userId, projectId, projectData) {
  try {
    // Just send the whole thing! POST has a ~50MB limit, so chunking is gone.
    await postRequest('saveProject', { userId, projectId, projectData });
    console.log('Project saved successfully.');
  } catch (error) {
    console.error('Save operation failed:', error);
  } finally {
    // Process queue if the user kept typing/working during the save
    if (pendingSaveData) {
      const { userId, projectId, projectData } = pendingSaveData;
      pendingSaveData = null;
      setTimeout(() => _runSave(userId, projectId, projectData), 0);
    } else {
      isSaveInProgress = false;
    }
  }
}

/**
 * Saves project data. Keeps the queue so you don't spam the server if
 * it's auto-saving on every keystroke/mouse move.
 */
export function saveProject(userId, projectId, projectData) {
  const dataToSave = JSON.parse(JSON.stringify(projectData));

  if (isSaveInProgress) {
    console.log('Save in progress. Queuing latest data.');
    pendingSaveData = { userId, projectId, projectData: dataToSave };
  } else {
    console.log('Starting a new save operation.');
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
    data: formData // Passed directly, backend handles stringifying
  });
}

export function loadFormData(userId, projectId, formId) {
  return postRequest('loadFormData', { userId, projectId, formId });
}
