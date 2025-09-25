// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiSh_-xVqxkVwrpD1xPBrL3rN5B2FxUbyNFSy4BqEF4CGkxA_KQ3YDaGo5ZlKHijyJYg/exec';
/**
 * Performs a POST request to the Google Apps Script backend using the Fetch API.
 * @param {string} action - The action to perform (e.g., 'login', 'saveProject').
 * @param {object} payload - An object of parameters to send with the request.
 * @returns {Promise<object>} A promise that resolves with the data from the backend.
 */
async function postRequest(action, payload = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured. Please set APPS_SCRIPT_URL in api.js.');
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script to parse the body
    },
    body: JSON.stringify({ action, payload }), // Send action and payload in the request body
    cache: 'no-cache',
    redirect: 'follow',
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, requestOptions);
    
    if (!response.ok) {
        // Try to get a more specific error message from the backend if possible
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.data; // Resolve the promise with the actual data
    } else {
      // Throw an error to be caught by the calling function's .catch() block
      throw new Error(result.message || 'An unknown API error occurred.');
    }
  } catch (error) {
    console.error('Fetch API Error:', error);
    // Re-throw the error so the UI layer can handle it
    throw error;
  }
}

// --- API Functions (These now use postRequest) ---

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

export function saveProject(userId, projectId, projectData) {
  // No need to stringify here; postRequest handles it.
  return postRequest('saveProject', { userId, projectId, projectData });
}

export function deleteProject(userId, projectId) {
  return postRequest('deleteProject', { userId, projectId });
}
