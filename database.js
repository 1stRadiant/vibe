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
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            sessionStorage.setItem('vibe-user-token', token);
        } else {
            sessionStorage.removeItem('vibe-user-token');
        }
    }

    isLoggedIn() {
        return !!this.authToken;
    }

    // AFTER THE FIX
async _fetch(action, payload = {}, useAuth = true) {
    const requestBody = {
        action,
        payload
    };

    if (useAuth) {
        if (!this.authToken) {
            throw new Error("Authentication required for this action.");
        }
        requestBody.authToken = this.authToken;
    }

    try {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script
            },
            body: JSON.stringify(requestBody),
            redirect: 'follow' // <-- THIS IS THE FIX
        });

        if (!response.ok) {
            // This will now correctly report errors like 500 or 404
            throw new Error(`Network error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message || 'An unknown server error occurred.');
        }

        return result.data;

    } catch (error) {
        console.error(`Database fetch failed for action "${action}":`, error);
        throw error;
    }
}

    async signup(email, password) {
        return this._fetch('signup', { email, password }, false);
    }

    async login(email, password) {
        const response = await this._fetch('login', { email, password }, false);
        if (response && response.token) {
            this.setAuthToken(response.token);
        }
        return response;
    }

    logout() {
        this.setAuthToken(null);
    }

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
    
    async readTextFile(projectId, path) {
        const fileData = await this._fetch('loadFile', { projectId, filePath: path });
        if (!fileData || fileData.isBinary) {
            throw new Error(`Could not read '${path}' as a text file.`);
        }
        return fileData.content;
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
    
    _guessMime(filename) {
        const ext = (filename || '').toLowerCase().split('.').pop();
        switch (ext) {
            case 'html': case 'htm': return 'text/html';
            case 'css': return 'text/css';
            case 'js': return 'application/javascript';
            case 'json': return 'application/json';
            case 'svg': return 'image/svg+xml';
            case 'png': return 'image/png';
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'gif': return 'image/gif';
            case 'webp': return 'image/webp';
            case 'ico': return 'image/x-icon';
            case 'mp4': return 'video/mp4';
            default: return 'application/octet-stream';
        }
    }
}
