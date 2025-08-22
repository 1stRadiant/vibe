/**
 * A simple database-like wrapper around localStorage for saving and loading project data.
 */

// A consistent prefix for all keys in localStorage to avoid conflicts.
const DB_PREFIX = 'vibe-coding-system-projects';
// The key used in a previous, incorrect implementation. We'll use this for migration.
const OLD_DB_KEY = 'vibe-coder';
// New: key for per-project file stores
const FILES_PREFIX = 'vibe-coding-system-files';

export class DataBase {
    /**
     * Initializes the DataBase. It now includes logic to migrate any projects
     * saved under an old, incorrect key to the new centralized storage system.
     */
    constructor() {
        // The main key under which an object of all projects is stored.
        this.storageKey = DB_PREFIX;
        // New: key for per-project file stores
        this.filesKeyPrefix = FILES_PREFIX + ':'; // filesKey = filesKeyPrefix + projectId
        // Run migration logic on initialization to find and move old projects.
        this._migrateOldData();
    }

    /**
     * One-time migration function to move data from the old 'vibe-coder' key
     * to the new centralized project store. This will not overwrite any existing
     * projects in the new store that have the same ID.
     * @private
     */
    _migrateOldData() {
        try {
            const oldDataRaw = localStorage.getItem(OLD_DB_KEY);
            if (oldDataRaw) {
                console.log(`Found data under legacy key '${OLD_DB_KEY}'. Attempting migration.`);
                const oldProjectData = JSON.parse(oldDataRaw);
                const currentDb = this._readDb();

                // Check if there is data to migrate and if the 'vibe-coder' project doesn't already exist.
                if (oldProjectData && oldProjectData.id && !currentDb[OLD_DB_KEY]) {
                    currentDb[OLD_DB_KEY] = oldProjectData;
                    this._writeDb(currentDb);
                    console.log(`Successfully migrated project '${OLD_DB_KEY}' to the new storage system.`);
                }
                
                // Remove the old key after successful migration to prevent re-running.
                localStorage.removeItem(OLD_DB_KEY);
                console.log(`Removed legacy key '${OLD_DB_KEY}' from storage.`);
            }
        } catch (e) {
            console.error("Error during data migration:", e);
        }
    }

