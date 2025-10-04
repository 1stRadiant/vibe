
// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5p0NpHuIfVUuziW4VkqwTJERjAMpgIdKz0yCO4vVkFt38FerGObaxQQxqPJ2h8RB1yA/exec';

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
  console.log(`Starting save for project: ${projectId}`);
  
  // 1. Convert the project object to a JSON string.
  const jsonString = JSON.stringify(projectData);

  // 2. Encode the string to Base64, correctly handling all Unicode characters.
  // This is a two-step process to avoid issues with btoa and multi-byte characters.
  const uint8Array = new TextEncoder().encode(jsonString);
  let binaryString = '';
  uint8Array.forEach(byte => {
      binaryString += String.fromCharCode(byte);
  });
  const dataString = btoa(binaryString);
  
  // 3. Split the encoded data into chunks small enough for a GET request URL.
  const chunks = [];
  if (dataString.length > 0) {
    for (let i = 0; i < dataString.length; i += CHUNK_SIZE) {
      chunks.push(dataString.substring(i, i + CHUNK_SIZE));
    }
  } else {
    // If the project data is empty, send a single empty chunk
    // so the backend can handle saving an empty file.
    chunks.push('');
  }

  // 4. Send each chunk to the server one by one.
  // We send them sequentially and with a delay to ensure the Google Apps Script
  // backend can process them in order without hitting concurrency limits.
  const totalChunks = chunks.length;
  console.log(`Project data is ${dataString.length} bytes, split into ${totalChunks} chunks.`);
  
  const isCompressed = false; 
  for (let i = 0; i < totalChunks; i++) {
    console.log(`Sending chunk ${i + 1} of ${totalChunks}...`);
    try {
        await sendChunk(userId, projectId, chunks[i], i, totalChunks, isCompressed);
        console.log(`Chunk ${i + 1} successfully sent.`);
        
        // Wait for a short period before sending the next chunk. This is critical for stability.
        if (i < totalChunks - 1) {
            await delay(150); // Increased delay for more reliability
        }
    } catch (error) {
        // If any chunk fails, the entire save operation fails.
        console.error(`Error sending chunk ${i + 1}. Aborting save operation.`, error);
        // Propagate the error up so the UI can display a failure message.
        throw new Error(`Save failed on chunk ${i + 1}: ${error.message}`);
    }
  }

  console.log(`All ${totalChunks} chunks sent. Finalizing save on server.`);
  // The success of the final `sendChunk` call implies the backend has assembled and saved the data.
  // If an error occurred during assembly, the backend should have returned an error status,
  // which would have been caught by the `try...catch` block above.
  return { status: 'success', message: 'Project saved successfully.' };
}

export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
}
