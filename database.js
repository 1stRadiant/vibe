/**
 * A database wrapper that connects to a Google Apps Script backend.
 */

export class DataBase {
    constructor(apiUrl) {
        if (!apiUrl) {
            throw new Error("API URL is required for the database connection.");
        }
        this.apiUrl = apiUrl;
        this.authToken = sessionStorage.getItem('vibe-user-token');
    }

    // --- Auth Methods ---
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

    async _fetch(action, payload = {}, useAuth = true) {
        const headers = { 'Content-Type': 'text/plain;charset=utf-8' }; // Apps Script quirk
        const body = { action, payload };

        if (useAuth) {
            if (!this.authToken) {
                // Handle session expiry gracefully
                window.dispatchEvent(new CustomEvent('auth-expired'));
                throw new Error('Authentication token not found. Please log in.');
            }
            body.authToken = this.authToken;
        }

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            mode: 'cors',
            redirect: 'follow' 
        });

        const result = await response.json();

        if (result.status === 'error') {
            // Check for auth errors to trigger logout
            if (result.message.includes('Invalid session token') || result.message.includes('Session expired')) {
                window.dispatchEvent(new CustomEvent('auth-expired'));
            }
            throw new Error(result.message);
        }
        return result.data;
    }

    async signup(email, password) {
        return this._fetch('signup', { email, password }, false);
    }

    async login(email, password) {
        const data = await this._fetch('login', { email, password }, false);
        if (data.authToken) {
            this.setAuthToken(data.authToken);
        }
        return data;
    }

    logout() {
        this.setAuthToken(null);
        // No server call needed, just clear the client-side token.
    }

    // --- Project Methods ---

    async saveProject(projectId, projectData) {
        if (!projectId) throw new Error("Project ID is required.");
        return this._fetch('saveProject', { projectId, projectData });
    }

    async loadProject(projectId) {
        return this._fetch('loadProject', { projectId });
    }

    async deleteProject(projectId) {
        return this._fetch('deleteProject', { projectId });
    }

    async listProjects() {
        return this._fetch('listProjects');
    }

    // NOTE: File storage is not implemented in this version for simplicity.
    // To add it, you would create new 'handleSaveFile', 'handleLoadFile' actions
    // in your Apps Script and corresponding methods here.
}