    /**
     * Reads all projects from localStorage.
     * @returns {object} An object containing all projects.
     * @private
     */
    _readDb() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error reading from localStorage:", e);
            return {};
        }
    }

    /**
     * Writes the entire project collection back to localStorage.
     * @param {object} dbData - The object containing all projects.
     * @private
     */
    _writeDb(dbData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(dbData));
        } catch (e) {
            console.error("Error writing to localStorage:", e);
        }
    }

    /**
     * Saves a specific project's data.
     * @param {string} projectId - The unique ID of the project.
     * @param {object} projectData - The vibeTree object to save.
     */
    saveProject(projectId, projectData) {
        if (!projectId) {
            console.error("Project ID cannot be empty.");
            return;
        }
        const db = this._readDb();
        db[projectId] = projectData;
        this._writeDb(db);
        console.log(`Project '${projectId}' saved.`);
    }

    /**
     * Loads a specific project's data.
     * @param {string} projectId - The ID of the project to load.
     * @returns {object|null} The project's vibeTree object or null if not found.
     */
    loadProject(projectId) {
        const db = this._readDb();
        return db[projectId] || null;
    }

    /**
     * Deletes a project from storage.
     * @param {string} projectId - The ID of the project to delete.
     */
    deleteProject(projectId) {
        const db = this._readDb();
        delete db[projectId];
        this._writeDb(db);
        console.log(`Project '${projectId}' deleted.`);
    }

    /**
     * Lists the IDs of all saved projects.
     * @returns {string[]} An array of project IDs.
     */
    listProjects() {
        const db = this._readDb();
        return Object.keys(db).sort();
    }

    // ---- FILE STORAGE ----

    _filesKey(projectId) {
        return this.filesKeyPrefix + (projectId || '');
    }

    _readFiles(projectId) {
        try {
            const raw = localStorage.getItem(this._filesKey(projectId));
            return raw ? JSON.parse(raw) : {}; // { path: { isBinary, mime, data(Base64 or UTF-8), size } }
        } catch (e) {
            console.error('Error reading files from localStorage:', e);
            return {};
        }
    }

    _writeFiles(projectId, filesObj) {
        try {
            localStorage.setItem(this._filesKey(projectId), JSON.stringify(filesObj));
        } catch (e) {
            console.error('Error writing files to localStorage:', e);
        }
    }

    listFiles(projectId) {
        const files = this._readFiles(projectId);
        return Object.keys(files).sort();
    }

    getFileMeta(projectId, path) {
        const files = this._readFiles(projectId);
        return files[path] || null;
    }

    async saveTextFile(projectId, path, text) {
        path = path.replace(/^\/+/, '');
        const files = this._readFiles(projectId);
        files[path] = {
            isBinary: false,
            mime: this._guessMime(path) || 'text/plain',
            data: text, // store plain text
            size: text.length
        };
        this._writeFiles(projectId, files);
    }

    async saveBinaryFile(projectId, path, uint8, mime = 'application/octet-stream') {
        path = path.replace(/^\/+/, '');
        const files = this._readFiles(projectId);
        // Store as base64 for persistence
        const b64 = this._uint8ToBase64(uint8);
        files[path] = {
            isBinary: true,
            mime,
            data: b64,
            size: uint8.byteLength
        };
        this._writeFiles(projectId, files);
    }

    deleteFile(projectId, path) {
        const files = this._readFiles(projectId);
        delete files[path];
        this._writeFiles(projectId, files);
    }

    async readTextFile(projectId, path) {
        const files = this._readFiles(projectId);
        const meta = files[path];
        if (!meta) throw new Error('File not found: ' + path);
        if (meta.isBinary) throw new Error('Cannot read binary file as text: ' + path);
        return meta.data;
    }

    async getFileBlob(projectId, path) {
        const files = this._readFiles(projectId);
        const meta = files[path];
        if (!meta) throw new Error('File not found: ' + path);
        if (meta.isBinary) {
            const u8 = this._base64ToUint8(meta.data);
            return new Blob([u8], { type: meta.mime || 'application/octet-stream' });
        } else {
            return new Blob([meta.data], { type: meta.mime || 'text/plain' });
        }
    }

    async readFileRaw(projectId, path) {
        const files = this._readFiles(projectId);
        const meta = files[path];
        if (!meta) throw new Error('File not found: ' + path);
        if (meta.isBinary) {
            return this._base64ToUint8(meta.data);
        } else {
            return new TextEncoder().encode(meta.data);
        }
    }

    async renameFile(projectId, fromPath, toPath) {
        const files = this._readFiles(projectId);
        if (!files[fromPath]) throw new Error('Source file not found: ' + fromPath);
        if (files[toPath]) throw new Error('Destination already exists: ' + toPath);
        files[toPath] = files[fromPath];
        delete files[fromPath];
        this._writeFiles(projectId, files);
    }

    // For ZIP export: return content as string/Uint8Array based on binary flag
    readFileForExport(projectId, path) {
        const files = this._readFiles(projectId);
        const meta = files[path];
        if (!meta) return '';
        if (meta.isBinary) {
            return this._base64ToUint8(meta.data);
        } else {
            return meta.data;
        }
    }

    _uint8ToBase64(u8) {
        let binary = '';
        const len = u8.byteLength;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(u8[i]);
        return btoa(binary);
    }

    _base64ToUint8(b64) {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    _guessMime(filename) {
        const ext = filename.toLowerCase().split('.').pop();
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
            case 'avif': return 'image/avif';
            case 'ico': return 'image/x-icon';
            case 'bmp': return 'image/bmp';
            case 'mp3': return 'audio/mpeg';
            case 'wav': return 'audio/wav';
            case 'ogg': return 'audio/ogg';
            case 'mp4': return 'video/mp4';
            case 'webm': return 'video/webm';
            case 'txt': return 'text/plain';
            default: return 'application/octet-stream';
        }
    }
}