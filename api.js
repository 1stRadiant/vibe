// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTJz1GUWH5WyaTneAUbdRAnw_tL0EbzWVRNC6Nf3rJZr9Ah-oXcSUyQr1RuSHDwVibyQ/exec';

/**
 * Performs a JSONP request to the Google Apps Script backend.
 * This function dynamically creates a <script> tag to bypass CORS restrictions.
 * @param {string} action - The action to perform (e.g., 'login', 'saveProject').
 * @param {object} params - An object of parameters to send with the request.
 * @returns {Promise<object>} A promise that resolves with the data from the backend.
 */
function jsonpRequest(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
        return reject(new Error('API URL is not configured. Please set APPS_SCRIPT_URL in api.js.'));
    }

    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    const script = document.createElement('script');
    
    let url = `${APPS_SCRIPT_URL}?action=${action}&callback=${callbackName}`;
    for (const key in params) {
        url += `&${key}=${encodeURIComponent(params[key])}`;
    }
    script.src = url;

    // The backend will respond with a script that calls this function.
    window[callbackName] = (data) => {
        delete window[callbackName];
        document.body.removeChild(script);
        if (data.status === 'success') {
            resolve(data.data);
        } else {
            reject(new Error(data.message || 'An unknown API error occurred.'));
        }
    };
    
    script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('API request failed. Check the Apps Script URL and deployment settings.'));
    };

    document.body.appendChild(script);
  });
}

// --- API Functions ---

export function signup(username, password) {
  return jsonpRequest('signup', { username, password });
}

export function login(username, password) {
  return jsonpRequest('login', { username, password });
}

export function listProjects(userId) {
  return jsonpRequest('listProjects', { userId });
}

export function loadProject(userId, projectId) {
  return jsonpRequest('loadProject', { userId, projectId });
}

export function saveProject(userId, projectId, projectData) {
  let dataString = JSON.stringify(projectData);
  let isCompressed = false;

  // Check if Pako library is loaded.
  if (typeof pako !== 'undefined') {
    try {
      // Pako's deflate function can work directly with a string.
      const compressedData = pako.deflate(dataString, { to: 'string' });
      
      // We'll encode the compressed string to Base64 to ensure it's safe for URL transmission.
      dataString = btoa(compressedData);
      isCompressed = true;
    } catch (error) {
      console.error('Data compression failed:', error);
      // If compression fails, we proceed with uncompressed data.
    }
  } else {
    console.warn('Pako library not loaded. Saving data uncompressed. This may fail for large projects.');
  }
  
  return jsonpRequest('saveProject', { userId, projectId, projectData: dataString, compressed: isCompressed });
}

export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
}
