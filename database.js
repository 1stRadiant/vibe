/**
 * database.js
 * Client-side wrapper for the Vibe Coding System Google Apps Script backend.
 *
 * Usage:
 *   const db = new DataBase('https://script.google.com/macros/s/.../exec');
 *   await db.login({ email, password }); // returns { token }
 *   await db.listProjects(); // uses saved token from localStorage (if any)
 *
 * Notes:
 *  - Sends body as raw JSON text (`text/plain;charset=UTF-8`) because Apps Script
 *    commonly expects the raw POST body in `e.postData.contents`.
 *  - Uses `mode: 'cors'` and does NOT send cookies/credentials by default.
 *  - Saves auth token to localStorage under key 'vibe_auth_token' by default.
 */

class DataBase {
  /**
   * @param {string} apiUrl - The Apps Script web app URL (the /exec URL).
   * @param {object} [opts]
   * @param {boolean} [opts.autoSaveToken=true] - save returned token to localStorage
   * @param {string} [opts.tokenStorageKey='vibe_auth_token']
   * @param {number} [opts.timeout=30000] - request timeout in ms
   */
  constructor(apiUrl, opts = {}) {
    if (!apiUrl) throw new Error('apiUrl is required');
    this.apiUrl = apiUrl.replace(/\/+$/, ''); // trim trailing slashes
    this.autoSaveToken = opts.autoSaveToken !== undefined ? !!opts.autoSaveToken : true;
    this.tokenStorageKey = opts.tokenStorageKey || 'vibe_auth_token';
    this.timeout = typeof opts.timeout === 'number' ? opts.timeout : 30000;
  }

  /* -----------------------
     Token helpers
     ----------------------- */
  get savedToken() {
    try {
      return localStorage.getItem(this.tokenStorageKey);
    } catch (e) {
      return null;
    }
  }

  saveToken(token) {
    if (!token) return;
    if (this.autoSaveToken) {
      try {
        localStorage.setItem(this.tokenStorageKey, token);
      } catch (e) {
        // ignore storage errors silently
      }
    }
  }

  clearSavedToken() {
    try {
      localStorage.removeItem(this.tokenStorageKey);
    } catch (e) {}
  }

  /* -----------------------
     Internal fetch wrapper
     ----------------------- */
  async _fetch(action, payload = {}, authToken = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    // If authToken is not provided, fall back to saved token (if any)
    const token = authToken || this.savedToken || null;

    const requestBody = {
      action,
      payload,
      authToken: token
    };

    // Use text/plain for Apps Script compatibility but body is JSON text
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'text/plain;charset=UTF-8'
    };

    const fetchOptions = {
      method: 'POST',
      mode: 'cors', // ensure browser performs CORS request
      cache: 'no-cache',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
      // DO NOT include credentials unless your backend explicitly supports them
      // credentials: 'omit'
    };

    let res;
    try {
      res = await fetch(this.apiUrl + '/exec', fetchOptions);
    } catch (err) {
      clearTimeout(timeout);
      // Distinguish Abort from network errors
      if (err.name === 'AbortError') {
        throw new Error('Request timed out.');
      }
      // Likely network / CORS preflight / blocked request
      throw new Error('Network request failed. This can happen if CORS preflight failed or the endpoint redirected to a login page. Check your deployment (execute as: Me, access: Anyone, even anonymous). Original error: ' + err.message);
    } finally {
      clearTimeout(timeout);
    }

    // If the response is opaque or was blocked by CORS, fetch may still return but with no usable body.
    // Check status and headers via response.ok
    if (!res.ok) {
      // Try to read the response body for more details
      let text;
      try { text = await res.text(); } catch (e) { text = ''; }
      throw new Error(`Server responded with ${res.status} ${res.statusText}. ${text}`);
    }

    // Parse JSON response safely
    let json;
    try {
      json = await res.json();
    } catch (e) {
      // response wasn't JSON — return raw text for debugging
      const raw = await res.text();
      throw new Error('Unable to parse server response as JSON. Raw response: ' + raw);
    }

