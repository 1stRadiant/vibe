// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5p0NpHuIfVUuziW4VkqwTJERjAMpgIdKz0yCO4vVkFt38FerGObaxQQxqPJ2h8RB1yA/exec';

// Define a chunk size for data transmission. 1500 is a safe size for URLs.
const CHUNK_SIZE = 1500;

// --- START OF FIX: Add state variables for a save queue ---
let isSaveInProgress = false;
let pendingSaveData = null; // Will store the arguments for the next save
// --- END OF FIX ---


/**
 * Performs a JSONP request to the Google Apps Script backend.
 * This function dynamically creates a <script> tag to bypass CORS restrictions.
 * @param {string} action - The action to perform (e.g., 'login', 'saveProject').
 * @param {object} params - An object of parameters to send with the request.
 * @returns {Promise<object>} A promise that resolves with the data from the backend.
 */
function jsonpRequest(action, params = {}) {
  // ... (This function remains unchanged)
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

function sendChunk(userId, projectId, chunk, index, totalChunks, isCompressed) {
  // ... (This function remains unchanged)
  return jsonpRequest('saveProjectChunk', {
    userId,
    projectId,
    chunkData: chunk,
    chunkIndex: index,
    totalChunks,
    compressed: isCompressed,
  });
}

function delay(ms) {
  // ... (This function remains unchanged)
  return new Promise(resolve => setTimeout(resolve, ms));
}


// --- START OF REFACTORED SAVE LOGIC ---

/**
 * The internal async function that performs the actual save operation.
 * It should only be called by the `saveProject` gatekeeper function.
 */
async function _runSave(userId, projectId, projectData) {
  try {
    const jsonString = JSON.stringify(projectData);
    const uint8Array = new TextEncoder().encode(jsonString);
    let binaryString = '';
    uint8Array.forEach(byte => {
      binaryString += String.fromCharCode(byte);
    });
    const dataString = btoa(binaryString);
    
    const chunks = [];
    for (let i = 0; i < dataString.length; i += CHUNK_SIZE) {
      chunks.push(dataString.substring(i, i + CHUNK_SIZE));
    }

    const totalChunks = chunks.length;
    const isCompressed = false;
    for (let i = 0; i < totalChunks; i++) {
      await sendChunk(userId, projectId, chunks[i], i, totalChunks, isCompressed);
      await delay(100);
    }
    console.log('Project saved successfully.');

  } catch (error) {
    console.error('Save operation failed:', error);
  } finally {
    // After the save attempt (success or fail), check if a new save is pending.
    if (pendingSaveData) {
      // A new save was requested while this one was running.
      // Start the next save immediately with the latest data.
      const { userId, projectId, projectData } = pendingSaveData;
      pendingSaveData = null; // Clear the pending data
      _runSave(userId, projectId, projectData); // Note: We don't release the lock
    } else {
      // No new saves were requested. We can release the lock.
      isSaveInProgress = false;
    }
  }
}

/**
 * Saves project data. Acts as a gatekeeper to the internal _runSave function.
 * If a save is in progress, it queues the latest data to be saved next.
 * This function itself is not async and returns immediately.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {object} projectData - The project data object to save.
 */
export function saveProject(userId, projectId, projectData) {
  if (isSaveInProgress) {
    // A save is already running. Queue this new data, overwriting any older pending data.
    console.log('Save in progress. Queuing latest data.');
    pendingSaveData = { userId, projectId, projectData };
  } else {
    // No save is running. Start one now.
    console.log('Starting a new save operation.');
    isSaveInProgress = true;
    _runSave(userId, projectId, projectData);
  }
}

// --- END OF REFACTORED SAVE LOGIC ---

export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
                       }
