/**
 * A database wrapper that connects to a Google Apps Script backend.
 * v2: Includes full file storage capabilities.
 */
export class DataBase {
    constructor(apiUrl) {
        if (!apiUrl) {
            throw new Error("API URL is required for the database connection.");
        }
        this.apiUrl = apiUrl;
        this.authToken = sessionStorage.getItem('vibe-user-token');
    }

    // --- Auth & Core Methods ---
    setAuthToken(token) { /* ... same as previous answer ... */ }
    isLoggedIn() { return !!this.authToken; }
    async _fetch(action, payload = {}, useAuth = true) { /* ... same as previous answer ... */ }
    async signup(email, password) { return this._fetch('signup', { email, password }, false); }
    async login(email, password) { /* ... same as previous answer ... */ }
    logout() { /* ... same as previous answer ... */ }

    // --- Project Methods ---
    async saveProject(projectId, projectData) { return this._fetch('saveProject', { projectId, projectData }); }
    async loadProject(projectId) { return this._fetch('loadProject', { projectId }); }
    async deleteProject(projectId) { return this._fetch('deleteProject', { projectId }); }
    async listProjects() { return this._fetch('listProjects'); }

    // --- File Storage Methods ---
    async listFiles(projectId) { return this._fetch('listFiles', { projectId }); }
    async deleteFile(projectId, path) { return this._fetch('deleteFile', { projectId, filePath: path }); }
    async renameFile(projectId, fromPath, toPath) { return this._fetch('renameFile', { projectId, fromPath, toPath }); }

    async saveTextFile(projectId, path, text) {
        const payload = {
            projectId,
            filePath: path,
            fileContent: text,
            mimeType: this._guessMime(path) || 'text/plain',
            isBinary: false,
        };
        return this._fetch('saveFile', payload);
    }

    async saveBinaryFile(projectId, path, uint8, mime) {
        const b64 = this._uint8ToBase64(uint8);
        const payload = {
            projectId,
            filePath: path,
            fileContent: b64, // Send as Base64 string
            mimeType: mime || this._guessMime(path),
            isBinary: true,
        };
        return this._fetch('saveFile', payload);
    }

    async getFileBlob(projectId, path) {
        const fileData = await this._fetch('loadFile', { projectId, filePath: path });
        if (!fileData) throw new Error(`File not found: ${path}`);
        
        if (fileData.isBinary) {
            const u8 = this._base64ToUint8(fileData.content);
            return new Blob([u8], { type: fileData.mimeType });
        } else {
            return new Blob([fileData.content], { type: fileData.mimeType });
        }
    }

    // --- Utility Methods ---
    _uint8ToBase64(u8) {
        let binary = '';
        u8.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary);
    }

    _base64ToUint8(b64) {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
    
    _guessMime(filename) { /* ... same as original file ... */ }
}