    // The Apps Script wrapper returns { status: 'success'|'error', data|message: ... }
    if (!json || typeof json !== 'object') {
      throw new Error('Unexpected server response shape: ' + JSON.stringify(json));
    }

    if (json.status === 'error') {
      throw new Error(json.message || 'Unknown server error');
    }

    // success
    return json.data;
  }

  /* -----------------------
     Authentication
     ----------------------- */

  /**
   * Sign up a new user.
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<object>} { message }
   */
  async signup(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required for signup.');
    }
    return await this._fetch('signup', { email: credentials.email, password: credentials.password }, null);
  }

  /**
   * Login user. Saves token to localStorage if autoSaveToken=true.
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<object>} { token }
   */
  async login(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required for login.');
    }
    const data = await this._fetch('login', { email: credentials.email, password: credentials.password }, null);
    if (data && data.token) {
      this.saveToken(data.token);
    }
    return data;
  }

  /**
   * Logout (clears saved token)
   */
  logout() {
    this.clearSavedToken();
  }

  /* -----------------------
     Projects
     ----------------------- */

  async listProjects(authToken = null) {
    return await this._fetch('listProjects', {}, authToken);
  }

  async loadProject(projectId, authToken = null) {
    if (!projectId) throw new Error('projectId is required');
    return await this._fetch('loadProject', { projectId }, authToken);
  }

  async saveProject(projectId, projectData, authToken = null) {
    if (!projectId) throw new Error('projectId is required');
    return await this._fetch('saveProject', { projectId, projectData }, authToken);
  }

  async deleteProject(projectId, authToken = null) {
    if (!projectId) throw new Error('projectId is required');
    return await this._fetch('deleteProject', { projectId }, authToken);
  }

  /* -----------------------
     Files
     ----------------------- */

  async listFiles(projectId, authToken = null) {
    if (!projectId) throw new Error('projectId is required');
    return await this._fetch('listFiles', { projectId }, authToken);
  }

  async loadFile(projectId, filePath, authToken = null) {
    if (!projectId || !filePath) throw new Error('projectId and filePath are required');
    return await this._fetch('loadFile', { projectId, filePath }, authToken);
  }

  /**
   * Save file. fileContent should be a string (base64 for binary files if needed).
   * @param {string} projectId
   * @param {string} filePath
   * @param {string} fileContent
   * @param {string} [mimeType]
   * @param {boolean} [isBinary=false]
   */
  async saveFile(projectId, filePath, fileContent, mimeType = 'text/plain', isBinary = false, authToken = null) {
    if (!projectId || !filePath) throw new Error('projectId and filePath are required');
    return await this._fetch('saveFile', { projectId, filePath, fileContent, mimeType, isBinary }, authToken);
  }

  async deleteFile(projectId, filePath, authToken = null) {
    if (!projectId || !filePath) throw new Error('projectId and filePath are required');
    return await this._fetch('deleteFile', { projectId, filePath }, authToken);
  }

  async renameFile(projectId, fromPath, toPath, authToken = null) {
    if (!projectId || !fromPath || !toPath) throw new Error('projectId, fromPath and toPath are required');
    return await this._fetch('renameFile', { projectId, fromPath, toPath }, authToken);
  }
}

/* Expose to window for simple browser usage */
if (typeof window !== 'undefined') {
  window.DataBase = DataBase;
}

/* Example (uncomment to test in-browser):
(async () => {
  const db = new DataBase('https://script.google.com/macros/s/YOUR_ID_HERE', { timeout: 20000 });
  try {
    const loginRes = await db.login({ email: 'you@example.com', password: 'password123' });
    console.log('login', loginRes);
    const projects = await db.listProjects();
    console.log('projects', projects);
  } catch (err) {
    console.error('DB error', err);
  }
})();
*/

export default DataBase;
