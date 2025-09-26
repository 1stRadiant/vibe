// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBQC0NIzOWRz1JMKB7Q3165WwvhfxcXngBou8RcuEvzeN89H4OLExdyxKR8pDpbKwbSw/exec';

/**
 * Performs a POST request to the Google Apps Script backend using the Fetch API.
 * @param {string} action - The action to perform (e.g., 'login', 'saveProject').
 * @param {object} params - An object of parameters to send with the request.
 * @returns {Promise<object>} A promise that resolves with the data from the backend.
 */
async function fetchRequest(action, params = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
    throw new Error('API URL is not configured. Please set APPS_SCRIPT_URL in api.js.');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script POST requests
    },
    body: JSON.stringify({ action, ...params }),
    redirect: 'follow',
  });

  const result = await response.json();

  if (result.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.message || 'An unknown API error occurred.');
  }
}

// --- API Functions ---

export function signup(username, password) {
  return fetchRequest('signup', { username, password });
}

export function login(username, password) {
  return fetchRequest('login', { username, password });
}

export function listProjects(userId) {
  return fetchRequest('listProjects', { userId });
}

export function loadProject(userId, projectId) {
  return fetchRequest('loadProject', { userId, projectId });
}

export function saveProject(userId, projectId, projectData) {
  let dataToSend = JSON.stringify(projectData);
  let compressed = false;

  // Check if Pako is available (make sure to include Pako in your HTML)
  if (typeof pako !== 'undefined') {
    try {
      const compressedData = pako.deflate(dataToSend, { to: 'string' });
      // Encode to Base64 to ensure the string is safe for transport
      dataToSend = btoa(compressedData);
      compressed = true;
      console.log('Project data compressed successfully.');
    } catch (e) {
      console.error('Compression failed:', e);
    }
  } else {
    console.warn('Pako library not loaded. Saving data uncompressed.');
  }

  return fetchRequest('saveProject', { userId, projectId, projectData: dataToSend, compressed });
}

export function deleteProject(userId, projectId) {
  return fetchRequest('deleteProject', { userId, projectId });
}
