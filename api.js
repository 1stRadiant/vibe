// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweaHdACZ8pRO55pSX6jijTD5cNzVppF_8MESG5KCd20yYWg3qlJ7EGSUc5sA0R5xAIJA/exec';

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


/**
 * Saves project data by breaking it into smaller chunks and sending them iteratively.
 * This approach is more robust for large projects.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {object} projectData - The project data object to save.
 * @returns {Promise<object>} A promise that resolves when the entire project is saved.
 */
export async function saveProject(userId, projectId, projectData) {
  // 1. Convert the project object to a JSON string.
  let dataString = JSON.stringify(projectData);
  let isCompressed = false;

  // 2. Compress the JSON string if pako is available.
  if (typeof pako !== 'undefined') {
    try {
      const compressedData = pako.deflate(dataString, { to: 'string' });
      // 3. Base64 encode the *compressed* string.
      dataString = btoa(compressedData);
      isCompressed = true;
    } catch (error) {
      console.error('Data compression failed:', error);
      // If compression fails, fall back to just Base64 encoding the JSON.
      dataString = btoa(dataString); 
    }
  } else {
    console.warn('Pako library not loaded. Saving data uncompressed (but Base64 encoded).');
    // 3b. Base64 encode the *uncompressed* JSON string.
    dataString = btoa(dataString);
  }
  
  // 4. Create chunks from the final processed string.
  const chunks = [];
  for (let i = 0; i < dataString.length; i += CHUNK_SIZE) {
    chunks.push(dataString.substring(i, i + CHUNK_SIZE));
  }

  // 5. Send chunks sequentially.
  const totalChunks = chunks.length;
  for (let i = 0; i < totalChunks; i++) {
    await sendChunk(userId, projectId, chunks[i], i, totalChunks, isCompressed);
  }

  return { status: 'success', message: 'Project saved successfully.' };
}

export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
}
