// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl_o2D6RV-dahJKHxk0SBwovVdvV_vFiKTHUwwvjZnjC7W8wiB6ezY4kAG904Yl9zYZw/exec';

// Define a chunk size for data transmission. 1500 is a safe size for URLs.
const CHUNK_SIZE = 1500;

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

/**
 * Sends a single chunk of data to the server.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {string} chunk - The data chunk to send.
 * @param {number} index - The index of this chunk.
 * @param {number} totalChunks - The total number of chunks.
 * @param {boolean} isCompressed - Whether the data is compressed.
 * @returns {Promise<object>} A promise that resolves when the chunk is sent.
 */
function sendChunk(userId, projectId, chunk, index, totalChunks, isCompressed) {
  return jsonpRequest('saveProjectChunk', {
    userId,
    projectId,
    chunkData: chunk,
    chunkIndex: index,
    totalChunks,
    compressed: isCompressed,
  });
}


// Helper function for adding a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Saves project data by correctly encoding it for Unicode, then breaking it into chunks.
 * Includes a small delay between chunks to prevent server-side race conditions.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {object} projectData - The project data object to save.
 * @returns {Promise<object>} A promise that resolves when the entire project is saved.
 */
export async function saveProject(userId, projectId, projectData) {
  // 1. Convert the project object to a JSON string.
  const jsonString = JSON.stringify(projectData);

  // 2. Correctly handle Unicode by converting the string to a UTF-8 byte array,
  //    then to a binary string that btoa can safely encode.
  const uint8Array = new TextEncoder().encode(jsonString);
  let binaryString = '';
  uint8Array.forEach(byte => {
      binaryString += String.fromCharCode(byte);
  });
  const dataString = btoa(binaryString);
  
  // 3. Create chunks from the now safely-encoded string.
  const chunks = [];
  for (let i = 0; i < dataString.length; i += CHUNK_SIZE) {
    chunks.push(dataString.substring(i, i + CHUNK_SIZE));
  }

  // 4. Send chunks sequentially with a small delay.
  const totalChunks = chunks.length;
  const isCompressed = false; 
  for (let i = 0; i < totalChunks; i++) {
    // Await the chunk sending
    await sendChunk(userId, projectId, chunks[i], i, totalChunks, isCompressed);
    // THEN wait for a very short period before sending the next one.
    // 100ms is usually enough to let the server process the request.
    await delay(100); 
  }

  return { status: 'success', message: 'Project saved successfully.' };
}

export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
}
