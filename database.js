/**
 * database.js
 * Exports `DataBase` as a named export and as the default export.
 * Designed for direct browser module imports: <script type="module">.
 */

export class DataBase {
  /**
   * @param {string} apiUrl - base Apps Script URL (with or without trailing /exec)
   * @param {object} opts
   */
  constructor(apiUrl, opts = {}) {
    if (!apiUrl) throw new Error('apiUrl is required');
    this.apiUrl = apiUrl.replace(/\/+$/, ''); // remove trailing slash(es)
    this.autoSaveToken = opts.autoSaveToken !== undefined ? !!opts.autoSaveToken : true;
    this.tokenStorageKey = opts.tokenStorageKey || 'vibe_auth_token';
    this.timeout = typeof opts.timeout === 'number' ? opts.timeout : 30000;
  }

  /* -----------------------
     Token helpers
     ----------------------- */
  get savedToken() {
    try { return localStorage.getItem(this.tokenStorageKey); } catch (e) { return null; }
  }

  saveToken(token) {
    if (!token) return;
    if (this.autoSaveToken) {
      try { localStorage.setItem(this.tokenStorageKey, token); } catch (e) {}
    }
  }

  clearSavedToken() {
    try { localStorage.removeItem(this.tokenStorageKey); } catch (e) {}
  }

  /* -----------------------
     Internal fetch wrapper
     ----------------------- */
  async _fetch(action, payload = {}, authToken = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);
    const token = authToken || this.savedToken || null;

    const requestBody = { action, payload, authToken: token };

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'text/plain;charset=UTF-8'
    };

    const fetchOptions = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    };

    let res;
    try {
      const url = this.apiUrl.endsWith('/exec') ? this.apiUrl : this.apiUrl + '/exec';
      res = await fetch(url, fetchOptions);
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw new Error('Request timed out.');
      throw new Error('Network request failed. This can happen if CORS preflight failed or the endpoint redirected to a login page. Check your Apps Script deployment (Execute as: Me, access: Anyone, even anonymous). Original error: ' + err.message);
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      let text;
      try { text = await res.text(); } catch (e) { text = ''; }
      throw new Error(`Server responded with ${res.status} ${res.statusText}. ${text}`);
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      const raw = await res.text();
      throw new Error('Unable to parse server response as JSON. Raw response: ' + raw);
    }

    if (!json || typeof json !== 'object') {
      throw new Error('Unexpected server response shape: ' + JSON.stringify(json));
    }

    if (json.status === 'error') {
      throw new Error(json.message || 'Unknown server error');
    }

    return json.data;
  }

  /* -----------------------
     Authentication
     ----------------------- */

  async signup({ email, password } = {}) {
    if (!email || !password) throw new Error('Email and password are required for signup.');
    return await this._fetch('signup', { email, password }, null);
  }

  async login({ email, password } = {}) {
    if (!email || !password) throw new Error('Email and password are required for login.');
    const data = await this._fetch('login', { email, password }, null);
    if (data && data.token) this.saveToken(data.token);
    return data;
  }

  logout() { this.clearSavedToken(); }

  /* -----------------------
     Projects
     ----------------------- */
  async listProjects(authToken = null) { return await this._fetch('listProjects', {}, authToken); }
  async loadProject(projectId, authToken = null) { if (!projectId) throw new Error('projectId is required'); return await this._fetch('loadProject', { projectId }, authToken); }
  async saveProject(projectId, projectData, authToken = null) { if (!projectId) throw new Error('projectId is required'); return await this._fetch('saveProject', { projectId, projectData }, authToken); }
  async deleteProject(projectId, authToken = null) { if (!projectId) throw new Error('projectId is required'); return await this._fetch('deleteProject', { projectId }, authToken); }

  /* -----------------------
     Files
     ----------------------- */
  async listFiles(projectId, authToken = null) { if (!projectId) throw new Error('projectId is required'); return await this._fetch('listFiles', { projectId }, authToken); }
  async loadFile(projectId, filePath, authToken = null) { if (!projectId || !filePath) throw new Error('projectId and filePath are required'); return await this._fetch('loadFile', { projectId, filePath }, authToken); }
  async saveFile(projectId, filePath, fileContent, mimeType = 'text/plain', isBinary = false, authToken = null) {
    if (!projectId || !filePath) throw new Error('projectId and filePath are required');
    return await this._fetch('saveFile', { projectId, filePath, fileContent, mimeType, isBinary }, authToken);
  }
  async deleteFile(projectId, filePath, authToken = null) { if (!projectId || !filePath) throw new Error('projectId and filePath are required'); return await this._fetch('deleteFile', { projectId, filePath }, authToken); }
  async renameFile(projectId, fromPath, toPath, authToken = null) { if (!projectId || !fromPath || !toPath) throw new Error('projectId, fromPath and toPath are required'); return await this._fetch('renameFile', { projectId, fromPath, toPath }, authToken); }
}

/* Attach to window for backward compatibility (non-module usage) */
if (typeof window !== 'undefined') {
  window.DataBase = DataBase;
}

/* Default export for import styles that expect default */
export default DataBase;
