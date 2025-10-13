// api.js

// IMPORTANT: Replace this with the Web App URL you got from deploying your Google Apps Script.
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5p0NpHuIfVUuziW4VkqwTJERjAMpgIdKz0yCO4vVkFt38FerGObaxQQxqPJ2h8RB1yA/exec';

// In your Google Apps Script 'Code.gs' file, you will need to add handlers
// for the new 'saveFormData' and 'loadFormData' actions to enable database features
// for your live, shared projects.
/*
// ----------------- ADD THIS TO YOUR Code.gs -----------------

// In your doGet(e) function, add these cases to the switch statement:
case 'saveFormData':
  return handleSaveFormData(e);
case 'loadFormData':
  return handleLoadFormData(e);

// Then, add these two new functions to your Code.gs file:

function handleSaveFormData(e) {
  try {
    const { userId, projectId, formId, data } = e.parameter;
    if (!userId || !projectId || !formId || !data) {
      return createErrorResponse('Missing required parameters for saving form data.', e.parameter.callback);
    }
    
    // Use a separate sheet for form data to keep it organized
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('FormData');
    if (!sheet) {
      sheet = ss.insertSheet('FormData');
      sheet.appendRow(['userId', 'projectId', 'formId', 'timestamp', 'formDataJson']);
    }
    
    const timestamp = new Date().toISOString();
    sheet.appendRow([userId, projectId, formId, timestamp, data]);
    
    return createSuccessResponse({ message: 'Form data saved successfully.' }, e.parameter.callback);
  } catch (err) {
    return createErrorResponse('Could not save form data: ' + err.message, e.parameter.callback);
  }
}

function handleLoadFormData(e) {
  try {
    const { userId, projectId, formId } = e.parameter;
     if (!userId || !projectId || !formId) {
      return createErrorResponse('Missing required parameters for loading form data.', e.parameter.callback);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('FormData');
    if (!sheet) {
      // If the sheet doesn't exist, there's no data.
      return createSuccessResponse([], e.parameter.callback);
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    if (values.length <= 1) {
        return createSuccessResponse([], e.parameter.callback);
    }
    const headers = values[0];
    const data = values.slice(1);

    const userIdCol = headers.indexOf('userId');
    const projectIdCol = headers.indexOf('projectId');
    const formIdCol = headers.indexOf('formId');
    const timestampCol = headers.indexOf('timestamp');
    const dataCol = headers.indexOf('formDataJson');

    if([userIdCol, projectIdCol, formIdCol, timestampCol, dataCol].includes(-1)){
        return createErrorResponse("FormData sheet is missing required columns.", e.parameter.callback);
    }

    const results = data.filter(row => {
      return row[userIdCol] === userId && row[projectIdCol] === projectId && row[formIdCol] === formId;
    }).map(row => {
      try {
        return {
          timestamp: row[timestampCol],
          data: JSON.parse(row[dataCol])
        };
      } catch (jsonErr) {
        return null; 
      }
    }).filter(item => item !== null); // Remove any rows that failed to parse
    
    return createSuccessResponse(results, e.parameter.callback);
  } catch (err) {
    return createErrorResponse('Could not load form data: ' + err.message, e.parameter.callback);
  }
}

// ----------------- END OF Code.gs ADDITIONS -----------------
*/

// Define a chunk size for data transmission. 1500 is a safe size for URLs.
const CHUNK_SIZE = 1500;

// State variables for the save queue
let isSaveInProgress = false;
let pendingSaveData = null; // Will store the arguments for the next save


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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// --- Refactored Save Logic with Queue ---

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
    console.log('Project saved successfully via queue.');

  } catch (error) {
    console.error('Save operation failed:', error);
    // Even if it fails, we should try the next pending save or release the lock
  } finally {
    // After the save attempt (success or fail), check if a new save is pending.
    if (pendingSaveData) {
      // A new save was requested while this one was running.
      // Start the next save immediately with the latest data.
      const { userId, projectId, projectData } = pendingSaveData;
      pendingSaveData = null; // Clear the pending data
      // Use setTimeout to avoid deep recursion on rapid failures
      setTimeout(() => _runSave(userId, projectId, projectData), 0);
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
  // Create a deep copy to prevent the queued data from being mutated before it's saved.
  const dataToSave = JSON.parse(JSON.stringify(projectData));

  if (isSaveInProgress) {
    // A save is already running. Queue this new data, overwriting any older pending data.
    console.log('Save in progress. Queuing latest data.');
    pendingSaveData = { userId, projectId, projectData: dataToSave };
  } else {
    // No save is running. Start one now.
    console.log('Starting a new save operation.');
    isSaveInProgress = true;
    _runSave(userId, projectId, dataToSave);
  }
}


// --- Form Data Functions ---

/**
 * Saves form submission data to the backend.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {string} formId - A unique identifier for the form within the project.
 * @param {object} formData - The form data object.
 * @returns {Promise<object>} A promise that resolves with the backend's response.
 */
export function saveFormData(userId, projectId, formId, formData) {
  const dataString = JSON.stringify(formData);
  return jsonpRequest('saveFormData', { userId, projectId, formId, data: dataString });
}

/**
 * Loads all submissions for a specific form.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {string} formId - The ID of the form whose data to load.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of submission objects.
 */
export function loadFormData(userId, projectId, formId) {
  return jsonpRequest('loadFormData', { userId, projectId, formId });
}


export function deleteProject(userId, projectId) {
  return jsonpRequest('deleteProject', { userId, projectId });
}
