import { DataBase } from './database.js';

// IMPORTANT: Replace with your actual Google Apps Script Web App URL.
const API_URL = 'https://script.google.com/macros/s/AKfycbxBad6yXegVN4np1lAVXpuK7z_Jx9grEifIsn_hEFlphgeOGBwyg_L0dNWsenLnl-gS/exec';
const db = new DataBase(API_URL);

// NEW: Auth elements
const authOverlay = document.getElementById('auth-overlay');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginErrorEl = document.getElementById('login-error');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupErrorEl = document.getElementById('signup-error');
const signupSuccessEl = document.getElementById('signup-success');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const userDisplay = document.getElementById('user-display');
const logoutButton = document.getElementById('logout-button');

// Main app container (assuming your main content is wrapped in a <main> tag or similar)
const appContainer = document.querySelector('main'); 

// NEW: Monkey-patching component library functionality onto the db instance.
// In a real application, these methods would be part of the DataBase class.
const COMPONENT_LIBRARY_KEY = '_vibe_component_library';

db.getComponentLibrary = function() {
    try {
        const libraryStr = localStorage.getItem(COMPONENT_LIBRARY_KEY);
        return libraryStr ? JSON.parse(libraryStr) : {};
    } catch (e) {
        console.error("Failed to load component library:", e);
        return {};
    }
};

db.saveComponentLibrary = function(library) {
    try {
        localStorage.setItem(COMPONENT_LIBRARY_KEY, JSON.stringify(library));
    } catch (e) {
        console.error("Failed to save component library:", e);
    }
};

db.listComponents = function() {
    return Object.values(this.getComponentLibrary());
};

db.getComponent = function(componentId) {
    return this.getComponentLibrary()[componentId] || null;
};

db.saveComponent = function(component) {
    const library = this.getComponentLibrary();
    library[component.id] = component;
    this.saveComponentLibrary(library);
};

db.deleteComponent = function(componentId) {
    const library = this.getComponentLibrary();
    delete library[componentId];
    this.saveComponentLibrary(library);
};


window.db = db; // Make db globally accessible if needed for debugging

const previewContainer = document.getElementById('website-preview');
const editorContainer = document.getElementById('vibe-editor');
const toggleInspectButton = document.getElementById('toggle-inspect-button');

/* NEW: Undo/Redo buttons */
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// Start Page elements (now a tab with id 'start')
const startPage = document.getElementById('start');
const projectPromptInput = document.getElementById('project-prompt-input');
const generateProjectButton = document.getElementById('generate-project-button');
const startPageGenerationOutput = document.getElementById('start-page-generation-output');
const generationStatusText = document.getElementById('generation-status-text');
const liveCodeOutput = document.getElementById('live-code-output');

// New Start Page elements
const newProjectIdInput = document.getElementById('new-project-id-input');
const projectListContainer = document.getElementById('project-list');
const noProjectsMessage = document.getElementById('no-projects-message');
const newProjectContainer = document.getElementById('new-project-container');
const startIterativeBuildButton = document.getElementById('start-iterative-build-button');


// Full code display (now in a tab)
const fullCodeEditor = document.getElementById('full-code-editor');
const updateTreeFromCodeButton = document.getElementById('update-tree-from-code-button');

// Search elements
const searchInput = document.getElementById('search-input');
const findNextButton = document.getElementById('find-next-button');
const findPrevButton = document.getElementById('find-prev-button');
const searchResultsCount = document.getElementById('search-results-count');

// NEW: AI Editor Search elements
const aiEditorSearchInput = document.getElementById('ai-editor-search-input');
const aiEditorSearchButton = document.getElementById('ai-editor-search-button');

// File upload elements
const htmlFileInput = document.getElementById('html-file-input');
const uploadHtmlButton = document.getElementById('upload-html-button');
// NEW: ZIP upload elements
const zipFileInput = document.getElementById('zip-file-input');
const uploadZipButton = document.getElementById('upload-zip-button');
// NEW: Download ZIP element
const downloadZipButton = document.getElementById('download-zip-button');

// API Settings Elements
const aiProviderSelect = document.getElementById('ai-provider-select');
const geminiSettingsContainer = document.getElementById('gemini-settings-container');
const geminiModelSelect = document.getElementById('gemini-model-select');
const geminiApiKeyContainer = document.getElementById('gemini-api-key-container');
const nscaleApiKeyContainer = document.getElementById('nscale-api-key-container');
const apiKeyInput = document.getElementById('api-key-input'); // Gemini
const saveApiKeyButton = document.getElementById('save-api-key-button');
const apiKeyStatus = document.getElementById('api-key-status');
const nscaleApiKeyInput = document.getElementById('nscale-api-key-input');
const saveNscaleApiKeyButton = document.getElementById('save-nscale-api-key-button');
const nscaleApiKeyStatus = document.getElementById('nscale-api-key-status');

// Agent elements
const agentPromptInput = document.getElementById('agent-prompt-input');
const runAgentSingleTaskButton = document.getElementById('run-agent-single-task-button'); // Renamed
const startIterativeSessionButton = document.getElementById('start-iterative-session-button'); // New
const agentOutput = document.getElementById('agent-output');
const agentTabButton = document.querySelector('.tab-button[data-tab="agent"]'); // More specific selector

// New Iterative Session elements
const iterativeSessionUI = document.getElementById('iterative-session-ui');
const iterativePlanDisplay = document.getElementById('iterative-plan-display');
const iterativeControls = document.getElementById('iterative-controls');
const acceptContinueButton = document.getElementById('accept-continue-button');
const requestChangesButton = document.getElementById('request-changes-button');
const endSessionButton = document.getElementById('end-session-button');

// Chat tab elements
const chatSystemPromptInput = document.getElementById('chat-system-prompt-input');
const chatOutput = document.getElementById('chat-output');
const chatPromptInput = document.getElementById('chat-prompt-input');
const sendChatButton = document.getElementById('send-chat-button');

// Flowchart elements
const generateFlowchartButton = document.getElementById('generate-flowchart-button');
const flowchartOutput = document.getElementById('flowchart-output');
const consoleErrorIndicator = document.getElementById('console-error-indicator');
const newProjectButton = document.getElementById('new-project-button');

// Files tab elements (NEW)
const filesTreeEl = document.getElementById('files-tree');
const filesPreviewEl = document.getElementById('files-preview');
const filesUploadInput = document.getElementById('files-upload-input');
const filesUploadButton = document.getElementById('files-upload-button');
const filesNewFolderButton = document.getElementById('files-new-folder-button');
const filesNewFileButton = document.getElementById('files-new-file-button');
const filesDownloadButton = document.getElementById('files-download-button');
const filesCopyButton = document.getElementById('files-copy-button');
const filesPasteButton = document.getElementById('files-paste-button');
const filesRenameButton = document.getElementById('files-rename-button');
const filesDeleteButton = document.getElementById('files-delete-button');

// START OF FIX: Global Agent Loader elements
const globalAgentLoader = document.getElementById('global-agent-loader');
const globalAgentStatusText = document.getElementById('global-agent-status-text');
const globalAgentProgressText = document.getElementById('global-agent-progress-text');
// END OF FIX

// NEW: Context Tab elements
const contextComponentList = document.getElementById('context-component-list');
const addNewComponentButton = document.getElementById('add-new-component-button');
const contextComponentViewer = document.getElementById('context-component-viewer');
// NEW: Context Import/Export elements
const downloadContextButton = document.getElementById('download-context-button');
const uploadContextButton = document.getElementById('upload-context-button');
const contextUploadInput = document.getElementById('context-upload-input');


// NEW: Context Component Modal elements
const contextComponentModal = document.getElementById('context-component-modal');
const closeComponentModalButton = document.getElementById('close-context-modal-button');
const saveComponentButton = document.getElementById('save-component-button');
const deleteComponentButton = document.getElementById('delete-component-button');
const componentIdInput = document.getElementById('component-id-input');
const componentNameInput = document.getElementById('component-name-input');
const componentDescriptionInput = document.getElementById('component-description-input');
const componentHtmlInput = document.getElementById('component-html-input');
const componentCssInput = document.getElementById('component-css-input');
const componentJsInput = document.getElementById('component-js-input');
const componentModalError = document.getElementById('component-modal-error');
const componentModalTitle = document.getElementById('component-modal-title');
// NEW: AI generation elements for component modal
const componentAiPromptInput = document.getElementById('component-ai-prompt-input');
const generateComponentButton = document.getElementById('generate-component-button');


// Settings Modal elements
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalButton = document.getElementById('close-settings-modal-button');
const startPageSettingsButton = document.getElementById('start-page-settings-button');
const openSettingsModalButton = document.getElementById('open-settings-modal-button');

// Add Node Modal elements
const addNodeModal = document.getElementById('add-node-modal');
const closeModalButton = document.querySelector('.close-button');
const createNodeButton = document.getElementById('create-node-button');
const addNodeParentIdInput = document.getElementById('add-node-parent-id');
const newNodeIdInput = document.getElementById('new-node-id');
const newNodeDescriptionInput = document.getElementById('new-node-description');
const newNodeTypeInput = document.getElementById('new-node-type');
const addNodeError = document.getElementById('add-node-error');
// NEW: Hidden fields for inspector-based adding
const addNodeTargetIdInput = document.getElementById('add-node-target-id');
const addNodePositionInput = document.getElementById('add-node-position');


// Edit Node Modal elements
const editNodeModal = document.getElementById('edit-node-modal');
const closeEditNodeModalButton = document.getElementById('close-edit-node-modal-button');
const editNodeIdInput = document.getElementById('edit-node-id');
const editNodeTypeInput = document.getElementById('edit-node-type');
const editNodeDescriptionInput = document.getElementById('edit-node-description');
const editNodeCodeInput = document.getElementById('edit-node-code');
const saveEditNodeButton = document.getElementById('save-edit-node-button');
const editNodeError = document.getElementById('edit-node-error');
const aiImproveDescriptionButton = document.getElementById('ai-improve-description-button');
const saveAsComponentButton = document.getElementById('save-as-component-button');

// START OF FIX: Global Agent Loader functions
/**
 * Shows and updates the global agent status loader.
 * @param {string} status - The main status message (e.g., "Agent is working...").
 * @param {string} [progress=''] - Optional progress text (e.g., "Step 1/5").
 */
function showGlobalAgentLoader(status, progress = '') {
    if (!globalAgentLoader) return;
    globalAgentStatusText.textContent = status;
    globalAgentProgressText.textContent = progress;
    globalAgentLoader.classList.add('visible');
}

/**
 * Updates the text of an already visible global agent loader.
 * @param {string} status - The new main status message.
 * @param {string} [progress=''] - The new progress text.
 */
function updateGlobalAgentLoader(status, progress = '') {
    if (!globalAgentLoader || !globalAgentLoader.classList.contains('visible')) {
        // If it's not visible, just show it with the new text
        showGlobalAgentLoader(status, progress);
        return;
    }
    globalAgentStatusText.textContent = status;
    globalAgentProgressText.textContent = progress;
}

/**
 * Hides the global agent status loader.
 */
function hideGlobalAgentLoader() {
    if (!globalAgentLoader) return;
    globalAgentLoader.classList.remove('visible');
}
// END OF FIX

// --- On-page Console Logging ---
const consoleOutput = document.getElementById('console-output');
let currentLogGroup = consoleOutput; // For console.group support

/**
 * Creates an interactive, styled HTML element from a serialized log argument.
 * @param {object} arg - The serialized argument from the iframe proxy.
 * @returns {Node} A DOM node representing the argument.
 */
function createLogElement(arg) {
    if (arg === null) return createStyledSpan('null', 'console-null');
    if (arg === undefined) return createStyledSpan('undefined', 'console-undefined');

    const el = document.createElement('span');
    switch (arg.type) {
        case 'string':
            el.className = 'console-string';
            el.textContent = `"${arg.value}"`;
            break;
        case 'number':
        case 'boolean':
        case 'symbol':
            el.className = `console-${arg.type}`;
            el.textContent = arg.value;
            break;
        case 'function':
            el.className = 'console-function';
            el.textContent = `ƒ ${arg.value}`;
            break;
        case 'dom':
            el.className = 'console-dom';
            el.textContent = `<${arg.tagName.toLowerCase()}${arg.id ? '#' + arg.id : ''}${arg.classes ? '.' + arg.classes.join('.') : ''}>`;
            break;
        case 'array':
        case 'object':
            return createCollapsible(arg);
        default:
            el.textContent = String(arg); // Fallback
    }
    return el;
}

function createStyledSpan(text, className) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
}

function createCollapsible(data) {
    const details = document.createElement('details');
    details.className = 'console-collapsible';
    const summary = document.createElement('summary');
    
    let preview;
    if (data.type === 'array') {
        preview = `Array(${data.value.length}) [${data.value.slice(0, 5).map(v => v.preview).join(', ')}${data.value.length > 5 ? ', ...' : ''}]`;
    } else {
        preview = `{${Object.entries(data.value).slice(0, 3).map(([k, v]) => `${k}: ${v.preview}`).join(', ')}${Object.keys(data.value).length > 3 ? ', ...' : ''}}`;
    }
    summary.textContent = preview;
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'console-collapsible-content';
    
    for (const [key, value] of Object.entries(data.value)) {
        const row = document.createElement('div');
        row.className = 'console-kv-pair';
        const keyEl = createStyledSpan(`${key}: `, 'console-key');
        const valueEl = createLogElement(value);
        row.appendChild(keyEl);
        row.appendChild(valueEl);
        content.appendChild(row);
    }
    
    details.appendChild(content);
    return details;
}

// START OF FIX: Helper function to stringify serialized console args for the AI.
/**
 * Converts serialized console arguments back into a string for AI analysis.
 * @param {Array<object>} args - The array of serialized arguments.
 * @returns {string} A string representation of the error/log.
 */
function stringifySerializedArgs(args) {
    let fullMessage = '';
    for (const arg of args) {
        if (arg.type === 'object' && arg.value && arg.value.message && arg.value.name) {
            // Handle serialized Error objects
            let errorString = `${arg.value.name.value}: ${arg.value.message.value}`;
            if (arg.value.stack) {
                // The stack is often the most useful part
                errorString = arg.value.stack.value;
            }
            fullMessage += errorString + ' ';
        } else if (typeof arg === 'string') {
            fullMessage += arg + ' ';
        } else if (arg && arg.value !== undefined) {
            fullMessage += String(arg.value) + ' ';
        }
    }
    return fullMessage.trim();
}
// END OF FIX

function renderConsoleMessage(level, args) {
    if (!consoleOutput) return;

    const msgEl = document.createElement('div');
    msgEl.className = `console-message log-type-${level}`;
    const timestamp = `[${new Date().toLocaleTimeString()}] `;
    msgEl.appendChild(document.createTextNode(timestamp));

    args.forEach(arg => {
        msgEl.appendChild(createLogElement(arg));
        msgEl.appendChild(document.createTextNode(' ')); // Add space between args
    });

    // START OF FIX: Add a "Fix with AI" button to error messages.
    if (level === 'error') {
        const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
        if (keyIsAvailable) {
            const fixButton = document.createElement('button');
            fixButton.className = 'action-button fix-error-button';
            fixButton.style.marginLeft = '10px';
            fixButton.style.verticalAlign = 'middle';
            fixButton.textContent = 'Fix with AI';
            const errorMessage = stringifySerializedArgs(args);
            fixButton.onclick = () => handleFixError(errorMessage, fixButton);
            msgEl.appendChild(fixButton);
        }
    }
    // END OF FIX

    currentLogGroup.appendChild(msgEl);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function handleConsoleCommand(level, args) {
    switch (level) {
        case 'group':
        case 'groupCollapsed':
            const group = document.createElement('div');
            group.className = 'console-group';
            const details = document.createElement('details');
            details.open = (level === 'group');
            const summary = document.createElement('summary');
            const label = args.length > 0 ? args.map(arg => arg.value || '').join(' ') : 'Console group';
            summary.textContent = label;
            details.appendChild(summary);
            const content = document.createElement('div');
            content.className = 'console-group-content';
            details.appendChild(content);
            group.appendChild(details);
            currentLogGroup.appendChild(group);
            currentLogGroup = content;
            break;
        case 'groupEnd':
            if (currentLogGroup.parentElement && currentLogGroup.parentElement.closest('.console-group')) {
                currentLogGroup = currentLogGroup.parentElement.closest('.console-group').parentElement;
            } else {
                currentLogGroup = consoleOutput;
            }
            break;
        case 'clear':
            consoleOutput.innerHTML = '';
            currentLogGroup = consoleOutput;
            break;
        case 'error':
            consoleErrorIndicator.classList.add('active');
            renderConsoleMessage(level, args);
            break;
        default:
            renderConsoleMessage(level, args);
    }
}

// START OF FIX: This block proxies the main window's console to the on-page display.
const originalConsole = { ...console };

const MAX_DEPTH = 5;
/**
 * Serializes an argument from the main window for the on-page console.
 * This is a copy of the function used inside the iframe to ensure compatibility.
 * @param {*} arg The argument to serialize.
 * @param {number} depth The current recursion depth.
 * @param {WeakSet} seen A set of seen objects to prevent circular references.
 * @returns {object} A serialized representation of the argument.
 */
function serializeArg(arg, depth = 0, seen = new WeakSet()) {
    if (arg === undefined) return { type: 'undefined', value: 'undefined', preview: 'undefined' };
    if (arg === null) return { type: 'null', value: 'null', preview: 'null' };
    const type = typeof arg;
    if (['string', 'number', 'boolean', 'symbol', 'bigint'].includes(type)) {
        return { type, value: arg.toString(), preview: arg.toString() };
    }
    if (type === 'function') {
        const signature = arg.toString().match(/^(async\s+)?function\s*\*?\s*([a-zA-Z0-9_$]+)?\s*\([^)]*\)/)?.[0] || 'function()';
        return { type: 'function', value: signature, preview: 'ƒ' };
    }
    if (seen.has(arg)) {
        return { type: 'string', value: '[Circular]', preview: '[Circular]' };
    }
    if (arg instanceof HTMLElement) {
        return { type: 'dom', tagName: arg.tagName, id: arg.id, classes: [...arg.classList], preview: '<...>' };
    }
    if (arg instanceof Error) {
        const value = { name: arg.name, message: arg.message };
        if (arg.stack) value.stack = arg.stack;
        const serializedValue = serializeArg(value, depth + 1, seen);
        return { type: 'object', value: serializedValue.value, preview: '{Error}' };
    }
    if (depth > MAX_DEPTH) {
        return { type: 'string', value: Array.isArray(arg) ? '[Array]' : '[Object]', preview: '...' };
    }
    seen.add(arg);
    if (Array.isArray(arg)) {
        return { type: 'array', value: arg.map(item => serializeArg(item, depth + 1, seen)), preview: '[]' };
    }
    if (type === 'object') {
        const obj = {};
        for (const key in arg) {
            if (Object.prototype.hasOwnProperty.call(arg, key)) {
                obj[key] = serializeArg(arg[key], depth + 1, seen);
            }
        }
        return { type: 'object', value: obj, preview: '{}' };
    }
    return { type: 'string', value: String(arg), preview: String(arg) };
}


// Override the main window's console methods
Object.keys(originalConsole).forEach(level => {
    if (typeof originalConsole[level] === 'function') {
        console[level] = (...args) => {
            // 1. Call the original native method so logs still appear in the browser's devtools
            originalConsole[level](...args);
            
            // 2. Serialize arguments and send them to our on-page console
            try {
                const serializedArgs = args.map(arg => serializeArg(arg));
                handleConsoleCommand(level, serializedArgs);
            } catch (e) {
                // If our proxy fails, log the failure to the real console.
                originalConsole.error('Vibe console proxy failed:', e);
            }
        };
    }
});

// These global error handlers will now automatically use our proxied `console.error`
window.addEventListener('error', e => console.error(e.error || e.message));
window.addEventListener('unhandledrejection', e => console.error('Unhandled promise rejection:', e.reason));
// END OF FIX

let currentProjectId = null;
let agentConversationHistory = [];
let chatConversationHistory = [];
let iframeErrors = [];

// NEW: State for iterative agent sessions
let iterativeSessionState = {
    status: 'idle',
    overallGoal: '',
    plan: [],
    currentStepIndex: -1,
    history: []
};

// --- AI Configuration ---
let currentAIProvider = 'gemini'; // 'gemini' or 'nscale'
let geminiApiKey = '';
let nscaleApiKey = '';
const NSCALE_API_ENDPOINT = 'https://inference.api.nscale.com/v1/chat/completions';
const NSCALE_MODEL = 'Qwen/Qwen3-235B-A22B';
// --- End AI Configuration ---

let vibeTree = {
  id: "whole-page",
  description: "A new, empty website.",
  type: "container",
  children: [
    {
      id: "head-content",
      type: "head",
      description: "Content for the <head> tag, including <title>, <meta>, and <link> tags. CSS from 'css' nodes will be added automatically.",
      code: `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`
    }
  ]
};

const initialVibeTree = JSON.parse(JSON.stringify(vibeTree));

/* =========================
   UNDO / REDO STATE & API
   ========================= */
let historyState = {
    undo: [],
    redo: [],
    lastSnapshotSerialized: JSON.stringify(vibeTree),
    isRestoring: false
};

function deepCloneTree(tree) {
    return JSON.parse(JSON.stringify(tree));
}

function serializeTree(tree) {
    return JSON.stringify(tree);
}

/**
 * Record current vibeTree as a snapshot on the undo stack.
 * Clears the redo stack. Avoids pushing identical consecutive snapshots.
 */
function recordHistory(label = '') {
    if (historyState.isRestoring) return; // do not record when restoring
    const current = serializeTree(vibeTree);
    if (current === historyState.lastSnapshotSerialized) {
        return; // no changes since last snapshot
    }
    // Push previous snapshot to undo
    historyState.undo.push(historyState.lastSnapshotSerialized);
    // Clear redo because we branched
    historyState.redo = [];
    // Update last snapshot
    historyState.lastSnapshotSerialized = current;
    updateUndoRedoUI();
    if (label) originalConsole.info(`History recorded: ${label}`);
}

/**
 * Reset history stacks around a (newly) loaded project.
 * Sets baseline snapshot to current vibeTree, with empty undo/redo stacks.
 */
function resetHistory() {
    historyState.undo = [];
    historyState.redo = [];
    historyState.lastSnapshotSerialized = serializeTree(vibeTree);
    historyState.isRestoring = false;
    updateUndoRedoUI();
}

/**
 * Undo to the previous snapshot, moving current snapshot to redo.
 */
function doUndo() {
    if (historyState.undo.length === 0) return;
    const current = serializeTree(vibeTree);
    const previous = historyState.undo.pop();
    historyState.redo.push(current);
    historyState.isRestoring = true;
    try {
        vibeTree = JSON.parse(previous);
        historyState.lastSnapshotSerialized = previous;
        refreshAllUI();
        autoSaveProject();
    } finally {
        historyState.isRestoring = false;
        updateUndoRedoUI();
    }
}

/**
 * Redo to the next snapshot, moving current snapshot to undo.
 */
function doRedo() {
    if (historyState.redo.length === 0) return;
    const current = serializeTree(vibeTree);
    const next = historyState.redo.pop();
    historyState.undo.push(current);
    historyState.isRestoring = true;
    try {
        vibeTree = JSON.parse(next);
        historyState.lastSnapshotSerialized = next;
        refreshAllUI();
        autoSaveProject();
    } finally {
        historyState.isRestoring = false;
        updateUndoRedoUI();
    }
}

function updateUndoRedoUI() {
    if (undoButton) undoButton.disabled = historyState.undo.length === 0;
    if (redoButton) redoButton.disabled = historyState.redo.length === 0;
}

/* =========================
   END UNDO / REDO
   ========================= */

// ===================================
// --- NEW AUTHENTICATION LOGIC ---
// ===================================

/**
 * Updates the entire UI based on the current authentication state.
 */
async function updateAuthUI() {
    if (db.isLoggedIn()) {
        if (authOverlay) authOverlay.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block'; // Or whatever your display property is
        if (logoutButton) logoutButton.style.display = 'block';
        if (userDisplay) {
            // A more robust solution would decode the JWT, but for this simple case,
            // we'll store the email from the login response.
            const userEmail = sessionStorage.getItem('vibe-user-email');
            userDisplay.textContent = userEmail || 'Logged In';
        }
        
        // This is the point where we initialize the rest of the app for a logged-in user.
        await populateProjectList();
        resetToStartPage();

    } else {
        if (authOverlay) authOverlay.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (userDisplay) userDisplay.textContent = '';
        
        // Clear any project data if the user logs out
        currentProjectId = null;
        vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
        resetHistory();
    }
}

/**
 * Handles the login form submission.
 * @param {Event} event
 */
async function handleLogin(event) {
    event.preventDefault();
    loginErrorEl.textContent = '';
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    const button = loginForm.querySelector('button');
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const response = await db.login(email, password);
        if (response && response.token) {
            // The db class already sets the auth token.
            // Store email for display purposes.
            sessionStorage.setItem('vibe-user-email', email);
            await updateAuthUI();
        } else {
            throw new Error(response.message || 'Login failed.');
        }
    } catch (error) {
        loginErrorEl.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Login';
    }
}

/**
 * Handles the signup form submission.
 * @param {Event} event
 */
/**
 * Handles the signup form submission.
 * @param {Event} event
 */
async function handleSignup(event) {
    event.preventDefault();
    signupErrorEl.textContent = '';
    signupSuccessEl.textContent = '';
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    const button = signupForm.querySelector('button');
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const response = await db.signup(email, password);
        // A successful response should be an object.
        // The DataBase class should throw an error for failed signups.
        if (response) {
            signupSuccessEl.textContent = 'Signup successful! Please log in.';
            signupForm.reset();
            // Switch to login view after successful signup
            signupView.style.display = 'none';
            loginView.style.display = 'block';
        } else {
            // This case handles unexpected scenarios where signup might return
            // a non-error, but also non-successful, response.
            throw new Error('Received an invalid response from the server.');
        }
    } catch (error) {
        // The 'error' object here will be a proper Error instance,
        // which always has a .message property.
        signupErrorEl.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Sign Up';
    }
}

/**
 * Handles user logout.
 */
function handleLogout() {
    db.logout();
    sessionStorage.removeItem('vibe-user-email');
    updateAuthUI();
    console.log("User logged out.");
}

/**
 * Sets up initial authentication state and event listeners.
 */
function initializeAuth() {
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            signupView.style.display = 'block';
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupView.style.display = 'none';
            loginView.style.display = 'block';
        });
    }

    updateAuthUI();
}
// ===============================
// --- END AUTHENTICATION LOGIC ---
// ===============================

function updateApiKeyVisibility() {
    if (currentAIProvider === 'gemini') {
        geminiSettingsContainer.style.display = 'block';
        nscaleApiKeyContainer.style.display = 'none';
    } else if (currentAIProvider === 'nscale') {
        geminiSettingsContainer.style.display = 'none';
        nscaleApiKeyContainer.style.display = 'block';
    }
}

function updateApiStatusDisplays() {
    // Gemini Status
    if (geminiApiKey) {
        apiKeyInput.value = geminiApiKey;
        apiKeyStatus.textContent = 'Gemini API Key loaded from storage.';
        apiKeyStatus.style.color = '#98c379';
    } else {
        apiKeyStatus.textContent = 'No Gemini API Key found.';
        apiKeyStatus.style.color = '#e5c07b';
    }
    // nscale Status
    if (nscaleApiKey) {
        nscaleApiKeyInput.value = nscaleApiKey;
        nscaleApiKeyStatus.textContent = 'nscale API Key loaded from storage.';
        nscaleApiKeyStatus.style.color = '#98c379';
    } else {
        nscaleApiKeyStatus.textContent = 'No nscale API Key found.';
        nscaleApiKeyStatus.style.color = '#e5c07b';
    }
}

function updateFeatureAvailability() {
    let keyIsAvailable = false;
    if (currentAIProvider === 'gemini') {
        keyIsAvailable = !!geminiApiKey;
    } else if (currentAIProvider === 'nscale') {
        keyIsAvailable = !!nscaleApiKey;
    }

    // Disable/enable all update buttons based on key presence for the selected provider
    document.querySelectorAll('.update-button').forEach(button => {
        button.disabled = !keyIsAvailable;
    });
    runAgentSingleTaskButton.disabled = !keyIsAvailable;
    startIterativeSessionButton.disabled = !keyIsAvailable;
    sendChatButton.disabled = !keyIsAvailable;
    updateTreeFromCodeButton.disabled = !keyIsAvailable;
    uploadHtmlButton.disabled = !keyIsAvailable;
    generateFlowchartButton.disabled = !keyIsAvailable;
    generateProjectButton.disabled = !keyIsAvailable;
    startIterativeBuildButton.disabled = !keyIsAvailable;
    aiEditorSearchButton.disabled = !keyIsAvailable; // NEW: Control AI editor search availability
    // The "Fix with AI" buttons are generated dynamically, so we can't disable them here.
    // Instead, we check for the key when the button is created.
}

function initializeApiSettings() {
    currentAIProvider = localStorage.getItem('aiProvider') || 'gemini';
    geminiApiKey = localStorage.getItem('geminiApiKey');
    nscaleApiKey = localStorage.getItem('nscaleApiKey');
    
    aiProviderSelect.value = currentAIProvider;
    geminiModelSelect.value = localStorage.getItem('geminiModel') || 'gemini-1.5-flash-latest';

    updateApiStatusDisplays();
    updateApiKeyVisibility();
    updateFeatureAvailability();
    
    console.log(`AI Provider set to: ${currentAIProvider}`);
    console.log(`Gemini model set to: ${geminiModelSelect.value}`);
}

function handleProviderChange() {
    currentAIProvider = aiProviderSelect.value;
    localStorage.setItem('aiProvider', currentAIProvider);
    console.log(`Switched AI Provider to: ${currentAIProvider}`);
    updateApiKeyVisibility();
    updateFeatureAvailability();
}

function saveGeminiApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('geminiApiKey', key);
        geminiApiKey = key;
        console.log('Gemini API Key saved!');
    } else {
        localStorage.removeItem('geminiApiKey');
        geminiApiKey = '';
        console.warn('Gemini API Key cleared.');
    }
    updateApiStatusDisplays();
    updateFeatureAvailability();
    autoSaveProject();
}

function saveNscaleApiKey() {
    const key = nscaleApiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('nscaleApiKey', key);
        nscaleApiKey = key;
        console.log('nscale API Key saved!');
    } else {
        localStorage.removeItem('nscaleApiKey');
        nscaleApiKey = '';
        console.warn('nscale API Key cleared.');
    }
    updateApiStatusDisplays();
    updateFeatureAvailability();
    autoSaveProject();
}

function findNodeById(id, node = vibeTree) {
    if (node.id === id) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeById(id, child);
            if (found) return found;
        }
    }
    return null;
}

// FIX: Added the "Save as Component" button directly into the Vibe Editor UI for applicable nodes.
function renderEditor(node) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `vibe-node type-${node.type} collapsed`;
    nodeEl.dataset.nodeId = node.id;

    const isContainer = node.type === 'container' || node.type === 'html';
    const showCodeButton = node.type !== 'container';
    const isHeadNode = node.type === 'head';
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isSaveable = ['html', 'css', 'js-function'].includes(node.type);

    nodeEl.innerHTML = `
        <div class="vibe-node-header">
            <span class="drag-handle" title="Drag to reorder" draggable="true">✥</span>
            <span class="id">
                ${hasChildren ? `<button class="collapse-toggle" aria-expanded="false" title="Expand/Collapse Children">▶</button>` : '<span class="collapse-placeholder"></span>'}
                ${node.id}
            </span>
            <span class="type">${node.type}</span>
        </div>
        <div class="vibe-node-content">
            <textarea class="description-input" rows="3" placeholder="Describe the purpose of this component...">${node.description}</textarea>
            <div class="button-group">
                <button class="update-button" data-id="${node.id}">Update Vibe</button>
                ${isContainer ? `<button class="add-child-button" data-id="${node.id}">+ Add Child</button>` : ''}
                ${isSaveable ? `<button class="save-as-component-button" data-id="${node.id}" title="Save as reusable component">⊕ Save</button>` : ''}
                ${(showCodeButton || isHeadNode) ? `<button class="toggle-code-button" data-id="${node.id}">View Code</button>` : ''}
                ${(showCodeButton || isHeadNode) ? `<button class="save-code-button" data-id="${node.id}" style="display: none;">Save Code</button>` : ''}
            </div>
            ${(showCodeButton || isHeadNode) ? `<textarea class="code-editor-display" id="editor-${node.id}" style="display: none;"></textarea>` : ''}
        </div>
    `;

    if (hasChildren) {
        const childrenEl = document.createElement('div');
        childrenEl.className = 'children collapsed';
        node.children.forEach(child => {
            childrenEl.appendChild(renderEditor(child));
        });
        nodeEl.appendChild(childrenEl);
    }

    return nodeEl;
}

async function toggleCodeEditor(event) {
    const button = event.target;
    const nodeId = button.dataset.id;
    const codeTextarea = document.getElementById(`editor-${nodeId}`);
    const saveButton = button.nextElementSibling; // The "Save Code" button
    if (!codeTextarea) return;

    const isVisible = codeTextarea.style.display === 'block';

    if (isVisible) {
        codeTextarea.style.display = 'none';
        if (saveButton && saveButton.classList.contains('save-code-button')) {
            saveButton.style.display = 'none';
        }
        button.textContent = 'View Code';
    } else {
        const node = findNodeById(nodeId);
        if (node) {
            codeTextarea.value = node.code || '';
        } else {
            console.error(`Node not found for editor: ${nodeId}`);
            codeTextarea.value = `Error: Could not find code for node ${nodeId}.`;
        }
        
        codeTextarea.style.display = 'block';
        if (saveButton && saveButton.classList.contains('save-code-button')) {
            saveButton.style.display = 'inline-block';
        }
        button.textContent = 'Hide Code';
    }
}

async function handleSaveCode(event) {
    const button = event.target;
    const nodeId = button.dataset.id;
    const node = findNodeById(nodeId);
    const codeTextarea = document.getElementById(`editor-${nodeId}`);

    if (!node || !codeTextarea) {
        console.error(`handleSaveCode failed: Could not find node or textarea for ID ${nodeId}`);
        return;
    }

    const newCode = codeTextarea.value;
    if (node.code === newCode) {
        console.log(`Code for node ${nodeId} has not changed. Hiding editor.`);
        const toggleButton = button.parentElement.querySelector('.toggle-code-button');
        if (toggleButton) toggleButton.click();
        return;
    }

    // Record state before change
    recordHistory(`Save code for ${nodeId}`);

    node.code = newCode;
    console.log(`Code for node '${nodeId}' was manually saved.`);
    
    const originalText = button.textContent;
    button.textContent = 'Saved!';
    button.disabled = true;

    applyVibes();

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        const toggleButton = button.parentElement.querySelector('.toggle-code-button');
        if (toggleButton) toggleButton.click();
    }, 1500);
    autoSaveProject();
}

async function handleUpdate(event) {
    const button = event.target;
    const nodeId = button.dataset.id;
    const node = findNodeById(nodeId);
    const textarea = button.parentElement.previousElementSibling;
    const newDescription = textarea.value;

    if (!node) {
        console.error(`handleUpdate failed: Could not find node with ID ${nodeId}`);
        return;
    }
    if (node.description === newDescription && node.type !== 'container' && node.type !== 'head') return;

    // Record state before change
    recordHistory(`Update description for ${nodeId}`);

    button.disabled = true;
    button.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    console.log(`Updating node: ${nodeId}`);
    
    node.description = newDescription;

    try {
        // If the node is a container, we regenerate its entire subtree.
        // This is a powerful way to redesign a whole section.
        if (node.type === 'container') {
            console.log(`Regenerating complete subtree for container: ${node.id}`);
            const newChildren = await generateCompleteSubtree(node);
            node.children = newChildren;
            refreshAllUI();
        } else {
            // For leaf nodes (html, css, js, head), trigger the new systemic update logic.
            // This allows the AI to modify dependencies and create new nodes.
            console.log(`Triggering systemic update for node: ${node.id}`);
            
            const systemPrompt = getAgentSystemPrompt();
            const fullTreeString = JSON.stringify(vibeTree, null, 2);
            const userPrompt = `The user has updated the description for component "${node.id}" to: "${newDescription}". Analyze this change and generate a plan to update the entire website accordingly.

Full Vibe Tree context:
\`\`\`json
${fullTreeString}
\`\`\``;

            const rawResponse = await callAI(systemPrompt, userPrompt, true);
            const agentDecision = JSON.parse(rawResponse);
            
            executeAgentPlan(agentDecision, (message, type) => {
                const cleanMessage = message.replace(/<strong>|<\/strong>/g, '');
                const logFunc = console[type] || console.log;
                logFunc(`[UpdateEngine] ${cleanMessage}`);
            });
        }
        
        switchToTab('preview');

    } catch (error) {
        console.error("Failed to update vibes:", error);
        alert(`An error occurred during the update: ${error.message}. Check the console for details.`);
    } finally {
        button.disabled = false;
        button.innerHTML = 'Update Vibe';
    }
}

function refreshAllUI() {
    console.log('Refreshing entire UI: Vibe Editor, Website Preview, and Full Code.');

    // Preserve the expanded/collapsed state of the editor nodes
    const expandedNodeStates = new Map(); // nodeId -> { content: boolean, children: boolean }
    if (editorContainer) {
        editorContainer.querySelectorAll('.vibe-node').forEach(nodeEl => {
            const nodeId = nodeEl.dataset.nodeId;
            if (nodeId) {
                const isContentCollapsed = nodeEl.classList.contains('collapsed');
                const childrenEl = nodeEl.querySelector(':scope > .children');
                const isChildrenCollapsed = childrenEl ? childrenEl.classList.contains('collapsed') : true;
                expandedNodeStates.set(nodeId, { content: !isContentCollapsed, children: !isChildrenCollapsed });
            }
        });
    }

    editorContainer.innerHTML = '';
    editorContainer.appendChild(renderEditor(vibeTree));

    // Restore the expanded/collapsed state
    if (expandedNodeStates.size > 0) {
        expandedNodeStates.forEach((state, nodeId) => {
            const nodeEl = editorContainer.querySelector(`.vibe-node[data-node-id="${nodeId}"]`);
            if (nodeEl) {
                if (state.content) {
                    nodeEl.classList.remove('collapsed');
                }
                const childrenEl = nodeEl.querySelector(':scope > .children');
                const toggleBtn = nodeEl.querySelector(':scope > .vibe-node-header .collapse-toggle');
                if (childrenEl && toggleBtn) {
                    if (state.children) {
                        childrenEl.classList.remove('collapsed');
                        toggleBtn.setAttribute('aria-expanded', 'true');
                        toggleBtn.textContent = '▼';
                    }
                }
            }
        });
    }

    addEventListeners(); // Re-add listeners to new buttons
    applyVibes();
    // Invalidate flowchart since code has changed
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Code has changed. Click "Generate Flowchart" to create an updated diagram.</div>';

    // Update the full code view if it's the active tab
    if (document.getElementById('code').classList.contains('active')) {
        showFullCode();
    }
    
    renderFileTree();
    updateUndoRedoUI();
    autoSaveProject();
}


/**
 * Gets the component library formatted as a string for AI injection.
 * @returns {string} The formatted context string.
 */
function getComponentContextForAI() {
    const components = db.listComponents();
    if (components.length === 0) {
        return '';
    }

    let contextString = "\n\n--- AVAILABLE CUSTOM COMPONENTS ---\n";
    contextString += "Here is a library of pre-defined components. When a user's request matches the description of one of these, you should use its code as a starting point or insert it directly.\n\n";

    components.forEach(comp => {
        contextString += `### Component: ${comp.name} (ID: ${comp.id})\n`;
        contextString += `**Description:** ${comp.description}\n`;
        if (comp.html) {
            contextString += "**HTML:**\n```html\n" + comp.html + "\n```\n";
        }
        if (comp.css) {
            contextString += "**CSS:**\n```css\n" + comp.css + "\n```\n";
        }
        if (comp.javascript) {
            contextString += "**JavaScript:**\n```javascript\n" + comp.javascript + "\n```\n";
        }
        contextString += "---\n";
    });

    return contextString;
}

async function callAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    console.log('--- Calling AI ---');
    
    let fileContext = '';
    if (currentProjectId) {
        try {
            const files = await db.listFiles(currentProjectId);
            if (files.length > 0) {
                const textFiles = [];
                for (const path of files) {
                    // This assumes a method that can check if a file is binary without fetching content.
                    // Since our db wrapper doesn't have it, we'll try to fetch text and catch errors.
                    try {
                        const content = await db.readTextFile(currentProjectId, path);
                        textFiles.push(`--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``);
                    } catch (e) {
                         // Likely a binary file, skip it.
                    }
                }
                if (textFiles.length > 0) {
                    fileContext = "Here is the full context of the user's current project files. Use this context to understand and edit the code as requested.\n\n" + textFiles.join('\n\n') + '\n\n';
                }
            }
        } catch (e) {
            console.warn("Failed to build file context for AI:", e);
        }
    }

    const componentContext = getComponentContextForAI();
    const augmentedSystemPrompt = systemPrompt + componentContext;
    const augmentedUserPrompt = fileContext + userPrompt;

    // Use originalConsole to avoid feedback loops if our console proxy has issues
    originalConsole.log('--- AI Call Details ---');
    originalConsole.log('System Prompt:', augmentedSystemPrompt);
    originalConsole.log('User Prompt:', augmentedUserPrompt);


    if (currentAIProvider === 'nscale') {
        if (streamCallback) {
            console.warn("Streaming is not supported for nscale provider in this implementation.");
        }
        return callNscaleAI(augmentedSystemPrompt, augmentedUserPrompt, forJson);
    }
    return callGeminiAI(augmentedSystemPrompt, augmentedUserPrompt, forJson, streamCallback);
}


async function callGeminiAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    if (!geminiApiKey) {
        throw new Error("Gemini API key is not set.");
    }

    const model = geminiModelSelect.value;
    const useStreaming = typeof streamCallback === 'function';
    const endpoint = useStreaming 
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${geminiApiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: userPrompt }]
            }
        ],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {}
    };

    if (forJson && !useStreaming) {
        requestBody.generationConfig.responseMimeType = "application/json";
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error Response:", errorText);
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
        }

        if (useStreaming) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = '';
            let buffer = '';

            const processChunk = (chunk) => {
                if (chunk.trim().startsWith('"text":')) {
                    try {
                        const jsonChunk = `{${chunk}}`;
                        const parsed = JSON.parse(jsonChunk);
                        const textChunk = parsed.text;
                        fullResponseText += textChunk;
                        streamCallback(textChunk);
                    } catch (e) {
                       // Ignore parsing errors on incomplete chunks
                    }
                }
            };
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    processChunk(buffer);
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                
                let boundary = buffer.indexOf('\n');
                while (boundary !== -1) {
                    const line = buffer.substring(0, boundary).trim();
                    buffer = buffer.substring(boundary + 1);
                    processChunk(line);
                    boundary = buffer.indexOf('\n');
                }
            }
            
            originalConsole.log('Full Raw Gemini Response (Streamed)', fullResponseText);
            return fullResponseText;
        }

        const data = await response.json();
        console.log('--- Gemini Response Received ---');
        originalConsole.log('Raw Gemini Response', JSON.stringify(data, null, 2));


        if (!data.candidates || data.candidates.length === 0) {
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                const reason = data.promptFeedback.blockReason;
                let details = 'No additional details.';
                if (data.promptFeedback.safetyRatings) {
                    details = data.promptFeedback.safetyRatings
                        .map(r => `${r.category}: ${r.probability}`)
                        .join(', ');
                }
                throw new Error(`Gemini API request was blocked due to safety settings. Reason: ${reason}. Details: ${details}`);
            }
             throw new Error('Invalid response from Gemini API: The response contained no valid candidates.');
        }

        const candidate = data.candidates[0];

        if (candidate.finishReason && candidate.finishReason !== "STOP") {
            throw new Error(`Gemini API stopped generating text prematurely. Reason: ${candidate.finishReason}`);
        }

        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0 || typeof candidate.content.parts[0].text !== 'string') {
             throw new Error('Invalid response structure from Gemini API: The response candidate is missing the expected text content.');
        }

        const content = candidate.content.parts[0].text;
        
        if (document.getElementById('code').classList.contains('active')) {
            showFullCode();
        }
        return content;
    } catch(e) {
        console.error("Error calling Gemini AI:", e);
        try {
            const errorJson = JSON.parse(e.message);
            if(errorJson.error && errorJson.error.message) {
                 throw new Error(`Gemini AI communication failed: ${errorJson.error.message}`);
            }
        } catch (parseError) {
             // Not a JSON error, re-throw original.
        }
        throw new Error(`Gemini AI communication failed: ${e.message}`);
    }
}

/**
 * Generates the child nodes for a given container node based on its description.
 * This is the core generation logic for creating websites from a prompt.
 * @param {object} parentNode - The container node (e.g., vibeTree or a section).
 * @param {function|null} streamCallback - An optional callback to handle streamed text chunks.
 * @returns {Promise<Array>} A promise that resolves to an array of child vibe nodes.
 */
async function generateCompleteSubtree(parentNode, streamCallback = null) {
    console.log(`Generating subtree for parent: ${parentNode.id}`);

    const systemPrompt = `You are an expert system that designs a complete website component hierarchy based on a high-level description. Your task is to generate a valid JSON array of "vibe nodes" that represent the children of a given container.

**INPUT:** A JSON object containing the parent container's ID and description.

**OUTPUT:** A single, valid JSON array of vibe node objects. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON array itself. The output MUST be a JSON array [] and nothing else.

**JSON SCHEMA & RULES for each node in the array:**

1.  **Component Node Object:** Each object in the array must have:
    *   id: A unique, descriptive, kebab-case identifier (e.g., "main-header", "feature-section-styles").
    *   type: "head", "html", "css", "javascript", or "js-function". Only the root "whole-page" container should have a "head" child.
    *   description: A concise, one-sentence summary of what this specific component does.
    *   code: The raw code for the component. For HTML, this can be a container tag with its children defined in a nested array.
    *   children: (Optional) For html nodes that act as containers, provide a nested array of child component nodes.
    *   selector: (For html nodes) A CSS selector for the element this node should be attached to.
    *   position: (For html nodes) Where to insert the HTML relative to the selector. Can be "beforeend" (inside, at the end) or "afterend" (after the element).

2.  **HIERARCHICAL HTML (CRITICAL):**
    *   Structure the page logically. Create parent html nodes for sections like headers, main content, footers, etc.
    *   The code for a container HTML node should be the element itself (e.g., <header id="main-header"></header>). Its content goes into its children array.
    *   **Selector & Position Logic:**
        *   An HTML node's position is ALWAYS relative to its siblings within the SAME children array.
        *   The **first HTML node** in any given children array should use its parent's ID as the selector (e.g., "#${parentNode.id}") and position: "beforeend" to be placed inside it.
        *   **Every subsequent HTML node** in that same children array must use the ID of the *immediately preceding* HTML sibling as its selector (e.g., "#main-header") and position: "afterend".
    *   You MUST assign a unique id attribute to every HTML element that is used as a container or as a selector target.

3.  **HEAD NODE:**
    *   If the parent is "whole-page", you MUST generate a single "head" node with id: "head-content". This node should contain standard meta tags and a relevant <title>.

4.  **GLOBAL SCOPE:** CSS nodes should generally be children of the "whole-page" container to apply globally.

5.  **JAVASCRIPT FUNCTIONS:** For interactivity, create individual nodes with \`type: "js-function"\` for each piece of logic. Give them descriptive IDs like \`function-handle-form-submission\`. The code should be the full function definition. Use a \`javascript\` node for any global setup code that isn't a function.

**EXAMPLE of a valid response for a simple portfolio page:**
[
  {
    "id": "head-content",
    "type": "head",
    "description": "Metadata for the page including title and meta tags.",
    "code": "<meta charset=\"UTF-8\">\n<title>My Page</title>"
  },
  {
    "id": "main-header",
    "type": "html",
    "description": "The main header container for the page.",
    "code": "<header id=\"main-header\"></header>",
    "selector": "#${parentNode.id}",
    "position": "beforeend",
    "children": [
        {
          "id": "header-title",
          "type": "html",
          "description": "The main H1 title in the header.",
          "code": "<h1>My Page</h1>",
          "selector": "#main-header",
          "position": "beforeend"
        }
    ]
  },
  {
    "id": "page-styles",
    "type": "css",
    "description": "Basic styles for the header.",
    "code": "header { background-color: #333; color: white; }"
  },
  {
    "id": "function-handle-click",
    "type": "js-function",
    "description": "Handles clicks on the header.",
    "code": "function handleClick() { console.log('Header clicked'); }"
  }
]`;

    const userPrompt = `Generate the child components for the following parent container:
{
    "parentId": "${parentNode.id}",
    "newDescription": "${parentNode.description}"
}`;

    const rawResponse = await callAI(systemPrompt, userPrompt, true, streamCallback);
    
    try {
        let jsonResponse = rawResponse.trim();
        
        const jsonMatch = jsonResponse.match(/```(json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch && jsonMatch[2]) {
            jsonResponse = jsonMatch[2].trim();
        }

        const startIndex = jsonResponse.indexOf('[');
        const endIndex = jsonResponse.lastIndexOf(']');

        if (startIndex !== -1 && endIndex > startIndex) {
            jsonResponse = jsonResponse.substring(startIndex, endIndex + 1);
        }

        const childrenArray = JSON.parse(jsonResponse);
        if (!Array.isArray(childrenArray)) {
            throw new Error("AI did not return a valid JSON array.");
        }
        console.log("Successfully parsed generated subtree from AI.");
        
        return childrenArray;
    } catch (e) {
        console.error("Failed to parse subtree JSON from AI:", rawResponse);
        throw new Error(`AI returned invalid JSON for the component structure. Original response logged in console. Error: ${e.message}`);
    }
}

async function callNscaleAI(systemPrompt, userPrompt, forJson = false) {
    if (!nscaleApiKey) {
        throw new Error("nscale API key is not set.");
    }
    
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    try {
        const response = await fetch(NSCALE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nscaleApiKey}`
            },
            body: JSON.stringify({
                model: NSCALE_MODEL,
                messages: messages,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`nscale API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('--- nscale Response Received ---');

        if (!data.choices ||!Array.isArray(data.choices) || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error('Invalid response structure from nscale API.');
        }

        let content = data.choices[0].message.content;
        originalConsole.log('Raw nscale Response', content);

        
        if (forJson) {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                content = jsonMatch[1];
            }
        }

        return content;

    } catch (e) {
        console.error("Error calling nscale AI:", e);
        throw new Error(`nscale AI communication failed: ${e.message}`);
    }
}

/**
 * Parses a full HTML string into a vibeTree structure using the DOMParser API.
 * @param {string} fullCode The full HTML content as a string.
 * @returns {object} A vibeTree object.
 */
function parseHtmlToVibeTree(fullCode) {
    console.log("Parsing HTML to Vibe Tree using client-side logic.");
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullCode, 'text/html');

    const vibeTree = {
        id: "whole-page",
        type: "container",
        description: `A website with the title: "${doc.title || 'Untitled'}".`,
        children: []
    };

    const htmlNodes = [];
    const cssNodes = [];
    const jsNodes = [];
    let headNode = null;

    // 1. Process <head> content
    const headContent = [];
    doc.head.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE && !['STYLE', 'SCRIPT'].includes(child.tagName)) {
            headContent.push(child.outerHTML);
        }
    });

    headNode = {
        id: 'head-content',
        type: 'head',
        description: 'Contains metadata for the page like title and meta tags.',
        code: headContent.join('\n')
    };

    // 2. Process CSS from <style> tags
    const styleTags = Array.from(doc.head.querySelectorAll('style'));
    styleTags.forEach((styleTag, index) => {
        if (styleTag.textContent.trim()) {
            cssNodes.push({
                id: `page-styles-${index + 1}`,
                type: 'css',
                description: 'CSS styles defined in a <style> tag in the document head.',
                code: styleTag.textContent.trim()
            });
        }
    });

    // 3. Process HTML from direct children of <body>
    const bodyChildren = Array.from(doc.body.children);
    let lastElementId = null;

    bodyChildren.forEach((element, index) => {
        if (element.tagName.toLowerCase() === 'script') return;
      
        let elementId = element.id;
        if (!elementId) {
            elementId = `${element.tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-section-${index}`;
            element.id = elementId;
        }

        const htmlNode = {
            id: `html-${elementId}`,
            type: 'html',
            description: `The <${element.tagName.toLowerCase()}> element with ID #${elementId}.`,
            code: element.outerHTML,
            selector: index === 0 ? '#website-preview' : `#${lastElementId}`,
            position: index === 0 ? 'beforeend' : 'afterend'
        };
        htmlNodes.push(htmlNode);
        lastElementId = elementId;
    });

    // 4. Process JS from <script> tags
    const scriptTags = Array.from(doc.querySelectorAll('script'));
    scriptTags.forEach((scriptTag, index) => {
        if (!scriptTag.src && scriptTag.textContent.trim()) {
            let remainingCode = scriptTag.textContent;

            // Regex to find "function functionName(...) { ... }"
            const functionRegex = /((async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\([\s\S]*?\)\s*\{[\s\S]*?\})/g;
            let match;
            
            while ((match = functionRegex.exec(scriptTag.textContent)) !== null) {
                const functionCode = match[0];
                const functionName = match[3];

                const kebabCaseName = functionName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

                jsNodes.push({
                    id: `function-${kebabCaseName}-${index}`,
                    type: 'js-function',
                    description: `The ${functionName} function.`,
                    code: functionCode
                });

                remainingCode = remainingCode.replace(functionCode, '');
            }

            // The rest of the code is considered global
            remainingCode = remainingCode.trim();
            if (remainingCode) {
                 const iifeMatch = remainingCode.match(/^\s*\(\s*function\s*\(\s*\)\s*\{([\s\S]*?)\s*\}\s*\(\s*\);?\s*$/);
                 if (iifeMatch) remainingCode = iifeMatch[1].trim();
                 
                 if (remainingCode) {
                    jsNodes.push({
                        id: `global-script-${index + 1}`,
                        type: 'javascript',
                        description: 'Global-scope JavaScript logic and event listeners.',
                        code: remainingCode
                    });
                 }
            }
        }
    });
    
    vibeTree.children = [headNode, ...htmlNodes, ...cssNodes, ...jsNodes];
    
    console.log("Client-side parsing complete. Generated Vibe Tree:", vibeTree);
    return vibeTree;
}

async function decomposeCodeIntoVibeTree(fullCode) {
    console.log("Starting code decomposition process...");
    const systemPrompt = `You are an expert system that deconstructs a complete HTML file into a specific hierarchical JSON structure called a "vibe tree". Your task is to accurately parse the provided code and represent it as a nested hierarchy of components.

**INPUT:** A single string containing the full source code of a webpage (HTML, CSS in <style> tags, JS in <script> tags).

**OUTPUT:** A single, valid JSON object representing the vibe tree. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON structure itself. The final output must be only the raw JSON.

**JSON SCHEMA & RULES:**

1.  **Root Object:** The top-level object must be a "container" node.
    *   id: "whole-page"
    *   type: "container"
    *   description: A high-level, one-sentence summary of the entire page's purpose.
    *   children: An array of component nodes.

2.  **Component Nodes:** Each object in a children array must have:
    *   id: A unique, descriptive, kebab-case identifier (e.g., "main-header", "feature-section-styles").
    *   type: "head", "html", "css", "javascript", or "js-function".
    *   description: A concise, one-sentence summary of what this specific component does.
    *   code: The raw code for the component. Do not include <style> or <script> tags. For parent HTML nodes, this should be the outer wrapper element. For the 'head' node, this is the combined content of all meta, title, and link tags.
    *   children: (Optional) A nested array of child component nodes.

3.  **HIERARCHICAL HTML DECOMPOSITION (CRITICAL):**
    *   Identify logical containers in the HTML (header, main, section, complex divs) and represent them as parent html nodes with a nested children array.
    *   The direct children of the <body> tag should be the top-level nodes in the root's children array.
    *   For an HTML node that is a container (e.g., <header id="main-header">...</header>), its code should be the container element itself, often just the opening and closing tags (e.g., <header id="main-header"></header>). The actual content (h1, nav) should be defined in its children array.
    *   **Selector & Position Logic:**
        *   An HTML node's position is ALWAYS relative to its siblings within the SAME children array.
        *   The first HTML node in any given children array should use its parent's ID as the selector (e.g., "#PARENT_ID") and position: "beforeend" to be placed inside it.
        *   Every subsequent HTML node in that same children array must use the ID of the *immediately preceding* HTML sibling as its selector (e.g., "#immediate-previous-sibling-id") and position: "afterend".
    *   You MUST correctly assign unique IDs to HTML elements used as containers or selector targets.

4.  **CSS DECOMPOSITION:**
    *   Extract content of <style> tags into \`css\` nodes.

5.  **JAVASCRIPT FUNCTION DECOMPOSITION (CRITICAL):**
    *   Instead of one large \`javascript\` node, break down script content.
    *   Place any code in the global scope (variable declarations, top-level event listeners) into a single node with \`type: "javascript"\`, and a descriptive \`id\` like \`"global-event-listeners"\`.
    *   Extract each JavaScript function (\`function doSomething() {...}\` or \`const doSomething = () => {...}\`) into its own separate node with \`type: "js-function"\`.
    *   The \`id\` for a function node should be \`function-\` followed by the function name in kebab-case (e.g., \`"id": "function-do-something"\`).
    *   The \`code\` property for a \`js-function\` node must contain the entire function definition.

6.  **HEAD DECOMPOSITION:**
    *   Create a single node with type: "head" and id: "head-content".
    *   Its code property should be a string containing all <meta>, <title>, and <link> tags from the original HTML's <head>.

**FULL OUTPUT EXAMPLE (with nesting):**
{
  "id": "whole-page",
  "type": "container",
  "description": "A webpage with a header and main content.",
  "children": [
    {
      "id": "head-content",
      "type": "head",
      "description": "Metadata for the page including title and meta tags.",
      "code": "<meta charset=\"UTF-8\">\n<title>My Page</title>"
    },
    {
      "id": "main-header",
      "type": "html",
      "description": "The main header container for the page.",
      "code": "<header id=\"main-header\"></header>",
      "selector": "#whole-page",
      "position": "beforeend",
      "children": [
        {
          "id": "header-title",
          "type": "html",
          "description": "The main H1 title in the header.",
          "code": "<h1>My Page</h1>",
          "selector": "#main-header",
          "position": "beforeend"
        }
      ]
    },
    {
      "id": "page-styles",
      "type": "css",
      "description": "Basic styles for the header.",
      "code": "header { background-color: #333; color: white; }"
    },
    {
      "id": "function-update-header",
      "type": "js-function",
      "description": "Updates the header text.",
      "code": "function updateHeader() { document.getElementById('header-title').querySelector('h1').textContent = 'New Title'; }"
    }
  ]
}
`;

    const userPrompt = `Decompose the following code into the vibe tree JSON structure:\n\n\`\`\`html\n${fullCode}\n\`\`\``;

    const rawResponse = await callAI(systemPrompt, userPrompt, true);

    // Helper: try progressively more aggressive JSON extraction strategies
    function tryParseVarious(text) {
        try { return JSON.parse(text.trim()); } catch {}
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fence && fence[1]) {
            try { return JSON.parse(fence[1]); } catch {}
        }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch {}
        }
        return null;
    }

    try {
        const parsed = tryParseVarious(rawResponse);

        if (!parsed) {
            console.warn("AI did not return valid JSON. Falling back to client-side HTML parser.");
            return parseHtmlToVibeTree(fullCode);
        }

        if (!parsed.id || parsed.type !== 'container' || !Array.isArray(parsed.children)) {
            console.warn("AI JSON missing required root container fields. Falling back to client-side parser.");
            return parseHtmlToVibeTree(fullCode);
        }

        console.log("Successfully parsed decomposed vibe tree from AI.");
        return parsed;
    } catch (e) {
        console.warn("Failed to parse vibe tree JSON from AI, using client-side parser.", e);
        return parseHtmlToVibeTree(fullCode);
    }
}

async function processCodeAndRefreshUI(fullCode) {
    if (!fullCode.trim()) {
        alert("The code is empty. There is nothing to process.");
        return;
    }

    const buttonsToDisable = [updateTreeFromCodeButton, uploadHtmlButton];
    const originalButtonTexts = new Map();
    buttonsToDisable.forEach(b => {
        if (!b) return;
        originalButtonTexts.set(b, b.innerHTML);
        b.disabled = true;
        b.innerHTML = 'Processing... <div class="loading-spinner"></div>';
    });

    
    try {
        recordHistory('Process full code (replace tree)');
        const newVibeTree = await decomposeCodeIntoVibeTree(fullCode);
        vibeTree = newVibeTree;
        refreshAllUI();
        console.log("Update from code complete. UI refreshed.");
        switchToTab('preview');
        historyState.lastSnapshotSerialized = serializeTree(vibeTree);
        autoSaveProject();
    } catch (error) {
        console.error("Failed to update vibes from full code:", error);
        alert(`An error occurred during processing: ${error.message}. Check the console for details.`);
    } finally {
        buttonsToDisable.forEach(b => {
            if (!b) return;
            b.disabled = false;
            b.innerHTML = originalButtonTexts.get(b);
        });
    }
}

async function handleUpdateTreeFromCode() {
    const fullCode = fullCodeEditor.value;
    await processCodeAndRefreshUI(fullCode);
}

async function handleFileUpload() {
    const file = htmlFileInput.files[0];
    if (!file) {
        alert("Please select an HTML file to upload.");
        return;
    }
    console.log(`File selected: ${file.name} (${file.type})`);
    if (!file.type.includes('html')) {
        console.warn(`Warning: Selected file is not text/html. Proceeding anyway.`);
    }

    const baseId = file.name.replace(/\.(html|htm)$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    let projectId = baseId || `html-project-${Date.now()}`;
    const existing = await db.listProjects();
    let suffix = 1;
    while (existing.includes(projectId)) {
        projectId = `${baseId}-${suffix++}`;
    }
    currentProjectId = projectId;
    console.log(`New project ID assigned from file: ${currentProjectId}`);

    const reader = new FileReader();
    
    reader.onload = async (event) => {
        const fileContent = event.target.result;
        fullCodeEditor.value = fileContent;
        await processCodeAndRefreshUI(fileContent);
        await autoSaveProject();
        console.log(`HTML project '${currentProjectId}' imported and processed.`);
    };

    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("An error occurred while reading the file.");
    };

    reader.readAsText(file);
}

/**
 * Utility: Guess a MIME type from a filename.
 */
function guessMimeType(filename) {
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

/**
 * Utility: Normalize and resolve paths like a browser would for relative URLs, using a base path.
 */
function resolveZipPath(basePath, relativePath) {
    if (!relativePath || /^[a-z]+:\/\//i.test(relativePath) || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) return relativePath;
    if (relativePath.startsWith('/')) {
        return relativePath.replace(/^\//, '');
    }

    const baseParts = basePath.split('/').filter(Boolean);
    const relParts = relativePath.split('/');

    for (const part of relParts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
            baseParts.pop();
        } else {
            baseParts.push(part);
        }
    }
    return baseParts.join('/');
}

/**
 * Utility: Replace url(...) refs inside CSS text using a provided resolver callback.
 */
function rewriteCssUrls(cssText, resolverCb) {
    return cssText.replace(/url\(([^)]+)\)/g, (match, p1) => {
        let raw = p1.trim().replace(/^['"]|['"]$/g, '');
        const resolved = resolverCb(raw);
        if (!resolved) return match;
        const hadQuotes = /^['"].*['"]$/.test(p1.trim());
        return `url(${hadQuotes ? `"${resolved}"` : resolved})`;
    });
}

/**
 * Build a DOM from index.html text, inline local CSS/JS from ZIP, and rewrite asset URLs to blob: URLs.
 */
async function buildCombinedHtmlFromZip(jszip, indexPath) {
    const fileNames = Object.keys(jszip.files);
    const blobUrlMap = {};

    for (const name of fileNames) {
        const file = jszip.files[name];
        if (file.dir) continue;
        const mime = guessMimeType(name);
        const content = await file.async('uint8array');
        const blob = new Blob([content], { type: mime });
        try {
            blobUrlMap[name] = URL.createObjectURL(blob);
        } catch (e) {
            console.warn(`Failed to create object URL for ${name}:`, e);
        }
    }

    const indexText = await jszip.files[indexPath].async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(indexText, 'text/html');
    const indexDir = indexPath.includes('/') ? indexPath.split('/').slice(0, -1).join('/') + '/' : '';

    const linkNodes = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'));
    for (const link of linkNodes) {
        const href = link.getAttribute('href').trim();
        const resolved = resolveZipPath(indexDir, href);
        if (jszip.files[resolved]) {
            const cssTextRaw = await jszip.files[resolved].async('text');
            const cssDir = resolved.includes('/') ? resolved.split('/').slice(0, -1).join('/') + '/' : '';
            const cssText = rewriteCssUrls(cssTextRaw, (assetPath) => {
                const assetResolved = resolveZipPath(cssDir, assetPath);
                return blobUrlMap[assetResolved] || assetPath;
            });
            const style = doc.createElement('style');
            style.textContent = cssText;
            link.replaceWith(style);
        }
    }

    const scriptNodes = Array.from(doc.querySelectorAll('script[src]'));
    for (const s of scriptNodes) {
        const src = s.getAttribute('src').trim();
        const resolved = resolveZipPath(indexDir, src);
        if (jszip.files[resolved]) {
            const code = await jszip.files[resolved].async('text');
            const inline = doc.createElement('script');
            inline.textContent = code;
            if (s.type) inline.type = s.type;
            s.replaceWith(inline);
        }
    }

    const assetAttrTargets = [
        { selector: 'img[src], video[src], audio[src], source[src]', attr: 'src' },
        { selector: 'link[rel~="icon"], link[rel~="apple-touch-icon"], link[rel~="manifest"]', attr: 'href' }
    ];
    for (const { selector, attr } of assetAttrTargets) {
        doc.querySelectorAll(selector).forEach(node => {
            const val = node.getAttribute(attr);
            if (!val) return;
            const resolved = resolveZipPath(indexDir, val.trim());
            if (blobUrlMap[resolved]) node.setAttribute(attr, blobUrlMap[resolved]);
        });
    }

    doc.querySelectorAll('img[srcset]').forEach(img => {
        const srcset = img.getAttribute('srcset') || '';
        const rewritten = srcset.split(',').map(s => s.trim()).filter(Boolean).map(part => {
            const [urlPart, sizePart] = part.split(/\s+/);
            const resolved = resolveZipPath(indexDir, urlPart);
            return (blobUrlMap[resolved] || urlPart) + (sizePart ? ` ${sizePart}` : '');
        }).join(', ');
        img.setAttribute('srcset', rewritten);
    });

    return { combinedHtml: new XMLSerializer().serializeToString(doc), blobUrlMap };
}

/**
 * Import a ZIP multi-file project.
 */
async function handleZipUpload() {
    const file = zipFileInput.files && zipFileInput.files[0];
    if (!file) {
        alert("Please select a ZIP file to upload.");
        return;
    }
    console.log(`ZIP selected: ${file.name}`);

    const originalText = uploadZipButton.innerHTML;
    uploadZipButton.disabled = true;
    uploadZipButton.innerHTML = 'Processing ZIP... <div class="loading-spinner"></div>';

    try {
        if (!window.JSZip) throw new Error('JSZip library failed to load.');

        const jszip = await JSZip.loadAsync(file);
        const htmlCandidates = Object.keys(jszip.files).filter(n => !jszip.files[n].dir && n.toLowerCase().endsWith('index.html'));
        if (htmlCandidates.length === 0) throw new Error('No index.html found in ZIP.');
        htmlCandidates.sort((a, b) => a.split('/').length - b.split('/').length);
        const indexPath = htmlCandidates[0];
        console.log(`Using entry point: ${indexPath}`);

        const { combinedHtml } = await buildCombinedHtmlFromZip(jszip, indexPath);
        fullCodeEditor.value = combinedHtml;

        const derivedId = file.name.replace(/\.zip$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        let projectId = derivedId || `zip-project-${Date.now()}`;
        const existing = await db.listProjects();
        let suffix = 1;
        while (existing.includes(projectId)) {
            projectId = `${derivedId}-${suffix++}`;
        }
        currentProjectId = projectId;

        console.log('Decomposing ZIP website into Vibe Tree...');
        const newTree = await decomposeCodeIntoVibeTree(combinedHtml);

        vibeTree = newTree;
        await db.saveProject(currentProjectId, vibeTree);

        resetHistory();
        refreshAllUI();
        switchToTab('preview');
        console.log(`ZIP project '${currentProjectId}' imported successfully.`);

    } catch (e) {
        console.error('ZIP import failed:', e);
        alert(`Failed to import ZIP: ${e.message}`);
    } finally {
        uploadZipButton.disabled = false;
        uploadZipButton.innerHTML = originalText;
    }
}

function generateFullCodeString(tree = vibeTree) {
    let cssContent = '';
    let jsContent = '';
    let htmlContent = '';
    let headContent = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;

    // Helper to recursively build HTML from nodes.
    const buildHtmlRecursive = (nodes) => {
        let currentHtml = '';
        if (!nodes) return currentHtml;

        const htmlNodes = nodes.filter(n => n.type === 'html');
        
        htmlNodes.forEach(node => {
            let finalCode = node.code;
            // Inject a data-attribute for the inspector to find the node.
            // This is more reliable than relying on the 'id' attribute.
            if (finalCode && finalCode.trim().startsWith('<')) {
                 finalCode = finalCode.replace(
                    /<([a-zA-Z0-9\-]+)/, 
                    `<$1 data-vibe-node-id="${node.id}"`
                );
            }

            if (node.children && node.children.length > 0) {
                 const innerHtml = buildHtmlRecursive(node.children);
                 const wrapper = document.createElement('div');
                 wrapper.innerHTML = finalCode; // Use the modified code
                 if(wrapper.firstElementChild) {
                     wrapper.firstElementChild.innerHTML = innerHtml;
                     currentHtml += wrapper.innerHTML + '\n';
                 } else {
                     currentHtml += finalCode + '\n'; // Fallback
                 }
            } else {
                 currentHtml += finalCode + '\n'; // Use the modified code
            }
        });
        return currentHtml;
    };

    function traverse(node, currentTree) {
        switch (node.type) {
            case 'head':
                if (node.code) headContent = node.code;
                break;
            case 'css':
                cssContent += node.code + '\n\n';
                break;
            case 'javascript':
                jsContent += node.code + '\n\n';
                break;
            case 'js-function':
                jsContent += node.code + '\n\n';
                break;
        }
        if (node.children) {
            node.children.forEach(child => traverse(child, currentTree));
        }
    }

    // Traverse the provided tree to get CSS, JS, and head content
    traverse(tree, tree);
    
    // Build the HTML content from the tree structure
    if (tree.children) {
        htmlContent = buildHtmlRecursive(tree.children);
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${headContent.trim()}
    <style>
${cssContent.trim()}
    </style>
</head>
<body>

${htmlContent.trim()}

    <script>
(function() {
${jsContent.trim()}
})();
    <\/script>
</body>
</html>`;
}

/**
 * Build the HTML body content from the current vibe tree (without inlining CSS/JS).
 */
function buildHtmlBodyFromTree(tree = vibeTree) {
    const buildHtmlRecursive = (nodes) => {
        let currentHtml = '';
        if (!nodes) return currentHtml;

        const htmlNodes = nodes.filter(n => n.type === 'html');
        htmlNodes.sort((a, b) => {
            if (a.position === 'beforeend' && b.position === 'afterend') return -1;
            if (a.position === 'afterend' && b.position === 'beforeend') return 1;
            return 0;
        });
        
        htmlNodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                const innerHtml = buildHtmlRecursive(node.children);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = node.code;
                if (wrapper.firstElementChild) {
                    wrapper.firstElementChild.innerHTML = innerHtml;
                    currentHtml += wrapper.innerHTML + '\n';
                } else {
                    currentHtml += node.code + '\n';
                }
            } else {
                currentHtml += node.code + '\n';
            }
        });
        return currentHtml;
    };

    let htmlContent = '';
    if (tree.children) {
        htmlContent = buildHtmlRecursive(tree.children);
    }
    return htmlContent.trim();
}

/**
 * Extract head content from the tree or return default.
 */
function getHeadContentFromTree(tree = vibeTree) {
    let headContent = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;
    // Depth-first search for head node at top level or nested
    const stack = [tree];
    while (stack.length) {
        const node = stack.pop();
        if (node.type === 'head' && node.code) {
            headContent = node.code;
            break;
        }
        if (node.children) {
            for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
        }
    }
    return headContent;
}

/**
 * Build arrays of CSS and JS nodes in document order.
 */
function collectCssJsNodes(tree = vibeTree) {
    const cssNodes = [];
    const jsNodes = [];
    const traverse = (node) => {
        if (node.type === 'css' && node.code) cssNodes.push(node);
        if ((node.type === 'javascript' || node.type === 'js-function') && node.code) {
            jsNodes.push(node);
        }
        if (node.children) node.children.forEach(traverse);
    };
    traverse(tree);
    return { cssNodes, jsNodes };
}

/**
 * Sanitize a node id to a safe file name.
 */
function nodeIdToFileName(id, ext) {
    const base = (id || 'file').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
    return `${base}.${ext}`;
}

/**
 * Assemble a multi-file project bundle from the current vibe tree.
 * Returns an object { files: Map<path,string>, indexHtml: string }
 */
async function assembleMultiFileBundle(tree = vibeTree) {
    const headContent = getHeadContentFromTree(tree);
    const bodyContent = buildHtmlBodyFromTree(tree);
    const { cssNodes, jsNodes } = collectCssJsNodes(tree);

    // Build link/script tags
    const cssLinks = cssNodes.map(n => `<link rel="stylesheet" href="assets/css/${nodeIdToFileName(n.id, 'css')}">`).join('\n    ');
    const jsScripts = jsNodes.map(n => `<script src="assets/js/${nodeIdToFileName(n.id, 'js')}"><\/script>`).join('\n    ');

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    ${headContent.trim()}
    ${cssLinks ? '\n    ' + cssLinks : ''}
</head>
<body>

${bodyContent}

    ${jsScripts ? '\n    ' + jsScripts : ''}
</body>
</html>`;

    const files = new Map();
    files.set('index.html', indexHtml);
    files.set('project.json', JSON.stringify(tree, null, 2));

    cssNodes.forEach(n => {
        const path = `assets/css/${nodeIdToFileName(n.id, 'css')}`;
        files.set(path, (n.code || '').trim() + '\n');
    });

    jsNodes.forEach(n => {
        const path = `assets/js/${nodeIdToFileName(n.id, 'js')}`;
        const code = (n.code || '').trim();
        const wrapped = `(function(){\n${code}\n})();\n`;
        files.set(path, wrapped);
    });

    try {
        const allDbAssetPaths = await db.listFiles(currentProjectId);
        for (const p of allDbAssetPaths) {
            if (!files.has(p)) {
                 // This part is tricky. We need to decide if we fetch binary or text.
                 // The database wrapper doesn't provide a way to know ahead of time.
                 // For now, we'll assume we can't add existing assets back to the bundle this way.
                 // A better `db` class would have a `readFileAsBlob` or `getFileMeta`.
            }
        }
    } catch (e) {
        console.warn('Failed adding assets to ZIP:', e);
    }

    return { files, indexHtml };
}
/**
 * Trigger browser download for a blob.
 */
function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'project.zip';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 0);
}

/**
 * Handle "Download Project ZIP" click.
 */
async function handleDownloadProjectZip() {
    try {
        if (!window.JSZip) {
            throw new Error('JSZip library failed to load.');
        }
        const { files } = await assembleMultiFileBundle(vibeTree);
        const zip = new JSZip();

        for (const [path, content] of files.entries()) {
            zip.file(path, content);
        }

        const bundledHtmlContent = generateFullCodeString(vibeTree);
        zip.file("bundle.html", bundledHtmlContent);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const fnameBase = currentProjectId || 'vibe-project';
        triggerBlobDownload(zipBlob, `${fnameBase}.zip`);
        console.log(`Project "${fnameBase}" packaged with a bundled HTML file and downloaded as ZIP.`);
    } catch (e) {
        console.error('ZIP download failed:', e);
        alert(`Failed to build ZIP: ${e.message}`);
    }
}

/**
 * Applies the current vibeTree to the preview iframe with an advanced inspector.
 */
function applyVibes() {
    try {
        iframeErrors = [];
        const doc = previewContainer.contentWindow.document;
        let html = generateFullCodeString();

        // START OF FIX: This single script handles inspector, console, and error logging
        const commsScriptText = `
<script>
(function(){
    // --- Part 1: Inspector Logic ---
    let inspectEnabled = false;
    let hoverEl = null;
    const inspectorStyles = \`.__vibe-inspect-highlight-hover{outline:2px solid #e5c07b !important;outline-offset:2px !important;box-shadow:0 0 8px rgba(229,192,123,.8) !important;cursor:pointer}.__vibe-inspect-highlight-clicked{outline:3px solid #61afef !important;outline-offset:2px !important;box-shadow:0 0 12px rgba(97,175,239,.9) !important;transition:all .5s ease-out !important}\`;
    function getNodeId(el){const c=el.closest('[data-vibe-node-id]');return c?{nodeId:c.dataset.vibeNodeId,element:c}:null}
    function ensureStyles(){if(document.getElementById('vibe-inspector-styles'))return;const s=document.createElement('style');s.id='vibe-inspector-styles';s.textContent=inspectorStyles;document.head.appendChild(s)}
    document.addEventListener('mouseover',e=>{if(!inspectEnabled)return;const t=getNodeId(e.target);if(t){if(hoverEl&&hoverEl!==t.element)hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=t.element;hoverEl.classList.add('__vibe-inspect-highlight-hover')}else if(hoverEl){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}});
    document.addEventListener('mouseout',e=>{if(hoverEl&&!hoverEl.contains(e.relatedTarget)){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}});
    document.addEventListener('click',e=>{if(!inspectEnabled)return;const t=getNodeId(e.target);if(t){e.preventDefault();e.stopPropagation();window.parent.postMessage({type:'vibe-node-click',nodeId:t.nodeId},'*');if(hoverEl)hoverEl.classList.remove('__vibe-inspect-highlight-hover');const el=t.element;el.classList.add('__vibe-inspect-highlight-clicked');setTimeout(()=>el.classList.remove('__vibe-inspect-highlight-clicked'),500)}},true);

    // --- Part 2: Console and Error Proxy Logic ---
    const MAX_DEPTH = 5;
    function serializeArg(arg, depth = 0, seen = new WeakSet()) {
        if (arg === undefined) return { type: 'undefined', value: 'undefined' };
        if (arg === null) return { type: 'null', value: 'null' };
        const type = typeof arg;
        if (['string', 'number', 'boolean', 'symbol', 'bigint'].includes(type)) {
            return { type, value: arg.toString(), preview: arg.toString() };
        }
        if (type === 'function') {
            const signature = arg.toString().match(/^(async\\s+)?function\\s*\\*?\\s*([a-zA-Z0-9_$]+)?\\s*\\([^)]*\\)/)?.[0] || 'function()';
            return { type: 'function', value: signature, preview: 'ƒ' };
        }
        if (seen.has(arg)) {
            return { type: 'string', value: '[Circular]', preview: '[Circular]' };
        }
        if (arg instanceof HTMLElement) {
            return { type: 'dom', tagName: arg.tagName, id: arg.id, classes: [...arg.classList], preview: '<...>' };
        }
        if (depth > MAX_DEPTH) {
             return { type: 'string', value: Array.isArray(arg) ? '[Array]' : '[Object]', preview: '...' };
        }
        seen.add(arg);
        if (Array.isArray(arg)) {
            return { type: 'array', value: arg.map(item => serializeArg(item, depth + 1, seen)), preview: '[]' };
        }
        if (type === 'object') {
            const obj = {};
            for (const key in arg) {
                if (Object.prototype.hasOwnProperty.call(arg, key)) {
                    obj[key] = serializeArg(arg[key], depth + 1, seen);
                }
            }
            return { type: 'object', value: obj, preview: '{}' };
        }
        return { type: 'string', value: String(arg), preview: String(arg) };
    }

    function reportError(err){
        const serialized = { message: err.message, stack: err.stack, name: err.name, __isError: true };
        window.parent.postMessage({type:'iframe-error',payload:serialized},'*');
    }
    window.addEventListener('error', e => reportError(e.error || e.message));
    window.addEventListener('unhandledrejection', e => reportError(e.reason));

    const oConsole = {...window.console};
    const counts = {};
    const timers = {};
    Object.keys(oConsole).forEach(level => {
        window.console[level] = (...args) => {
            oConsole[level](...args); // keep native behavior
            let payload = args;
            if (level === 'count') {
                const label = args[0] || 'default';
                counts[label] = (counts[label] || 0) + 1;
                payload = [\`\${label}: \${counts[label]}\`];
            } else if (level === 'countReset') {
                const label = args[0] || 'default';
                counts[label] = 0;
                payload = [\`\${label}: 0\`];
            } else if (level === 'time') {
                timers[args[0] || 'default'] = performance.now();
                return; // Do not log
            } else if (level === 'timeEnd') {
                const label = args[0] || 'default';
                const startTime = timers[label];
                if (startTime) {
                    payload = [\`\${label}: \${performance.now() - startTime} ms\`];
                    delete timers[label];
                } else {
                    payload = [\`Timer '\${label}' does not exist\`];
                    level = 'warn';
                }
            } else if (level === 'assert') {
                if (args[0]) return;
                payload = ['Assertion failed:', ...args.slice(1)];
            }
            try { window.parent.postMessage({ type: 'iframe-console', level, payload: payload.map(p => serializeArg(p)) }, '*') } catch(e) { oConsole.error('Vibe proxy error', e) }
        }
    });

    // --- Part 3: Message listener for toggling inspect ---
    window.addEventListener('message',e=>{if(e.data.type==='toggle-inspect'){inspectEnabled=e.data.enabled;if(inspectEnabled)ensureStyles();else if(hoverEl){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}}});
})();
<\/script>`;
        // END OF FIX
        
        // START OF FIX: Inject the communications script into the <head> to ensure it runs before any body content.
        // This is crucial for catching all errors, including syntax errors in the main script.
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${commsScriptText}\n</head>`);
        } else {
            // Fallback for cases where there's no head tag for some reason
            html = commsScriptText + html;
        }
        // END OF FIX

        doc.open();
        doc.write(html);
        doc.close();

        (async () => {
            const assetMap = await buildAssetUrlMap();
            injectAssetRewriterScript(doc, assetMap);
        })();
    } catch (e) {
        console.error('applyVibes failed:', e);
    }
}


function showFullCode() {
    const fullCode = generateFullCodeString();
    fullCodeEditor.value = fullCode; // Use value for textarea
    console.log('Displaying full website code.');
}

function hideFullCode() {
    // This function is no longer needed as the code view is a persistent tab.
}

// --- NEW: Vibe Editor Drag and Drop ---
let draggedNodeId = null;

function handleDragStart(event) {
    // FIX: The event target is the handle itself. Find the closest parent node.
    const targetNode = event.target.closest('.vibe-node');
    if (!targetNode) {
        event.preventDefault();
        return;
    }
    
    draggedNodeId = targetNode.dataset.nodeId;
    event.dataTransfer.setData('text/plain', draggedNodeId);
    event.dataTransfer.effectAllowed = 'move';
    
    // Defer adding class to allow browser to capture clean drag image
    setTimeout(() => {
        targetNode.classList.add('dragging');
        document.body.classList.add('is-dragging-vibe');
    }, 0);
}

function handleDragOver(event) {
    event.preventDefault(); 
    const targetNode = event.target.closest('.vibe-node');
    
    // Clear any existing indicators first
    document.querySelectorAll('.drop-indicator-before, .drop-indicator-after').forEach(el => {
        el.classList.remove('drop-indicator-before', 'drop-indicator-after');
    });

    if (!targetNode || targetNode.dataset.nodeId === draggedNodeId) {
        return; // Can't drop on itself or outside a node
    }

    const rect = targetNode.getBoundingClientRect();
    const isAfter = event.clientY > rect.top + rect.height / 2;
    
    // Apply the indicator class to show where the drop will occur
    if (isAfter) {
        targetNode.classList.add('drop-indicator-after');
    } else {
        targetNode.classList.add('drop-indicator-before');
    }
}

function handleDragLeave(event) {
    // When leaving a node, remove its indicator
    const current = event.target.closest('.vibe-node');
    if (current) {
        current.classList.remove('drop-indicator-before', 'drop-indicator-after');
    }
}

function handleDrop(event) {
    event.preventDefault();
    const targetNodeEl = event.target.closest('.vibe-node');
    
    // Clean up indicators immediately
    document.querySelectorAll('.drop-indicator-before, .drop-indicator-after').forEach(el => {
        el.classList.remove('drop-indicator-before', 'drop-indicator-after');
    });
    
    if (!targetNodeEl || !draggedNodeId || targetNodeEl.dataset.nodeId === draggedNodeId) {
        return;
    }
    
    const targetNodeId = targetNodeEl.dataset.nodeId;
    const rect = targetNodeEl.getBoundingClientRect();
    const position = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';

    // The inspector's moveNode function is repurposed here for reordering
    moveNode(draggedNodeId, targetNodeId, position);
}

function handleDragEnd() {
    // Universal cleanup for the end of a drag operation (whether dropped successfully or cancelled)
    const draggingElement = document.querySelector('.vibe-node.dragging');
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
    document.body.classList.remove('is-dragging-vibe');
    draggedNodeId = null;
}
// --- End Drag and Drop ---


function addEventListeners() {
    document.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', handleUpdate);
    });
    document.querySelectorAll('.toggle-code-button').forEach(button => {
        button.addEventListener('click', toggleCodeEditor);
    });
    document.querySelectorAll('.add-child-button').forEach(button => {
        button.addEventListener('click', handleAddChildClick);
    });
    document.querySelectorAll('.save-code-button').forEach(button => {
        button.addEventListener('click', handleSaveCode);
    });
    // FIX: Add event listener for the new "Save as Component" button in the editor
    document.querySelectorAll('.save-as-component-button').forEach(button => {
        button.addEventListener('click', handleSaveNodeAsComponentFromEditor);
    });
    document.querySelectorAll('.collapse-toggle').forEach(button => {
        button.addEventListener('click', handleCollapseToggle);
    });
    document.querySelectorAll('.vibe-node-header').forEach(header => {
        header.addEventListener('click', handleNodeContentToggle);
    });

    // NEW: Add drag-and-drop listeners to the editor container using event delegation
    if (editorContainer) {
        editorContainer.addEventListener('dragstart', handleDragStart);
        editorContainer.addEventListener('dragover', handleDragOver);
        editorContainer.addEventListener('dragleave', handleDragLeave);
        editorContainer.addEventListener('drop', handleDrop);
        editorContainer.addEventListener('dragend', handleDragEnd);
    }
}

// --- Agent Logic ---

// START OF FIX: Helper functions for agent tab spinner
function showAgentSpinner() {
    if (agentTabButton) agentTabButton.classList.add('loading');
}
function hideAgentSpinner() {
    if (agentTabButton) agentTabButton.classList.remove('loading');
}
// END OF FIX

function logToAgent(message, type = 'info') {
    const placeholder = agentOutput.querySelector('.agent-message-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const msgEl = document.createElement('div');
    msgEl.className = `agent-message log-type-${type}`;
    
    // Use innerHTML to allow for simple formatting like <strong>
    msgEl.innerHTML = message;
    
    agentOutput.appendChild(msgEl);
    agentOutput.scrollTop = agentOutput.scrollHeight; // Auto-scroll
}

function getAgentSystemPrompt() {
    return `You are an expert AI developer agent. Your task is to analyze a user's request and a website's full component structure, then create a plan and generate a set of actions to modify the website.

You will receive a conversation history. Use it to understand the full context of the user's requests. The most recent message contains the current request and the complete, up-to-date Vibe Tree.

**INPUT:**
1.  **User Request:** A natural language description of a desired change. This could be a general instruction or a specific update to one component's description.
2.  **Full Vibe Tree:** A JSON object representing the entire website.

**TASK:**
Intelligently modify the website to implement the user's request. This may involve updating existing components, or creating new components if necessary.

**OUTPUT:**
You must respond ONLY with a single, valid JSON object with the following schema. Do not add any other text or markdown.
{
  "plan": "A concise, human-readable summary of the changes you will make. Explain *what* you're changing and *why*.",
  "actions": [
    {
      "actionType": "update",
      "nodeId": "the-id-of-the-node-to-change",
      "newDescription": "An updated description for this node that reflects the changes made.",
      "newCode": "The complete, updated code block for this component."
    },
    {
      "actionType": "create",
      "parentId": "the-id-of-the-container-node-for-the-new-component",
      "newNode": {
         "id": "new-unique-kebab-case-id",
         "type": "html" | "css" | "javascript" | "js-function",
         "description": "A concise description of the new component.",
         "code": "The full code for the new component.",
         "selector": "#some-existing-element",
         "position": "beforeend" | "afterend"
      }
    }
  ]
}

**RULES:**
- Analyze the ENTIRE vibe tree to understand the context.
- Introduce a plan that justifies your actions.
- For **'update'** actions, provide the nodeId, newDescription, and the complete newCode. The newCode must be the full code, not a diff. The head node can also be updated this way.
- For **'create'** actions, provide the parentId and a complete newNode object.
  - The newNode.id must be unique and in kebab-case.
  - For new \`js-function\` nodes, the code must be a complete function definition. They do not need a selector or position.
  - For new HTML nodes, you MUST correctly define the selector and position to place it correctly in the DOM. Chain off existing elements.
- The response must be a single, valid JSON object and nothing else.`;
}

// NEW: System prompt for the iterative planning phase
function getIterativePlannerSystemPrompt() {
    return `You are a senior project manager AI. Your task is to break down a user's high-level website goal into a clear, numbered, step-by-step plan. Each step should be a single, concrete, and testable task that a developer can implement.

**RULES:**
- Analyze the user's request carefully.
- Create a logical sequence of steps, from setting up the basic structure to adding details and functionality.
- Respond ONLY with a single, valid JSON object with the following schema. Do not add any other text or markdown.
{
  "plan": [
    "Step 1: A description of the first concrete task.",
    "Step 2: A description of the next task.",
    "..."
  ]
}`;
}

// NEW: System prompt for executing a single iterative step
function getIterativeExecutorSystemPrompt() {
    return `You are an expert AI developer agent executing a single step of a larger plan. Your task is to generate the necessary actions to implement ONLY the current step.

You will receive the overall goal, the full plan, the current step to execute, and the website's current structure (Vibe Tree).

**OUTPUT:**
You must respond ONLY with a single, valid JSON object with the following schema. Do not add any other text or markdown.
{
  "plan": "A concise, human-readable summary of the changes you are making for THIS STEP ONLY.",
  "actions": [
    {
      "actionType": "update",
      "nodeId": "the-id-of-the-node-to-change",
      "newDescription": "An updated description for this node.",
      "newCode": "The complete, updated code for this component."
    },
    {
      "actionType": "create",
      "parentId": "the-id-of-the-container-node-for-the-new-component",
      "newNode": {
         "id": "new-unique-kebab-case-id",
         "type": "html" | "css" | "javascript" | "js-function",
         "description": "A concise description of the new component.",
         "code": "The full code for the new component.",
         "selector": "#some-existing-element",
         "position": "beforeend" | "afterend"
      }
    }
  ]
}

**RULES:**
- Focus ONLY on the current step. Do not implement future steps.
- Analyze the entire vibe tree to understand the context before making changes.
- The response must be a single, valid JSON object.`;
}

// START OF FIX: New system prompt for the self-correction phase
function getSelfCorrectionSystemPrompt() {
    return `You are an expert AI developer agent specializing in debugging. Your previous attempt to implement a step resulted in a runtime error. Your task is to analyze the error, the original goal, and the current code to generate a fix.

**INPUT:**
1.  **Original Goal:** The description of the task you were trying to complete.
2.  **Error Details:** The error message and stack trace that occurred.
3.  **Full Vibe Tree:** The current state of the code that is causing the error.

**TASK:**
Generate a new set of actions to fix the error while still achieving the original goal. You may need to update existing code or create new helper components.

**OUTPUT:**
You must respond ONLY with a single, valid JSON object with the action schema.
{
  "plan": "A concise summary of the fix. Explain what caused the error and how your new actions will resolve it.",
  "actions": [
    {
      "actionType": "update",
      "nodeId": "the-id-of-the-node-to-change",
      "newCode": "The complete, corrected code for this component."
    }
  ]
}`;
}
// END OF FIX

/**
 * Initiates an AI-powered fix for a given error message.
 * @param {string} errorMessage - The full text of the error, including stack trace.
 * @param {HTMLElement} fixButton - The button that was clicked.
 */
async function handleFixError(errorMessage, fixButton) {
    fixButton.disabled = true;
    fixButton.innerHTML = 'Fixing... <div class="loading-spinner"></div>';
    showAgentSpinner();
    showGlobalAgentLoader('Fixing runtime error...');

    console.log(`Attempting to fix error: "${errorMessage.split('\n')[0]}..."`);

    // Switch to the Agent tab to show progress
    switchToTab('agent');
    
    // Use the agent's UI elements for visual feedback
    agentPromptInput.value = `Fix this error:\n${errorMessage}`;
    runAgentSingleTaskButton.disabled = true;
    runAgentSingleTaskButton.innerHTML = 'Agent is fixing... <div class="loading-spinner"></div>';
    agentOutput.innerHTML = ''; // Clear previous logs
    agentConversationHistory = []; // Clear history for a new task
    logToAgent(`<strong>New Task:</strong> Fix a runtime error.`, 'plan');
    logToAgent(`<strong>Error Details:</strong>\n<pre>${errorMessage}</pre>`, 'info');
    logToAgent('Analyzing current code structure...', 'info');

    const fullTreeString = JSON.stringify(vibeTree, null, 2);
    const systemPrompt = getAgentSystemPrompt(); // The existing agent prompt is well-suited for this.

    const userPrompt = `A runtime error was detected in the application. Your task is to analyze the error message and the application's code structure to find the root cause and fix it.

**Error Details:**
\`\`\`
${errorMessage}
\`\`\`

**Full Vibe Tree (current code):**
\`\`\`json
${fullTreeString}
\`\`\``;

    try {
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);

        logToAgent('Received fix plan from AI. Executing actions...', 'info');
        executeAgentPlan(agentDecision, logToAgent);
        
        logToAgent('Fix applied. The website has been updated and reloaded.', 'info');
        // Switch to preview tab to show the result.
        switchToTab('preview');

    } catch (error) {
        console.error("AI fix failed:", error);
        logToAgent(`The AI fix failed: ${error.message}. Check the main console for more details.`, 'error');
        alert(`The AI Agent encountered an error while trying to fix the issue: ${error.message}`);
    } finally {
        runAgentSingleTaskButton.disabled = !(geminiApiKey || nscaleApiKey); // Reset to its normal state
        runAgentSingleTaskButton.innerHTML = 'Execute as Single Task';
        agentPromptInput.value = ''; // Clear the prompt
        hideAgentSpinner();
        hideGlobalAgentLoader();
    }
}

/**
 * Processes the AI's plan to update, create, and modify nodes in the vibeTree.
 * @param {object} agentDecision - The parsed JSON response from the AI.
 * @param {function} agentLogger - The logging function to use (e.g., logToAgent or console.log).
 */
function executeAgentPlan(agentDecision, agentLogger) {
    if (!agentDecision.plan || !Array.isArray(agentDecision.actions)) {
        console.error("AI returned a malformed plan object. Check AI logs for details.");
        throw new Error("AI returned a malformed plan object. Check console for details.");
    }

    recordHistory('Agent plan execution');

    agentLogger(`<strong>Plan:</strong> ${agentDecision.plan}`, 'plan');

    for (const action of agentDecision.actions) {
        if (action.actionType === 'update') {
            const { nodeId, newDescription, newCode } = action;
            const nodeToUpdate = findNodeById(nodeId);

            if (nodeToUpdate) {
                if (nodeToUpdate.type === 'container') {
                    agentLogger(`Warning: Agent tried to update container node \`${nodeId}\`, skipping.`, 'warn');
                    continue;
                }
                agentLogger(`<strong>Updating Node:</strong> \`${nodeId}\` (${nodeToUpdate.type})`, 'action');
                if (newDescription) nodeToUpdate.description = newDescription;
                if (typeof newCode === 'string') nodeToUpdate.code = newCode;
            } else {
                agentLogger(`Warning: Agent wanted to update non-existent node \`${nodeId}\`, skipping.`, 'warn');
            }
        } else if (action.actionType === 'create') {
            const { parentId, newNode } = action;
            const parentNode = findNodeById(parentId);
            if (parentNode && (parentNode.type === 'container' || parentNode.type === 'html')) {
                if (!newNode || !newNode.id || findNodeById(newNode.id)) {
                     agentLogger(`Warning: AI tried to create an invalid or duplicate node \`${newNode.id}\`. Skipping.`, 'warn');
                     continue;
                }
                if (!parentNode.children) parentNode.children = [];
                agentLogger(`<strong>Creating Node:</strong> \`${newNode.id}\` inside \`${parentId}\``, 'action');
                parentNode.children.push(newNode);
            } else {
                agentLogger(`Warning: AI wanted to create node under invalid parent \`${parentId}\`. Skipping.`, 'warn');
            }
        } else {
            agentLogger(`Warning: AI returned an unknown action type: \`${action.actionType}\`. Skipping.`, 'warn');
        }
    }
    
    refreshAllUI();
}

async function handleRunAgent() {
    const userPrompt = agentPromptInput.value.trim();
    if (!userPrompt) return;

    runAgentSingleTaskButton.disabled = true;
    runAgentSingleTaskButton.innerHTML = 'Agent is thinking... <div class="loading-spinner"></div>';
    logToAgent(`<strong>You:</strong> ${userPrompt}`, 'user');
    showAgentSpinner();
    showGlobalAgentLoader('Executing single task...');

    const fullTreeString = JSON.stringify(vibeTree, null, 2);
    const systemPrompt = getAgentSystemPrompt();
    const agentUserPrompt = `User Request: "${userPrompt}"\n\nFull Vibe Tree:\n\`\`\`json\n${fullTreeString}\n\`\`\``;

    agentConversationHistory.push({ role: 'user', content: agentUserPrompt });
    if (agentConversationHistory.length > 10) {
        agentConversationHistory = [agentConversationHistory[0], ...agentConversationHistory.slice(-9)];
    }

    try {
        const rawResponse = await callAI(systemPrompt, agentUserPrompt, true);
        agentConversationHistory.push({ role: 'model', content: rawResponse });
        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        logToAgent('Changes applied.', 'info');
        switchToTab('preview');
    } catch (error) {
        console.error("AI agent failed:", error);
        logToAgent(`The AI agent failed: ${error.message}.`, 'error');
        alert(`The AI Agent encountered an error: ${error.message}`);
        agentConversationHistory.pop();
    } finally {
        runAgentSingleTaskButton.disabled = !(geminiApiKey || nscaleApiKey);
        runAgentSingleTaskButton.innerHTML = 'Execute as Single Task';
        agentPromptInput.value = '';
        hideAgentSpinner();
        hideGlobalAgentLoader();
    }
}

// --- NEW: Iterative Agent Mode Logic ---

/**
 * Toggles the visibility of UI elements based on the iterative session state.
 */
function updateIterativeUI() {
    const status = iterativeSessionState.status;
    const isActive = status !== 'idle';

    iterativeSessionUI.classList.toggle('hidden', !isActive);
    runAgentSingleTaskButton.style.display = isActive ? 'none' : 'inline-block';
    startIterativeSessionButton.style.display = isActive ? 'none' : 'inline-block';

    agentPromptInput.disabled = isActive;
    agentPromptInput.placeholder = isActive
        ? "Session active. Agent is working or awaiting input."
        : "Describe the overall goal for your website...";

    // Hide all controls initially, then show based on status
    iterativeControls.classList.add('hidden');
    acceptContinueButton.style.display = 'none';
    requestChangesButton.style.display = 'none';
    endSessionButton.style.display = 'none';
    iterativePlanDisplay.innerHTML = ''; // Clear previous state

    switch (status) {
        case 'planning':
            agentPromptInput.placeholder = "Agent is generating a plan...";
            break;

        case 'reviewing':
            iterativeControls.classList.remove('hidden');
            acceptContinueButton.style.display = 'inline-block';
            acceptContinueButton.textContent = 'Start Execution';
            endSessionButton.style.display = 'inline-block';
            endSessionButton.textContent = 'Cancel';

            // Make plan editable
            const planTextArea = document.createElement('textarea');
            planTextArea.id = 'editable-plan-textarea';
            planTextArea.rows = iterativeSessionState.plan.length + 2;
            planTextArea.value = iterativeSessionState.plan.map((step, index) => `${index + 1}. ${step}`).join('\n');
            iterativePlanDisplay.appendChild(document.createElement('h4')).textContent = 'Review and Edit Plan:';
            iterativePlanDisplay.appendChild(planTextArea);
            break;

        case 'executing':
            iterativeControls.classList.remove('hidden');
            requestChangesButton.style.display = 'inline-block';
            requestChangesButton.textContent = 'Pause';
            endSessionButton.style.display = 'inline-block';
            endSessionButton.textContent = 'End Session';

            // Show read-only plan with progress
            const planList = document.createElement('ol');
            planList.innerHTML = iterativeSessionState.plan.map((step, index) =>
                `<li class="${index === iterativeSessionState.currentStepIndex ? 'active-step' : (index < iterativeSessionState.currentStepIndex ? 'completed-step' : '')}">${step}</li>`
            ).join('');
            iterativePlanDisplay.appendChild(planList);
            break;

        case 'paused':
            iterativeControls.classList.remove('hidden');
            acceptContinueButton.style.display = 'inline-block';
            acceptContinueButton.textContent = 'Resume';
            endSessionButton.style.display = 'inline-block';
            endSessionButton.textContent = 'End Session';
            // Show read-only plan with progress
            const pausedPlanList = document.createElement('ol');
            pausedPlanList.innerHTML = iterativeSessionState.plan.map((step, index) =>
                `<li class="${index === iterativeSessionState.currentStepIndex ? 'active-step' : (index < iterativeSessionState.currentStepIndex ? 'completed-step' : '')}">${step}</li>`
            ).join('');
            iterativePlanDisplay.appendChild(pausedPlanList);
            break;

        case 'complete':
            iterativeControls.classList.remove('hidden');
            endSessionButton.style.display = 'inline-block';
            endSessionButton.textContent = 'Finish';
            const completedPlanList = document.createElement('ol');
            completedPlanList.innerHTML = iterativeSessionState.plan.map(step => `<li class="completed-step">${step}</li>`).join('');
            iterativePlanDisplay.appendChild(completedPlanList);
            break;
    }
}


/**
 * Starts a new iterative development session by generating a plan for the user to review.
 */
async function handleStartIterativeSession() {
    const goal = agentPromptInput.value.trim();
    if (!goal) {
        alert("Please describe your overall goal before starting a session.");
        return;
    }

    iterativeSessionState = {
        status: 'planning',
        overallGoal: goal,
        plan: [],
        currentStepIndex: 0,
        history: [{ role: 'user', content: `Overall Goal: ${goal}` }]
    };

    agentOutput.innerHTML = '';
    logToAgent(`<strong>Starting Iterative Session.</strong> Goal: ${goal}`, 'plan');
    logToAgent('Generating a step-by-step plan...', 'info');
    updateIterativeUI();
    showAgentSpinner();
    showGlobalAgentLoader('Agent is creating a plan...');

    try {
        const systemPrompt = getIterativePlannerSystemPrompt();
        const userPrompt = `My website goal is: "${goal}"`;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const responseJson = JSON.parse(rawResponse);

        if (!responseJson.plan || !Array.isArray(responseJson.plan)) {
            throw new Error("AI did not return a valid plan array.");
        }

        iterativeSessionState.plan = responseJson.plan;
        iterativeSessionState.history.push({ role: 'model', content: rawResponse });

        logToAgent('<strong>Project Plan Generated.</strong> Please review and edit the plan below, then click "Start Execution".', 'plan');
        iterativeSessionState.status = 'reviewing';
        updateGlobalAgentLoader('Plan generated', 'Please review and start.');
        updateIterativeUI();

    } catch (error) {
        console.error("Failed to start iterative session:", error);
        logToAgent(`Error during planning phase: ${error.message}`, 'error');
        handleEndIterativeSession();
    } finally {
        hideAgentSpinner();
    }
}


// START OF FIX: New functions for iterative testing and self-correction

/**
 * Waits for a short period and checks if any JS errors were reported from the iframe.
 * @returns {Promise<void>} Resolves if no errors, rejects with the first error found.
 */
function testCurrentStep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (iframeErrors.length > 0) {
                const errorDetails = iframeErrors.map(e => `${e.message}${e.stack ? `\n${e.stack}`:''}`).join('\n---\n');
                reject(new Error(errorDetails));
            } else {
                resolve();
            }
        }, 2000); // Wait 2 seconds for any errors to occur and be reported
    });
}

/**
 * Asks the AI to generate a fix for a failed step.
 * @param {string} failedStepDescription - The original goal of the step.
 * @param {Error} error - The error that occurred.
 * @returns {Promise<object>} A promise that resolves to the AI's new action plan.
 */
async function handleSelfCorrection(failedStepDescription, error) {
    logToAgent('Asking AI for a fix...', 'info');

    const systemPrompt = getSelfCorrectionSystemPrompt();
    const fullTreeString = JSON.stringify(vibeTree, null, 2);
    const userPrompt = `The attempt to implement the following step failed.

**Original Goal:**
"${failedStepDescription}"

**Error Details:**
\`\`\`
${error.message}
${error.stack || ''}
\`\`\`

**Full Vibe Tree (current code with error):**
\`\`\`json
${fullTreeString}
\`\`\`

Please analyze the code and the error, and provide a new set of actions to fix the problem.`;

    const rawResponse = await callAI(systemPrompt, userPrompt, true);
    return JSON.parse(rawResponse);
}
// END OF FIX

// START OF FIX: Reworked the iterative step execution to remove auto self-correction.
/**
 * Executes the current step in the iterative plan and pauses on error.
 */
async function executeNextIterativeStep() {
    if (iterativeSessionState.status !== 'executing') {
        logToAgent('Execution paused or ended.', 'info');
        hideAgentSpinner();
        hideGlobalAgentLoader();
        return;
    }

    if (iterativeSessionState.currentStepIndex >= iterativeSessionState.plan.length) {
        logToAgent('<strong>Project Complete!</strong> All steps have been executed.', 'plan');
        iterativeSessionState.status = 'complete';
        updateGlobalAgentLoader('Project Complete!', 'All steps executed.');
        updateIterativeUI();
        hideAgentSpinner();
        return;
    }

    showAgentSpinner();
    updateIterativeUI();
    const currentStepDescription = iterativeSessionState.plan[iterativeSessionState.currentStepIndex];
    const progressText = `Step ${iterativeSessionState.currentStepIndex + 1}/${iterativeSessionState.plan.length}`;
    updateGlobalAgentLoader('Executing plan...', progressText);

    try {
        logToAgent(`<strong>Executing Step ${iterativeSessionState.currentStepIndex + 1}:</strong> ${currentStepDescription}`, 'action');

        const systemPrompt = getIterativeExecutorSystemPrompt();
        const fullTreeString = JSON.stringify(vibeTree, null, 2);
        const userPrompt = `
            Overall Goal: "${iterativeSessionState.overallGoal}"
            Full Plan:
            ${iterativeSessionState.plan.map((s, i) => `${i+1}. ${s}`).join('\n')}
            Current Step to Execute: "${currentStepDescription}"
            Current Vibe Tree:
            \`\`\`json
            ${fullTreeString}
            \`\`\`
        `;
        iterativeSessionState.history.push({ role: 'user', content: userPrompt });

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);

        iterativeSessionState.history.push({ role: 'model', content: rawResponse });
        executeAgentPlan(agentDecision, logToAgent);

        logToAgent('Testing implementation for errors...', 'info');
        await testCurrentStep();

        // If test passes, we're done with this step
        logToAgent(`Step ${iterativeSessionState.currentStepIndex + 1} completed and tested successfully.`, 'info');
        switchToTab('preview');
        iterativeSessionState.currentStepIndex++;
        setTimeout(executeNextIterativeStep, 1500);

    } catch (error) {
        console.error(`Error during step ${iterativeSessionState.currentStepIndex + 1}:`, error);
        logToAgent(`Execution failed with an error: <pre>${error.message}</pre>`, 'error');
        logToAgent('Pausing session for your review. You can make manual changes, use the "Fix with AI" button in the console, or end the session.', 'error');
        iterativeSessionState.status = 'paused';
        updateGlobalAgentLoader('Execution paused on error', progressText);
        updateIterativeUI();
        hideAgentSpinner();
        switchToTab('console'); // Switch to console to show the error
    }
}
// END OF FIX


/**
 * Handles the primary positive action in an iterative session, which changes
 * based on the current state (e.g., 'Start Execution', 'Resume').
 */
function handleAcceptAndContinue() {
    const status = iterativeSessionState.status;

    if (status === 'reviewing') {
        // This is now the "Start Execution" action
        const planTextArea = document.getElementById('editable-plan-textarea');
        if (!planTextArea) {
            console.error("Could not find editable plan textarea.");
            logToAgent("Internal error: Could not find plan to execute.", 'error');
            return;
        }

        // Parse the edited plan from the textarea.
        const editedPlanText = planTextArea.value.trim();
        const editedPlan = editedPlanText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line);

        if (editedPlan.length === 0) {
            alert("The plan is empty. Please define at least one step.");
            return;
        }

        iterativeSessionState.plan = editedPlan;
        iterativeSessionState.status = 'executing';
        iterativeSessionState.currentStepIndex = 0; // Start from the beginning

        logToAgent('<strong>Execution Started.</strong> Agent will now work through the plan, testing each step.', 'plan');
        updateGlobalAgentLoader('Starting execution...', `Step 1/${editedPlan.length}`);
        executeNextIterativeStep(); // Kick off the execution loop
    } else if (status === 'paused') {
        // This is the "Resume" action
        iterativeSessionState.status = 'executing';
        logToAgent('Resuming execution...', 'info');
        updateGlobalAgentLoader('Resuming execution...', `Step ${iterativeSessionState.currentStepIndex + 1}/${iterativeSessionState.plan.length}`);
        executeNextIterativeStep(); // Continue the loop
    }
}

/**
 * Handles the secondary action in an iterative session, which is now 'Pause'.
 * The old 'request changes' functionality is replaced by direct plan editing
 * and the ability to pause and intervene manually.
 */
function handleRequestChanges() {
    // This button's only role now is to pause execution.
    if (iterativeSessionState.status === 'executing') {
        iterativeSessionState.status = 'paused';
        logToAgent('Execution paused by user.', 'info');
        updateGlobalAgentLoader('Execution paused by user', `At Step ${iterativeSessionState.currentStepIndex + 1}/${iterativeSessionState.plan.length}`);
        updateIterativeUI();
        hideAgentSpinner();
    }
}

/**
 * Resets the state and UI, ending the iterative session.
 */
function handleEndIterativeSession() {
    logToAgent('Iterative session ended.', 'info');
    iterativeSessionState = {
        status: 'idle',
        overallGoal: '',
        plan: [],
        currentStepIndex: -1,
        history: []
    };
    updateIterativeUI();
    agentPromptInput.value = '';
    hideAgentSpinner();
    hideGlobalAgentLoader();
}


// --- Chat Logic ---

/**
 * Logs a message to the chat UI.
 * @param {string} message - The message content.
 * @param {'user' | 'model'} type - The type of message.
 * @returns {HTMLElement} The created message element.
 */
function logToChat(message, type = 'model') {
    const placeholder = chatOutput.querySelector('.chat-message-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const msgEl = document.createElement('div');
    msgEl.className = `chat-message log-type-${type}`;
    
    // Using textContent is safer for user input and initial model placeholders
    msgEl.textContent = message;
    
    chatOutput.appendChild(msgEl);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    return msgEl; // Return the element for streaming updates
}

/**
 * Finds all ``` blocks in an element, converts them to <pre><code>,
 * and adds action buttons for copying or inserting the code. This version
 * correctly handles multiple class names on code blocks to reliably find the
 * target file path.
 * @param {HTMLElement} parentElement The element containing the AI's response.
 */
function processChatCodeBlocks(parentElement) {
    let htmlContent = parentElement.innerHTML;
    htmlContent = htmlContent.replace(/```(\S*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const sanitizedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang}">${sanitizedCode}</code></pre>`;
    });
    parentElement.innerHTML = htmlContent;

    const pres = parentElement.querySelectorAll('pre');
    pres.forEach(pre => {
        const codeEl = pre.querySelector('code');
        if (!codeEl) return;

        const codeContent = codeEl.textContent || '';

        const wrapper = document.createElement('div');
        wrapper.className = 'chat-code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'chat-code-actions';
        wrapper.appendChild(actionsContainer);

        let targetFilePath = null;
        const filePathRegex = /^language-(?:[a-z0-9_-]+):(.+)$/i;

        for (const cls of codeEl.classList) {
            const match = cls.match(filePathRegex);
            if (match && match) {
                targetFilePath = match;
                break;
            }
        }

        if (targetFilePath) {
            const insertButton = document.createElement('button');
            insertButton.className = 'insert-code-button';
            insertButton.textContent = `Insert into ${targetFilePath}`;
            insertButton.addEventListener('click', (e) => handleInsertCodeIntoFile(targetFilePath, codeContent, e.currentTarget));
            actionsContainer.appendChild(insertButton);
        } else {
            const agentButton = document.createElement('button');
            agentButton.className = 'use-agent-button';
            agentButton.textContent = 'Use Agent to Insert Snippet';
            agentButton.addEventListener('click', () => handleUseAgentToInsertSnippet(codeContent));
            actionsContainer.appendChild(agentButton);
        }

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeContent).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => (copyButton.textContent = 'Copy'), 2000);
            });
        });
        pre.appendChild(copyButton);
    });
}

/**
 * Handles inserting a code block directly into a project file.
 * @param {string|array} filePath The path of the file to save (defensive: accepts malformed input).
 * @param {string} codeContent The code to write to the file.
 * @param {HTMLElement} buttonElement The button that was clicked, for UI feedback.
 */
async function handleInsertCodeIntoFile(filePath, codeContent, buttonElement) {
    if (!ensureProjectForFiles()) return;

    let cleanPath;
    try {
        let pathInput = filePath;
        if (Array.isArray(pathInput)) {
            pathInput = [...pathInput].reverse().find(p => p) || '';
        }
        cleanPath = String(pathInput || '').trim();
        if (cleanPath.includes(':')) {
            const parts = cleanPath.split(':');
            cleanPath = parts[parts.length - 1].trim();
        }
        cleanPath = cleanPath.replace(/^\/+/, '');
    } catch (e) {
        console.error('Failed to normalize file path:', e, { originalPath: filePath });
        alert(`An internal error occurred while processing the file path. See console for details.`);
        return;
    }

    if (!cleanPath) {
        alert('Cannot insert code: the file path is empty or malformed.');
        return;
    }

    if (!confirm(`Are you sure you want to overwrite '${cleanPath}' with the provided code?`)) {
        return;
    }
    
    const originalText = buttonElement ? buttonElement.textContent : '';
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = 'Processing... <div class="loading-spinner"></div>';
    }

    console.info('Attempting to save file from chat insert', { projectId: currentProjectId, filePath: cleanPath });

    try {
        await db.saveTextFile(currentProjectId, cleanPath, codeContent);
        console.log(`File '${cleanPath}' was updated from Chat. Rebuilding project...`);
        await rebuildAndRefreshFromFiles();
    } catch (e) {
        console.error(`Failed to insert code and refresh for ${cleanPath}:`, e);
        alert(`Error saving file: ${e.message}`);
    } finally {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.textContent = originalText;
        }
    }
}

/**
 * Builds a single, combined HTML string from the project files stored in the database
 * by inlining all linked CSS and JavaScript.
 * @param {string} projectId The ID of the project to build.
 * @returns {Promise<string>} A promise that resolves to the full HTML string.
 */
async function buildCombinedHtmlFromDb(projectId) {
    if (!projectId) throw new Error("Project ID is required.");

    const allFiles = await db.listFiles(projectId);
    if (!allFiles.includes('index.html')) {
        throw new Error("Project is missing an index.html file.");
    }

    const indexText = await db.readTextFile(projectId, 'index.html');
    const parser = new DOMParser();
    const doc = parser.parseFromString(indexText, 'text/html');

    const linkNodes = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'));
    for (const link of linkNodes) {
        const href = link.getAttribute('href').trim();
        try {
            const cssText = await db.readTextFile(projectId, href);
            const style = doc.createElement('style');
            style.textContent = cssText;
            link.replaceWith(style);
        } catch (e) {
            console.warn(`Could not inline stylesheet from DB: ${href}`, e);
        }
    }

    const scriptNodes = Array.from(doc.querySelectorAll('script[src]'));
    for (const script of scriptNodes) {
        const src = script.getAttribute('src').trim();
        try {
            const jsCode = await db.readTextFile(projectId, src);
            const inlineScript = document.createElement('script');
            inlineScript.textContent = jsCode;
            if (script.type) inlineScript.type = script.type;
            script.replaceWith(inlineScript);
        } catch (e) {
            console.warn(`Could not inline script from DB: ${src}`, e);
        }
    }

    return new XMLSerializer().serializeToString(doc);
}


/**
 * Orchestrates the process of rebuilding the vibeTree from the file database
 * and refreshing the entire application UI to reflect the changes.
 */
async function rebuildAndRefreshFromFiles() {
    console.log("File changed. Rebuilding Vibe Tree from source files...");
    
    try {
        const combinedHtml = await buildCombinedHtmlFromDb(currentProjectId);
        recordHistory('Rebuild tree from file change');
        const newVibeTree = await decomposeCodeIntoVibeTree(combinedHtml);
        vibeTree = newVibeTree;
        refreshAllUI();
        console.log("Vibe Tree rebuilt and UI refreshed successfully.");
    } catch (error) {
        console.error("Failed to rebuild Vibe Tree from files:", error);
        alert(`An error occurred while synchronizing file changes: ${error.message}`);
    }
}

/**
 * Sends a code snippet to the Agent tab for intelligent insertion.
 * @param {string} codeContent The code snippet to insert.
 */
function handleUseAgentToInsertSnippet(codeContent) {
    const lastUserMessage = chatConversationHistory.filter(m => m.role === 'user').pop();
    const context = lastUserMessage ? `Based on our last conversation about "${lastUserMessage.content}", please ` : 'Please ';
    
    const agentPrompt = `${context}insert the following code snippet into the project where it makes the most sense. Analyze the existing code and create or update the necessary components.\n\nCode Snippet:\n\`\`\`\n${codeContent}\n\`\`\``;

    agentPromptInput.value = agentPrompt;
    switchToTab('agent');
    logToAgent(`<strong>Task from Chat:</strong> Insert code snippet.`, 'plan');
    handleRunAgent();
}


/**
 * Handles sending a message from the chat input.
 */
async function handleSendChatMessage() {
    const userPrompt = chatPromptInput.value.trim();
    if (!userPrompt) return;

    const systemPrompt = chatSystemPromptInput.value.trim() || `You are an expert pair programmer. The user will provide you with the full content of their project files and a request to change them.
1.  Analyze the user's request and the provided file context.
2.  Identify which file(s) need to be modified.
3.  When you provide code, you MUST return the **complete, updated content** of the file. Do not provide snippets, diffs, or partial code.
4.  Enclose the full file content in a markdown code block, and use a language fence that includes the file path. For example: \`\`\`html:index.html ... complete file content ... \`\`\``;

    sendChatButton.disabled = true;
    chatPromptInput.disabled = true;
    sendChatButton.innerHTML = '<div class="loading-spinner"></div>';
    chatPromptInput.value = '';

    logToChat(userPrompt, 'user');
    chatConversationHistory.push({ role: 'user', content: userPrompt });
    
    const aiMessageElement = logToChat('...', 'model');
    aiMessageElement.innerHTML = '';
    
    try {
        const streamCallback = (chunk) => {
            const textNode = document.createTextNode(chunk);
            aiMessageElement.appendChild(textNode);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };

        const fullResponse = await callAI(systemPrompt, userPrompt, false, streamCallback);
        
        aiMessageElement.textContent = fullResponse;
        processChatCodeBlocks(aiMessageElement);
        chatConversationHistory.push({ role: 'model', content: fullResponse });

    } catch (error) {
        console.error("Chat AI failed:", error);
        aiMessageElement.textContent = `The AI failed to respond: ${error.message}`;
        aiMessageElement.classList.add('log-type-error');
    } finally {
        sendChatButton.disabled = false;
        chatPromptInput.disabled = false;
        sendChatButton.innerHTML = 'Send';
        chatPromptInput.focus();
    }
}

// --- Add Node Modal Logic ---
function handleAddChildClick(event) {
    const parentId = event.target.dataset.id;
    addNodeParentIdInput.value = parentId;
    addNodeTargetIdInput.value = ''; // Clear inspector-specific fields
    addNodePositionInput.value = '';
    newNodeIdInput.value = '';
    newNodeDescriptionInput.value = '';
    newNodeTypeInput.value = 'html';
    addNodeError.textContent = '';
    addNodeModal.style.display = 'block';
    newNodeIdInput.focus();
}

function closeModal() {
    addNodeModal.style.display = 'none';
}

async function handleCreateNode() {
    const parentId = addNodeParentIdInput.value;
    const newNodeId = newNodeIdInput.value.trim();
    const newNodeType = newNodeTypeInput.value;
    const newDescription = newNodeDescriptionInput.value.trim() || `A new, empty ${newNodeType} component.`;
    const targetId = addNodeTargetIdInput.value;
    const position = addNodePositionInput.value;

    addNodeError.textContent = '';

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newNodeId)) {
        addNodeError.textContent = 'Invalid ID. Use kebab-case (e.g., "my-new-id").';
        return;
    }

    if (findNodeById(newNodeId)) {
        addNodeError.textContent = 'This ID is already in use.';
        return;
    }

    const parentNode = findNodeById(parentId);
    if (!parentNode) {
        addNodeError.textContent = 'Internal error: Parent node not found.';
        return;
    }

    recordHistory(`Create node ${newNodeId}`);

    if (!parentNode.children) parentNode.children = [];

    const newNode = { id: newNodeId, type: newNodeType, description: newDescription, code: '' };
    
    let inserted = false;
    if (targetId && position) {
        const targetIndex = parentNode.children.findIndex(c => c.id === targetId);
        if (targetIndex !== -1) {
            if (position === 'before') {
                parentNode.children.splice(targetIndex, 0, newNode);
            } else { // 'after'
                parentNode.children.splice(targetIndex + 1, 0, newNode);
            }
            inserted = true;
        }
    }
    
    if (!inserted) {
        parentNode.children.push(newNode);
    }
    
    recalculateSelectors(parentNode);
    
    console.log(`Added new node "${newNodeId}" to parent "${parentId}".`);
    refreshAllUI();
    closeModal();
    autoSaveProject();
}


// --- Edit Node Modal Logic ---
function openEditNodeModal(nodeId) {
    const node = findNodeById(nodeId);
    if (!node) {
        console.error(`openEditNodeModal: Node not found: ${nodeId}`);
        return;
    }
    editNodeError.textContent = '';
    editNodeIdInput.value = node.id;
    editNodeTypeInput.value = node.type;
    editNodeDescriptionInput.value = node.description || '';
    editNodeCodeInput.value = node.code || '';
    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (aiImproveDescriptionButton) {
        aiImproveDescriptionButton.disabled = !keyIsAvailable;
        aiImproveDescriptionButton.title = keyIsAvailable ? '' : 'Add an API key in Settings to use AI.';
    }
    if (saveAsComponentButton) {
        const isSaveable = ['html', 'js-function', 'css'].includes(node.type);
        saveAsComponentButton.style.display = isSaveable ? 'inline-block' : 'none';
        saveAsComponentButton.disabled = !keyIsAvailable;
        saveAsComponentButton.title = keyIsAvailable ? 'Save this node and its dependencies as a reusable component' : 'Add an API key in Settings to use this feature.';
        saveAsComponentButton.dataset.nodeId = nodeId;
    }
    editNodeModal.style.display = 'block';
}

function closeEditNodeModal() {
    editNodeModal.style.display = 'none';
}

function handleSaveEditedNode() {
    const nodeId = editNodeIdInput.value;
    const node = findNodeById(nodeId);
    if (!node) {
        editNodeError.textContent = 'Internal error: node not found.';
        return;
    }

    const newDescription = editNodeDescriptionInput.value;
    const newCode = editNodeCodeInput.value;

    const descChanged = newDescription !== (node.description || '');
    const codeChanged = newCode !== (node.code || '');

    if (!descChanged && !codeChanged) {
        closeEditNodeModal();
        return;
    }

    const saveBtn = saveEditNodeButton;

    (async () => {
        try {
            if (codeChanged) {
                recordHistory(`Edit code in modal for ${nodeId}`);
                node.code = newCode;
            }
            if (descChanged) {
                if (!codeChanged) recordHistory(`Edit description in modal for ${nodeId}`);
                await updateNodeByDescription(nodeId, newDescription, saveBtn);
            } else {
                refreshAllUI();
            }
            closeEditNodeModal();
            console.log(`Node '${nodeId}' updated from Element Editor.`);
            autoSaveProject();
        } catch (e) {
            editNodeError.textContent = e.message || 'Failed to update node.';
        }
    })();
}

// Preview Inspect Toggle
let inspectEnabled = false;
function toggleInspectMode() {
    inspectEnabled = !inspectEnabled;
    toggleInspectButton.classList.toggle('inspect-active', inspectEnabled);
    toggleInspectButton.textContent = inspectEnabled ? 'Disable Inspect' : 'Enable Inspect';
    try {
        previewContainer.contentWindow.postMessage({ type: 'toggle-inspect', enabled: inspectEnabled }, '*');
    } catch (e) {
        console.error('Failed to postMessage to iframe for inspect toggle:', e);
    }
}

// --- NEW: Inspector Tree Manipulation ---

function findNodeAndParentById(id, node = vibeTree, parent = null) {
    if (node.id === id) return { node, parent };
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeAndParentById(id, child, node);
            if (found) return found;
        }
    }
    return null;
}

function deleteNode(nodeId) {
    const result = findNodeAndParentById(nodeId);
    if (!result || !result.parent) {
        console.error(`Cannot delete node '${nodeId}': not found or is root.`);
        return;
    }
    
    if (confirm(`Are you sure you want to permanently delete the element "${nodeId}"?`)) {
        recordHistory(`Delete node ${nodeId}`);
        const { node, parent } = result;
        const index = parent.children.indexOf(node);
        if (index > -1) {
            parent.children.splice(index, 1);
            recalculateSelectors(parent);
            console.log(`Node '${nodeId}' deleted.`);
            refreshAllUI();
        }
    }
}

function moveNode(sourceNodeId, targetNodeId, position) {
    const sourceResult = findNodeAndParentById(sourceNodeId);
    const targetResult = findNodeAndParentById(targetNodeId);

    if (!sourceResult || !targetResult) {
        console.error('Move failed: source or target node not found.');
        return;
    }

    const { node: sourceNode, parent: sourceParent } = sourceResult;
    const { node: targetNode, parent: targetParent } = targetResult;
    
    // Prevent moving a parent into one of its own children
    let current = targetParent;
    while(current) {
        if (current.id === sourceNodeId) {
            console.error('Move failed: cannot move a parent node into one of its children.');
            return;
        }
        const result = findNodeAndParentById(current.id);
        current = result ? result.parent : null;
    }

    recordHistory(`Move node ${sourceNodeId}`);

    // Remove source from its original location
    const sourceIndex = sourceParent.children.indexOf(sourceNode);
    if (sourceIndex > -1) {
        sourceParent.children.splice(sourceIndex, 1);
    } else {
        console.error('Move failed: source node not found in its parent.');
        return;
    }

    if (position === 'inside') {
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(sourceNode);
        recalculateSelectors(targetNode);
    } else {
        const targetIndex = targetParent.children.indexOf(targetNode);
        if (position === 'before') {
            targetParent.children.splice(targetIndex, 0, sourceNode);
        } else { // 'after'
            targetParent.children.splice(targetIndex + 1, 0, sourceNode);
        }
        recalculateSelectors(targetParent);
    }
    
    // If the parents were different, the old parent might also need recalculation
    if(sourceParent.id !== targetParent.id) {
        recalculateSelectors(sourceParent);
    }

    console.log(`Moved node '${sourceNodeId}' ${position} '${targetNodeId}'.`);
    refreshAllUI();
}

function recalculateSelectors(parentNode) {
    if (!parentNode || !Array.isArray(parentNode.children)) return;

    const htmlChildren = parentNode.children.filter(c => c.type === 'html');
    let lastHtmlSiblingId = null;

    htmlChildren.forEach((child, index) => {
        child.selector = (index === 0) ? `#${parentNode.id}` : `#${lastHtmlSiblingId}`;
        child.position = (index === 0) ? 'beforeend' : 'afterend';
        
        const idMatch = child.code.match(/id="([^"]+)"/);
        if (idMatch && idMatch) {
            lastHtmlSiblingId = idMatch;
        } else {
            console.warn(`Node ${child.id} lacks an 'id' attribute, which may break layout.`);
            lastHtmlSiblingId = child.id; // Fallback, not ideal
        }
    });
}

/**
 * NEW: Handles the request to add a new node from the inspector.
 * It determines the correct parent and pre-fills the 'Add Node' modal.
 * @param {string} targetNodeId The ID of the node to add relative to.
 * @param {'before'|'after'|'inside'} position The desired position.
 */
function handleAddNodeFromInspect(targetNodeId, position) {
    const targetResult = findNodeAndParentById(targetNodeId);
    if (!targetResult) {
        console.error(`Cannot add node: target '${targetNodeId}' not found.`);
        return;
    }

    const { node: targetNode, parent: targetParent } = targetResult;
    let parentForNewNode, targetForPositioning, positionForNewNode;

    if (position === 'inside') {
        parentForNewNode = targetNode;
        targetForPositioning = null; // Will be added to the end of the new parent
        positionForNewNode = 'beforeend'; // Not strictly needed, but for clarity
    } else {
        parentForNewNode = targetParent;
        targetForPositioning = targetNode;
        positionForNewNode = position;
    }
    
    // Reset modal fields
    addNodeTargetIdInput.value = targetForPositioning ? targetForPositioning.id : '';
    addNodePositionInput.value = positionForNewNode || '';
    addNodeParentIdInput.value = parentForNewNode.id;
    newNodeIdInput.value = '';
    newNodeDescriptionInput.value = '';
    newNodeTypeInput.value = 'html';
    addNodeError.textContent = '';
    
    addNodeModal.style.display = 'block';
    newNodeIdInput.focus();
}


// Listen for element click messages from the iframe
window.addEventListener('message', (event) => {
    const data = event.data || {};
    switch (data.type) {
        case 'vibe-node-click':
            if (data.nodeId) openEditNodeModal(data.nodeId);
            break;
        case 'vibe-node-delete':
            if (data.nodeId) deleteNode(data.nodeId);
            break;
        case 'vibe-node-move':
            if (data.sourceNodeId && data.targetNodeId && data.position) {
                 moveNode(data.sourceNodeId, data.targetNodeId, data.position);
            }
            break;
        case 'vibe-node-add-request':
            if (data.targetNodeId && data.position) {
                handleAddNodeFromInspect(data.targetNodeId, data.position);
            }
            break;
        case 'iframe-error':
            if (data.payload) {
                const { message, stack, name } = data.payload;
                const error = new Error(message);
                if (stack) error.stack = stack;
                if (name) error.name = name;
                iframeErrors.push(error);
                console.error(error);
            }
            break;
        case 'iframe-console':
            if (data.payload && Array.isArray(data.payload)) {
                handleConsoleCommand(data.level, data.payload);
            }
            break;
    }
});

// --- Full Code Search Logic ---
let searchState = {
    term: '',
    matches: [], // array of start indices
    currentIndex: -1
};

function performSearch() {
    const searchTerm = searchInput.value;
    const code = fullCodeEditor.value;
    searchResultsCount.textContent = '';
    
    if (!searchTerm) {
        searchState = { term: '', matches: [], currentIndex: -1 };
        fullCodeEditor.setSelectionRange(0, 0);
        return;
    }

    if (searchState.term !== searchTerm) {
        searchState.term = searchTerm;
        searchState.matches = [];
        const regex = new RegExp(searchTerm, 'gi');
        let match;
        while ((match = regex.exec(code)) !== null) {
            searchState.matches.push(match.index);
        }
        searchState.currentIndex = -1;
    }
    
    if (searchState.matches.length > 0) {
        findNextMatch();
    } else {
        searchResultsCount.textContent = '0 matches';
    }
}

function findNextMatch() {
    if (searchState.matches.length === 0) return;
    searchState.currentIndex = (searchState.currentIndex + 1) % searchState.matches.length;
    highlightCurrentMatch();
}

function findPrevMatch() {
    if (searchState.matches.length === 0) return;
    searchState.currentIndex = (searchState.currentIndex - 1 + searchState.matches.length) % searchState.matches.length;
    highlightCurrentMatch();
}

function highlightCurrentMatch() {
    if (searchState.currentIndex < 0) return;
    const start = searchState.matches[searchState.currentIndex];
    const end = start + searchState.term.length;
    fullCodeEditor.focus();
    fullCodeEditor.setSelectionRange(start, end);
    searchResultsCount.textContent = `Match ${searchState.currentIndex + 1} of ${searchState.matches.length}`;
}

function handleSearchInput() {
    let debounceTimer;
    return () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 250);
    };
}

// --- NEW: Vibe Editor AI Search Logic ---

function clearEditorHighlights() {
    editorContainer.querySelectorAll('.ai-search-highlight').forEach(el => {
        el.classList.remove('ai-search-highlight');
    });
}

async function handleAiEditorSearch() {
    const query = aiEditorSearchInput.value.trim();
    
    // Clear previous results first
    clearEditorHighlights();
    
    if (!query) {
        return;
    }

    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (!keyIsAvailable) {
        alert('Please add your API Key in Settings to use AI search.');
        return;
    }
    
    const originalButtonText = aiEditorSearchButton.innerHTML;
    aiEditorSearchButton.disabled = true;
    aiEditorSearchButton.innerHTML = 'Searching... <div class="loading-spinner"></div>';
    
    console.log(`Performing AI editor search for: "${query}"`);

    try {
        const systemPrompt = `You are an intelligent search engine for a JSON-based component tree called a "Vibe Tree". Your task is to find the most relevant nodes based on a user's natural language query. Analyze the entire tree, including node IDs, descriptions, and code snippets.

**OUTPUT FORMAT:** You MUST respond with a single, valid JSON array of strings, where each string is the \`id\` of a relevant node. Do not include any other text, comments, or markdown.

**Example Response:**
["main-navigation", "function-toggle-mobile-menu"]`;
        
        const userPrompt = `Search Query: "${query}"\n\nFull Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const resultIds = JSON.parse(rawResponse);
        
        if (!Array.isArray(resultIds)) {
            throw new Error("AI did not return a valid array of node IDs.");
        }
        
        console.log(`AI search found ${resultIds.length} relevant nodes.`);
        
        if (resultIds.length > 0) {
            highlightSearchResults(resultIds);
        } else {
            alert(`AI search for "${query}" did not find any matching components.`);
        }
        
    } catch (error) {
        console.error("AI Editor Search failed:", error);
        alert(`An error occurred during the AI search: ${error.message}`);
    } finally {
        aiEditorSearchButton.disabled = false;
        aiEditorSearchButton.innerHTML = originalButtonText;
    }
}

function highlightSearchResults(nodeIds) {
    let firstResultEl = null;
    
    nodeIds.forEach(id => {
        const nodeEl = editorContainer.querySelector(`.vibe-node[data-node-id="${id}"]`);
        if (nodeEl) {
            nodeEl.classList.add('ai-search-highlight');
            if (!firstResultEl) {
                firstResultEl = nodeEl;
            }
            // Also expand its parents so it's visible
            let parent = nodeEl.parentElement;
            while(parent && parent !== editorContainer) {
                if (parent.classList.contains('children') && parent.classList.contains('collapsed')) {
                    const toggleBtn = parent.closest('.vibe-node')?.querySelector('.collapse-toggle');
                    if (toggleBtn) {
                        toggleBtn.click(); // Expand the parent
                    }
                }
                parent = parent.parentElement;
            }
        }
    });
    
    // Scroll the first result into view
    if (firstResultEl) {
        firstResultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- NEW: Refactored Tab Switching Logic ---

/**
 * Switches the active tab in the main UI.
 * @param {string} tabId The data-tab value of the tab to switch to.
 */
function switchToTab(tabId) {
    const tabs = document.querySelector('.tabs');
    const tabContents = document.querySelector('.tab-content-area');
    
    const button = tabs.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (!button || button.classList.contains('active')) return; // Do nothing if not found or already active

    // Special handlers for activating certain tabs
    if (tabId === 'console') consoleErrorIndicator.classList.remove('active');

    // Deactivate current
    const currentButton = tabs.querySelector('.active');
    const currentContent = tabContents.querySelector('.tab-content.active');
    if (currentButton) currentButton.classList.remove('active');
    if (currentContent) currentContent.classList.remove('active');

    // Activate new
    button.classList.add('active');
    const newContent = tabContents.querySelector(`#${tabId}`);
    if (newContent) newContent.classList.add('active');

    // Post-activation tasks
    if (tabId === 'code') showFullCode();
    if (tabId === 'files') {
        renderFileTree();
        if (filesPreviewEl) {
            filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file to preview it here.</div>';
        }
    }
    if (tabId === 'context') {
        renderComponentList();
        if(contextComponentViewer) {
             contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
        }
    }
}

function handleTabSwitching() {
    const tabs = document.querySelector('.tabs');
    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;
        const tabId = button.dataset.tab;
        switchToTab(tabId);
    });
}


function initializeMermaid() {
    if (typeof window.mermaid === 'undefined') {
        console.error("Mermaid library not found.");
        if(generateFlowchartButton) {
            generateFlowchartButton.disabled = true;
            generateFlowchartButton.title = "Mermaid.js library failed to load.";
        }
        return;
    }
    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        fontFamily: "'Inter', sans-serif",
    });
    console.log("Mermaid.js initialized.");
}

// --- Project Persistence Logic ---

async function populateProjectList() {
    if (!db.isLoggedIn()) {
        projectListContainer.innerHTML = '';
        noProjectsMessage.style.display = 'block';
        noProjectsMessage.textContent = 'Please log in to see your projects.';
        return;
    }

    try {
        const projects = await db.listProjects();
        projectListContainer.innerHTML = ''; 

        noProjectsMessage.style.display = projects.length === 0 ? 'block' : 'none';
        noProjectsMessage.textContent = 'No projects yet. Create one below!';

        projects.forEach(projectId => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-list-item';
            projectItem.innerHTML = `
                <span class="project-id-text">${projectId}</span>
                <div class="project-item-buttons">
                    <button class="load-project-button action-button" data-id="${projectId}">Load</button>
                    <button class="delete-project-button" data-id="${projectId}">Delete</button>
                </div>
            `;
            projectListContainer.appendChild(projectItem);
        });
    } catch (error) {
        console.error("Failed to populate project list:", error);
        noProjectsMessage.textContent = 'Error loading projects.';
    }
}


async function handleLoadProject(event) {
    const projectId = event.target.dataset.id;
    try {
        const projectData = await db.loadProject(projectId);

        if (projectData) {
            currentProjectId = projectId;
            vibeTree = projectData;
            console.log(`Project '${projectId}' loaded.`);
            
            refreshAllUI();
            resetHistory();
            await autoSaveProject();

            switchToTab('preview');
        } else {
            throw new Error(`Could not find project data for '${projectId}'.`);
        }
    } catch (error) {
         console.error(`Could not load project '${projectId}'.`, error);
        alert(`Error: ${error.message}`);
    }
}


async function handleDeleteProject(event) {
    const projectId = event.target.dataset.id;
    if (confirm(`Are you sure you want to permanently delete project '${projectId}'?`)) {
        try {
            await db.deleteProject(projectId);
            console.log(`Project '${projectId}' deleted.`);
            await populateProjectList(); // Refresh the list
        } catch (error) {
            console.error(`Failed to delete project '${projectId}'`, error);
            alert(`Error: ${error.message}`);
        }
    }
}

async function autoSaveProject() {
    if (!currentProjectId || !vibeTree || !db.isLoggedIn()) return;

    try {
        await db.saveProject(currentProjectId, vibeTree);

        // In a full file-based system, you might save individual files here.
        // For now, saving the whole project blob is sufficient.
        // The `assembleMultiFileBundle` logic is primarily for ZIP export.

        renderFileTree(); // Keep file tree in sync
        console.log(`Project '${currentProjectId}' auto-saved.`);
    } catch (error) {
        console.error("Auto-save failed:", error);
    }
}

// Add event listeners for project management buttons
projectListContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('load-project-button')) {
        handleLoadProject(event);
    }
    if (event.target.classList.contains('delete-project-button')) {
        handleDeleteProject(event);
    }
});

// =============================
// CONTEXT / COMPONENT LIBRARY
// =============================

/**
 * Opens the modal to add a new component or edit an existing one.
 * @param {string|null} componentId - The ID of the component to edit, or null to create a new one.
 * @param {object|null} componentData - Pre-filled data for a new component (e.g., from AI extraction).
 */
function openComponentModal(componentId = null, componentData = null) {
    componentModalError.textContent = '';
    
    if (componentData) {
        componentModalTitle.textContent = 'Save New Component';
        componentIdInput.value = componentData.id || '';
        componentIdInput.readOnly = false;
        componentNameInput.value = componentData.name || '';
        componentDescriptionInput.value = componentData.description || '';
        componentHtmlInput.value = componentData.html || '';
        componentCssInput.value = componentData.css || '';
        componentJsInput.value = componentData.javascript || '';
        deleteComponentButton.style.display = 'none';
    } else if (componentId) {
        const component = db.getComponent(componentId);
        if (!component) {
            console.error(`Component not found: ${componentId}`);
            return;
        }
        componentModalTitle.textContent = 'Edit Component';
        componentIdInput.value = component.id;
        componentIdInput.readOnly = true;
        componentNameInput.value = component.name;
        componentDescriptionInput.value = component.description || '';
        componentHtmlInput.value = component.html || '';
        componentCssInput.value = component.css || '';
        componentJsInput.value = component.javascript || '';
        deleteComponentButton.style.display = 'inline-block';
        deleteComponentButton.dataset.id = component.id;
    } else {
        componentModalTitle.textContent = 'Add New Component';
        componentIdInput.value = '';
        componentIdInput.readOnly = false;
        componentNameInput.value = '';
        componentDescriptionInput.value = '';
        componentHtmlInput.value = '';
        componentCssInput.value = '';
        componentJsInput.value = '';
        deleteComponentButton.style.display = 'none';
    }

    if(componentAiPromptInput) componentAiPromptInput.value = '';

    contextComponentModal.style.display = 'block';
    if (componentData || componentId) {
        componentNameInput.focus();
    } else {
        componentAiPromptInput.focus();
    }
}

/**
 * Closes the component management modal.
 */
function closeComponentModal() {
    contextComponentModal.style.display = 'none';
}

/**
 * Uses AI to generate a component based on a user prompt and populates the modal fields.
 */
async function handleAiGenerateComponent() {
    const prompt = componentAiPromptInput.value.trim();
    if (!prompt) {
        componentModalError.textContent = 'Please enter a description for the AI to generate a component.';
        return;
    }

    const originalText = generateComponentButton.innerHTML;
    generateComponentButton.disabled = true;
    generateComponentButton.innerHTML = 'Generating... <div class="loading-spinner"></div>';
    componentModalError.textContent = '';

    try {
        const systemPrompt = `You are an expert frontend developer creating reusable, framework-agnostic web components. Your task is to generate a single, self-contained component based on a user's prompt.

        **OUTPUT FORMAT:** You MUST respond with a single, valid JSON object and nothing else. Do not include any explanatory text, comments, or markdown formatting outside of the JSON object itself.

        **JSON SCHEMA:**
        {
          "id": "string // A unique, descriptive, kebab-case identifier derived from the prompt (e.g., 'dark-mode-toggle').",
          "name": "string // A human-readable, Title Case display name (e.g., 'Dark Mode Toggle').",
          "description": "string // A concise, one-sentence summary of the component's purpose and usage.",
          "html": "string // The complete, self-contained HTML snippet for the component.",
          "css": "string // The corresponding CSS, scoped to the component using classes from the HTML.",
          "javascript": "string // The necessary JavaScript to make the component interactive, preferably wrapped in an IIFE to avoid global scope pollution."
        }`;

        const userPrompt = `Generate a component based on the following request: "${prompt}"`;
        
        console.log(`Generating component with AI from prompt: "${prompt}"`);
        
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const aiComponent = JSON.parse(rawResponse);

        if (!aiComponent.id || !aiComponent.name || !aiComponent.html) {
            throw new Error("AI response is missing required fields (id, name, html).");
        }

        componentIdInput.value = aiComponent.id || '';
        componentNameInput.value = aiComponent.name || '';
        componentDescriptionInput.value = aiComponent.description || '';
        componentHtmlInput.value = aiComponent.html || '';
        componentCssInput.value = aiComponent.css || '';
        componentJsInput.value = aiComponent.javascript || '';
        
        console.log(`AI successfully generated component '${aiComponent.name}'. Please review and save.`);
        componentAiPromptInput.value = '';

    } catch (error) {
        console.error("AI Component Generation Failed:", error);
        const errorMessage = `AI generation failed: ${error.message}. Please check the console for details.`;
        componentModalError.textContent = errorMessage;
    } finally {
        generateComponentButton.disabled = false;
        generateComponentButton.innerHTML = 'Generate Component';
    }
}


/**
 * Saves a component from the modal form data to the database.
 */
function handleSaveComponent() {
    const id = componentIdInput.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const name = componentNameInput.value.trim();
    const isEditing = componentIdInput.readOnly;

    componentModalError.textContent = '';
    if (!id || !name) {
        componentModalError.textContent = 'ID and Name are required.';
        return;
    }

    if (!isEditing && db.getComponent(id)) {
        componentModalError.textContent = 'This Component ID is already in use.';
        return;
    }

    const component = {
        id,
        name,
        description: componentDescriptionInput.value.trim(),
        html: componentHtmlInput.value.trim(),
        css: componentCssInput.value.trim(),
        javascript: componentJsInput.value.trim(),
    };

    db.saveComponent(component);
    console.log(`Component '${name}' saved.`);
    closeComponentModal();
    renderComponentList();
    selectComponentForPreview(id);
}

/**
 * Deletes the selected component after confirmation.
 */
function handleDeleteComponentFromModal() {
    const componentId = deleteComponentButton.dataset.id;
    if (componentId && confirm(`Are you sure you want to delete the component "${componentId}"?`)) {
        db.deleteComponent(componentId);
        console.log(`Component '${componentId}' deleted.`);
        closeComponentModal();
        renderComponentList();
        contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
    }
}

/**
 * Renders the list of available components in the Context tab.
 */
function renderComponentList() {
    if (!contextComponentList) return;
    const components = db.listComponents();
    contextComponentList.innerHTML = '';

    if (components.length === 0) {
        contextComponentList.innerHTML = '<p class="empty-list-message">No components yet. Click "Add New Component" to create one.</p>';
        return;
    }

    components.sort((a, b) => a.name.localeCompare(b.name));

    components.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'component-list-item';
        item.dataset.id = comp.id;
        item.innerHTML = `
            <span class="component-name">${comp.name}</span>
            <span class="component-id">(${comp.id})</span>
        `;
        item.addEventListener('click', () => selectComponentForPreview(comp.id));
        contextComponentList.appendChild(item);
    });
}


/**
 * Renders a preview and the code for a selected component.
 * @param {string} componentId - The ID of the component to preview.
 */
function selectComponentForPreview(componentId) {
    if (!contextComponentViewer) return;

    contextComponentList.querySelectorAll('.component-list-item').forEach(el => {
        el.classList.toggle('selected', el.dataset.id === componentId);
    });
    
    const component = db.getComponent(componentId);
    if (!component) {
        contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Component not found.</div>';
        return;
    }
    
    const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 10px; font-family: sans-serif; background-color: #fff; color: #111; }
                ${component.css || ''}
            </style>
        </head>
        <body>
            ${component.html || ''}
            <script>
                (function(){
                    try {
                        ${component.javascript || ''}
                    } catch(e) { console.error(e); }
                })();
            <\/script>
        </body>
        </html>
    `;
    
    contextComponentViewer.innerHTML = `
        <div class="component-viewer-header">
            <h3>${component.name}</h3>
            <p>${component.description || 'No description.'}</p>
            <button class="action-button" id="edit-selected-component-button">Edit</button>
        </div>
        <div class="component-preview-container">
            <h4>Preview</h4>
            <iframe id="context-preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
        <div class="component-code-container">
            <h4>Code Snippets</h4>
            <details open>
                <summary>HTML</summary>
                <textarea readonly>${component.html || ''}</textarea>
            </details>
            <details>
                <summary>CSS</summary>
                <textarea readonly>${component.css || ''}</textarea>
            </details>
            <details>
                <summary>JavaScript</summary>
                <textarea readonly>${component.javascript || ''}</textarea>
            </details>
        </div>
    `;

    const iframe = contextComponentViewer.querySelector('#context-preview-frame');
    iframe.srcdoc = previewHtml;

    contextComponentViewer.querySelector('#edit-selected-component-button').addEventListener('click', () => {
        openComponentModal(componentId);
    });
}

/**
 * Handles the download of the entire component library as a JSON file.
 */
function handleDownloadContext() {
    try {
        const library = db.getComponentLibrary();
        if (Object.keys(library).length === 0) {
            alert("Component library is empty. Nothing to download.");
            return;
        }
        const libraryJson = JSON.stringify(library, null, 2);
        const blob = new Blob([libraryJson], { type: 'application/json' });
        triggerBlobDownload(blob, 'vibe-component-library.json');
        console.log('Component library downloaded successfully.');
    } catch (e) {
        console.error("Failed to download component library:", e);
        alert(`An error occurred while preparing the download: ${e.message}`);
    }
}

/**
 * Triggers the hidden file input to upload a context library.
 */
function handleUploadContextTrigger() {
    contextUploadInput.click();
}

// START OF FIX: Correctly handle the FileList object to process the selected file.
/**
 * Processes the uploaded component library file.
 * @param {Event} event - The file input change event.
 */
async function processContextUpload(event) {
    const files = event.target.files;

    if (!files || files.length === 0) {
        console.log("No file selected for context upload.");
        return;
    }

    const file = files; // FIX: Get the first file from the FileList.
    console.log(`Context library file selected: ${file.name}`);

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const newLibrary = JSON.parse(text);

            if (typeof newLibrary !== 'object' || newLibrary === null || Array.isArray(newLibrary)) {
                throw new Error("Invalid format. The file must contain a JSON object.");
            }

            const componentCount = Object.keys(newLibrary).length;
            const currentCount = db.listComponents().length;

            if (!confirm(`This will replace your current library of ${currentCount} components with the new library of ${componentCount} components. Are you sure you want to continue?`)) {
                console.log("Context library import cancelled by user.");
                return;
            }

            for (const key in newLibrary) {
                const comp = newLibrary[key];
                if (typeof comp !== 'object' || !comp.id || !comp.name) {
                     console.warn(`Warning: Imported component with key '${key}' is missing 'id' or 'name'. Importing anyway.`);
                }
                if (key !== comp.id) {
                     console.warn(`Warning: Component key '${key}' does not match component.id '${comp.id}'. The library will still be saved.`);
                }
            }

            db.saveComponentLibrary(newLibrary);
            console.log(`Successfully imported ${componentCount} components.`);
            
            renderComponentList();
            if (contextComponentViewer) {
                contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
            }

        } catch (error) {
            console.error("Failed to upload/process context library:", error);
            alert(`Error importing library: ${error.message}`);
        } finally {
            // Reset the input so the same file can be uploaded again
            contextUploadInput.value = '';
        }
    };

    reader.onerror = (error) => {
        console.error("Error reading context file:", error);
        alert("An error occurred while reading the file.");
    };

    reader.readAsText(file);
}

/**
 * Generic handler to extract a node as a component and open the save modal.
 * @param {string} nodeId - The ID of the node to extract.
 * @param {HTMLElement|null} buttonElement - The button that was clicked, for UI feedback.
 */
async function extractAndOpenComponentModal(nodeId, buttonElement = null) {
    if (!nodeId) return;

    const node = findNodeById(nodeId);
    if (!node) {
        console.error(`Node not found, cannot save as component: ${nodeId}`);
        return;
    }

    let originalHtml = '';
    if (buttonElement) {
        originalHtml = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = 'Analyzing...';
    }
    
    console.log(`AI is analyzing node '${nodeId}' to create a component...`);

    try {
        const systemPrompt = `You are an expert component extractor. Your task is to analyze a website's full structure (a "vibe tree") and extract a specific node, along with all its dependencies, into a self-contained, reusable component.

        **INPUT:**
        1.  **targetNodeId:** The ID of the vibe node to extract.
        2.  **fullVibeTree:** The entire JSON structure of the website.
        
        **ANALYSIS STEPS:**
        1.  **Find the HTML:** Locate the target node. Its \`code\` is the root of the component's HTML. If it has children, recursively combine their HTML to form the complete structure.
        2.  **Find the CSS:** Search all \`css\` nodes in the entire vibe tree. Extract any CSS rules that apply to the target node's HTML (e.g., by its ID, classes, or child element selectors). Combine these into a single CSS block.
        3.  **Find the JavaScript:** Search all \`javascript\` and \`js-function\` nodes. Extract any code that references the target node's HTML (e.g., via \`document.getElementById\`, \`querySelector\`, or event listeners attached to its elements). Combine this logic into a single script.

        **OUTPUT FORMAT:**
        You MUST respond with a single, valid JSON object and nothing else.
        
        **JSON SCHEMA:**
        {
          "id": "string // A suggested unique, kebab-case ID for the new component, based on the original node ID.",
          "name": "string // A suggested human-readable, Title Case name for the new component.",
          "description": "string // A concise summary of the component's purpose, derived from the original node's description.",
          "html": "string // The complete, self-contained HTML for the component, including all children.",
          "css": "string // All relevant and extracted CSS.",
          "javascript": "string // All relevant and extracted JavaScript."
        }`;

        const userPrompt = `Extract the node with ID "${nodeId}" from the following Vibe Tree into a self-contained component.\n\nFull Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const extractedComponent = JSON.parse(rawResponse);

        if (!extractedComponent.id || !extractedComponent.name) {
            throw new Error("AI failed to return a valid component structure with id and name.");
        }
        
        console.log(`AI analysis complete. Please review and save the new component.`);
        
        closeEditNodeModal();
        switchToTab('context');
        openComponentModal(null, extractedComponent);

    } catch (e) {
        console.error("Save as component failed:", e);
        const errorMessage = `AI analysis failed: ${e.message}`;
        if (buttonElement) {
            const errorEl = buttonElement.closest('.modal-content')?.querySelector('.modal-error');
            if (errorEl) errorEl.textContent = errorMessage;
        }
    } finally {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalHtml;
        }
    }
}

// Handler for the button inside the Edit Node MODAL
async function handleSaveNodeAsComponent(event) {
    const nodeId = event.target.dataset.nodeId;
    await extractAndOpenComponentModal(nodeId, event.target);
}

// Handler for the button inside the VIBE EDITOR
async function handleSaveNodeAsComponentFromEditor(event) {
    const nodeId = event.target.dataset.id;
    await extractAndOpenComponentModal(nodeId, event.target);
}


// Files tab implementation
let filesState = {
    selectedPath: null,
    clipboard: null // { path, isBinary, mimeType }
};

// Build a nested tree from flat file paths
function buildFolderTree(paths) {
    const root = { name: '', type: 'folder', children: new Map() };
    for (const p of paths) {
        const parts = p.split('/').filter(Boolean);
        let cur = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            if (!cur.children.has(part)) {
                cur.children.set(part, isLast ? { name: part, type: 'file', path: parts.slice(0, i + 1).join('/') } : { name: part, type: 'folder', children: new Map() });
            }
            cur = cur.children.get(part);
        }
    }
    return root;
}

async function renderFileTree() {
    if (!filesTreeEl) return;
    filesTreeEl.innerHTML = '';

    if (!currentProjectId) {
        filesTreeEl.innerHTML = '<div class="files-empty">No project loaded. Create or load a project to manage files.</div>';
        return;
    }
    
    try {
        const paths = await db.listFiles(currentProjectId);
        if (!paths || paths.length === 0) {
            filesTreeEl.innerHTML = '<div class="files-empty">No files yet. Use Upload or New File to get started.</div>';
            return;
        }

        const root = buildFolderTree(paths);

        const ul = document.createElement('ul');
        ul.className = 'files-ul';
        function renderNode(node, parentUl) {
            // Convert map to array and sort: folders first, then alphabetically
            const children = Array.from(node.children.values()).sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });

            for (const child of children) {
                const li = document.createElement('li');
                const row = document.createElement('div');
                row.className = 'file-row';
                const icon = document.createElement('span');
                icon.className = 'file-icon';
                icon.textContent = child.type === 'folder' ? '📁' : '📄';
                const name = document.createElement('span');
                name.className = 'file-name';
                name.textContent = child.name;
                row.appendChild(icon);
                row.appendChild(name);
                li.appendChild(row);
                parentUl.appendChild(li);

                if (child.type === 'folder') {
                    const childUl = document.createElement('ul');
                    childUl.className = 'files-ul';
                    li.appendChild(childUl);
                    renderNode(child, childUl);
                    row.addEventListener('click', (e) => {
                        e.stopPropagation();
                        childUl.style.display = childUl.style.display === 'none' ? '' : 'none';
                    });
                } else {
                    row.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectFile(child.path, row);
                    });
                }
            }
        }
        renderNode(root, ul);
        filesTreeEl.appendChild(ul);
    } catch (e) {
        console.error("Failed to render file tree:", e);
        filesTreeEl.innerHTML = `<div class="files-empty">Error loading files: ${e.message}</div>`;
    }
}

function selectFile(path, rowEl) {
    filesState.selectedPath = path;
    filesTreeEl.querySelectorAll('.file-row.selected').forEach(row => row.classList.remove('selected'));
    if (rowEl) rowEl.classList.add('selected');
    renderFilePreview(path);
}

async function renderFilePreview(path) {
    if (!filesPreviewEl) return;
    filesPreviewEl.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const fileData = await db._fetch('loadFile', { projectId: currentProjectId, filePath: path });
        if (!fileData) throw new Error("File not found on backend.");

        filesPreviewEl.innerHTML = '';
        
        const info = document.createElement('div');
        info.className = 'files-preview-info';
        info.innerHTML = `
            <div><strong>Path:</strong> <code>${path}</code></div>
            <div><strong>Type:</strong> ${fileData.mimeType}${fileData.isBinary ? ' (binary)' : ''}</div>
            <div class="files-preview-actions">
                <button class="action-button" id="copy-asset-path">Copy Path</button>
            </div>
        `;

        const copyBtnHandler = () => navigator.clipboard.writeText(path).then(() => console.log(`Asset path copied: ${path}`));

        if (fileData.isBinary) {
            const blob = await db.getFileBlob(currentProjectId, path);
            const url = URL.createObjectURL(blob);
            let previewEl;
            if (fileData.mimeType.startsWith('image/')) {
                previewEl = document.createElement('img');
                previewEl.className = 'files-preview-image';
            } else if (fileData.mimeType.startsWith('video/')) {
                previewEl = document.createElement('video');
                previewEl.className = 'files-preview-video';
                previewEl.controls = true;
            } else if (fileData.mimeType.startsWith('audio/')) {
                previewEl = document.createElement('audio');
                previewEl.controls = true;
            } else {
                previewEl = document.createElement('div');
                previewEl.className = 'files-preview-placeholder';
                previewEl.textContent = 'Binary file preview not supported.';
            }
            if (previewEl.src !== undefined) previewEl.src = url;
            filesPreviewEl.appendChild(previewEl);
            filesPreviewEl.appendChild(info);
            filesPreviewEl.querySelector('#copy-asset-path').addEventListener('click', copyBtnHandler);
        } else {
            const textContent = fileData.content;
            const ta = document.createElement('textarea');
            ta.className = 'files-preview-text';
            ta.value = textContent;
            filesPreviewEl.appendChild(ta);

            const saveRow = document.createElement('div');
            saveRow.className = 'files-preview-actions';
            const saveBtn = document.createElement('button');
            saveBtn.className = 'action-button';
            saveBtn.textContent = 'Save';
            saveBtn.addEventListener('click', async () => {
                await db.saveTextFile(currentProjectId, path, ta.value);
                console.log(`Saved file: ${path}`);
                // If index.html is changed, we should offer to rebuild the tree
                if(path.toLowerCase().endsWith('index.html')) {
                    if(confirm("index.html has changed. Rebuild the Vibe Tree from file content? This will overwrite your current tree structure.")) {
                         rebuildAndRefreshFromFiles();
                    }
                }
            });
            saveRow.appendChild(saveBtn);
            filesPreviewEl.appendChild(saveRow);
            filesPreviewEl.appendChild(info);
            filesPreviewEl.querySelector('#copy-asset-path').addEventListener('click', copyBtnHandler);
        }
    } catch (e) {
        console.error('Preview failed:', e);
        filesPreviewEl.innerHTML = `<div class="files-preview-placeholder">Failed to preview: ${e.message}</div>`;
    }
}

function ensureProjectForFiles() {
    if (currentProjectId) return true;
    alert('Please create or load a project before managing files.');
    return false;
}

async function handleFilesUpload() {
    if (!ensureProjectForFiles()) return;
    const files = Array.from(filesUploadInput.files || []);
    if (files.length === 0) return;
    for (const f of files) {
        try {
            const path = `assets/${f.name}`;
            if (f.type.startsWith('text/') || ['application/json', 'application/javascript', 'image/svg+xml'].includes(f.type)) {
                await db.saveTextFile(currentProjectId, path, await f.text());
            } else {
                await db.saveBinaryFile(currentProjectId, path, new Uint8Array(await f.arrayBuffer()), f.type || guessMimeType(f.name));
            }
            console.log(`Uploaded: ${path}`);
        } catch (e) {
            console.error('Upload error:', e);
            alert(`Failed to upload ${f.name}: ${e.message}`);
        }
    }
    await renderFileTree();
    filesUploadInput.value = '';
}

async function handleFilesNewFolder() {
    if (!ensureProjectForFiles()) return;
    const name = prompt('New folder path (e.g., assets/images):', 'assets/new-folder');
    if (!name) return;
    const keepPath = `${name.replace(/^\/+|\/+$/g, '')}/.keep`;
    await db.saveTextFile(currentProjectId, keepPath, '');
    await renderFileTree();
}

async function handleFilesNewFile() {
    if (!ensureProjectForFiles()) return;
    const pathInput = prompt('New file path (e.g., assets/data/info.txt):', 'assets/new-file.txt');
    if (!pathInput) return;
    const path = String(pathInput).replace(/^\/+/, '');
    await db.saveTextFile(currentProjectId, path, '');
    await renderFileTree();
    selectFile(path);
}

async function handleFilesDownload() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    try {
        const blob = await db.getFileBlob(currentProjectId, filesState.selectedPath);
        triggerBlobDownload(blob, filesState.selectedPath.split('/').pop());
    } catch (e) {
        console.error('Download failed:', e);
        alert(`Download failed: ${e.message}`);
    }
}

async function handleFilesCopy() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    filesState.clipboard = { path: filesState.selectedPath };
    console.log(`Copied file to clipboard: ${filesState.selectedPath}`);
}

async function handleFilesPaste() {
    if (!ensureProjectForFiles() || !filesState.clipboard) return;
    const clip = filesState.clipboard;
    const baseName = clip.path.split('/').pop();
    const dir = clip.path.includes('/') ? clip.path.split('/').slice(0, -1).join('/') : '';
    let newName = baseName.includes('.') ? baseName.replace(/(\.[^.]*)$/, '-copy$1') : `${baseName}-copy`;
    let dest = dir ? `${dir}/${newName}` : newName;

    const existing = new Set(await db.listFiles(currentProjectId));
    let i = 2;
    while (existing.has(dest)) {
        newName = baseName.includes('.') ? baseName.replace(/(\.[^.]*)$/, `-copy-${i}$1`) : `${baseName}-copy-${i}`;
        dest = dir ? `${dir}/${newName}` : newName;
        i++;
    }

    try {
        // We need to re-fetch the file content to copy it
        const originalFile = await db._fetch('loadFile', { projectId: currentProjectId, filePath: clip.path });
        if (!originalFile) throw new Error("Original file not found.");
        
        await db._fetch('saveFile', {
            projectId: currentProjectId,
            filePath: dest,
            fileContent: originalFile.content,
            mimeType: originalFile.mimeType,
            isBinary: originalFile.isBinary,
        });

        await renderFileTree();
        selectFile(dest);
        console.log(`Pasted file as: ${dest}`);
    } catch (e) {
        console.error('Paste failed:', e);
        alert(`Paste failed: ${e.message}`);
    }
}

async function handleFilesRename() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    const path = filesState.selectedPath;
    const newPath = prompt('New path/name:', path);
    if (!newPath || newPath === path) return;
    try {
        await db.renameFile(currentProjectId, path, newPath.replace(/^\/+/, ''));
        await renderFileTree();
        selectFile(newPath);
        console.log(`Renamed: ${path} -> ${newPath}`);
    } catch (e) {
        console.error('Rename failed:', e);
        alert(`Rename failed: ${e.message}`);
    }
}

async function handleFilesDelete() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    const path = filesState.selectedPath;
    if (!confirm(`Delete file "${path}"? This cannot be undone.`)) return;
    try {
        await db.deleteFile(currentProjectId, path);
        filesState.selectedPath = null;
        await renderFileTree();
        if (filesPreviewEl) filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file.</div>';
        console.log(`Deleted: ${path}`);
    } catch (e) {
        console.error('Delete failed:', e);
        alert(`Delete failed: ${e.message}`);
    }
}

// START OF FIX: Moved helper function definitions to global scope
function bindEventListeners() {
    handleTabSwitching();
    if (toggleInspectButton) toggleInspectButton.addEventListener('click', toggleInspectMode);
    if (undoButton) undoButton.addEventListener('click', doUndo);
    if (redoButton) redoButton.addEventListener('click', doRedo);
    if (updateTreeFromCodeButton) updateTreeFromCodeButton.addEventListener('click', handleUpdateTreeFromCode);
    if (uploadHtmlButton) uploadHtmlButton.addEventListener('click', () => htmlFileInput.click());
    if (htmlFileInput) htmlFileInput.addEventListener('change', handleFileUpload);
    if (uploadZipButton) uploadZipButton.addEventListener('click', () => zipFileInput.click());
    if (zipFileInput) zipFileInput.addEventListener('change', handleZipUpload);
    if (downloadZipButton) downloadZipButton.addEventListener('click', handleDownloadProjectZip);
    if (filesUploadButton) filesUploadButton.addEventListener('click', () => filesUploadInput.click());
    if (filesUploadInput) filesUploadInput.addEventListener('change', handleFilesUpload);
    if (filesNewFolderButton) filesNewFolderButton.addEventListener('click', handleFilesNewFolder);
    if (filesNewFileButton) filesNewFileButton.addEventListener('click', handleFilesNewFile);
    if (filesDownloadButton) filesDownloadButton.addEventListener('click', handleFilesDownload);
    if (filesCopyButton) filesCopyButton.addEventListener('click', handleFilesCopy);
    if (filesPasteButton) filesPasteButton.addEventListener('click', handleFilesPaste);
    if (filesRenameButton) filesRenameButton.addEventListener('click', handleFilesRename);
    if (filesDeleteButton) filesDeleteButton.addEventListener('click', handleFilesDelete);
    if (searchInput) searchInput.addEventListener('input', handleSearchInput());
    if (findNextButton) findNextButton.addEventListener('click', findNextMatch);
    if (findPrevButton) findPrevButton.addEventListener('click', findPrevMatch);
    if (aiEditorSearchButton) aiEditorSearchButton.addEventListener('click', handleAiEditorSearch);
    if (aiEditorSearchInput) aiEditorSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAiEditorSearch();
    });
    
    // AGENT AND ITERATIVE MODE LISTENERS
    if (runAgentSingleTaskButton) runAgentSingleTaskButton.addEventListener('click', handleRunAgent);
    if (startIterativeSessionButton) startIterativeSessionButton.addEventListener('click', handleStartIterativeSession);
    if (acceptContinueButton) acceptContinueButton.addEventListener('click', handleAcceptAndContinue);
    if (requestChangesButton) requestChangesButton.addEventListener('click', handleRequestChanges);
    if (endSessionButton) endSessionButton.addEventListener('click', handleEndIterativeSession);
    
    if (generateFlowchartButton) generateFlowchartButton.addEventListener('click', handleGenerateFlowchart);
    if (generateProjectButton) generateProjectButton.addEventListener('click', handleGenerateProject);
    if (startIterativeBuildButton) startIterativeBuildButton.addEventListener('click', handleStartIterativeProjectBuild);

    if (sendChatButton) sendChatButton.addEventListener('click', handleSendChatMessage);
    if (chatPromptInput) {
        chatPromptInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendChatMessage();
            }
        });
    }
    
    if (addNewComponentButton) addNewComponentButton.addEventListener('click', () => openComponentModal(null));
    if (saveComponentButton) saveComponentButton.addEventListener('click', handleSaveComponent);
    if (closeComponentModalButton) closeComponentModalButton.addEventListener('click', closeComponentModal);
    if (deleteComponentButton) deleteComponentButton.addEventListener('click', handleDeleteComponentFromModal);
    if (generateComponentButton) generateComponentButton.addEventListener('click', handleAiGenerateComponent);
    if (downloadContextButton) downloadContextButton.addEventListener('click', handleDownloadContext);
    if (uploadContextButton) uploadContextButton.addEventListener('click', handleUploadContextTrigger);
    if (contextUploadInput) contextUploadInput.addEventListener('change', processContextUpload);

    const addModalCloseBtn = addNodeModal ? addNodeModal.querySelector('.close-button') : null;
    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', () => settingsModal.style.display = 'block');
    if (startPageSettingsButton) startPageSettingsButton.addEventListener('click', () => settingsModal.style.display = 'block');
    if (closeSettingsModalButton) closeSettingsModalButton.addEventListener('click', () => settingsModal.style.display = 'none');
    if (createNodeButton) createNodeButton.addEventListener('click', handleCreateNode);
    if (addModalCloseBtn) addModalCloseBtn.addEventListener('click', () => addNodeModal.style.display = 'none');
    if (saveEditNodeButton) saveEditNodeButton.addEventListener('click', handleSaveEditedNode);
    if (closeEditNodeModalButton) closeEditNodeModalButton.addEventListener('click', closeEditNodeModal);
    if (aiImproveDescriptionButton) aiImproveDescriptionButton.addEventListener('click', handleAiImproveDescription);
    if (saveAsComponentButton) saveAsComponentButton.addEventListener('click', handleSaveNodeAsComponent);
    if (aiProviderSelect) aiProviderSelect.addEventListener('change', handleProviderChange);
    if (geminiModelSelect) geminiModelSelect.addEventListener('change', () => localStorage.setItem('geminiModel', geminiModelSelect.value));
    if (saveApiKeyButton) saveApiKeyButton.addEventListener('click', saveGeminiApiKey);
    if (saveNscaleApiKeyButton) saveNscaleApiKeyButton.addEventListener('click', saveNscaleApiKey);
    if (newProjectButton) newProjectButton.addEventListener('click', resetToStartPage);
    
    if (globalAgentLoader) globalAgentLoader.addEventListener('click', hideGlobalAgentLoader);

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) settingsModal.style.display = 'none';
        if (event.target === addNodeModal) addNodeModal.style.display = 'none';
        if (event.target === editNodeModal) editNodeModal.style.display = 'none';
        if (event.target === contextComponentModal) contextComponentModal.style.display = 'none';
    });
}
    
async function resetToStartPage() {
    console.log("Resetting to new project state.");
    currentProjectId = null;
    vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
    resetHistory();
    switchToTab('start');
    projectPromptInput.value = '';
    newProjectIdInput.value = '';
    startPageGenerationOutput.style.display = 'none';
    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if(generateProjectButton) generateProjectButton.disabled = !keyIsAvailable;
    if(newProjectContainer) newProjectContainer.style.display = 'block';
    if(editorContainer) editorContainer.innerHTML = '';
    if(previewContainer) previewContainer.srcdoc = 'about:blank';
    if(agentOutput) agentOutput.innerHTML = '<div class="agent-message-placeholder">The agent\'s plan and actions will appear here.</div>';
    if(chatOutput) chatOutput.innerHTML = '<div class="chat-message-placeholder">Start the conversation by typing a message below.</div>';
    if(flowchartOutput) flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Click "Generate Flowchart" to create a diagram.</div>';
    if(consoleOutput) consoleOutput.innerHTML = '';
    if(fullCodeEditor) fullCodeEditor.value = '';
    await populateProjectList();
    console.log("Ready for new project.");
}

async function buildAssetUrlMap() {
    if (!currentProjectId) return {};
    const assetMap = {};
    try {
        const files = await db.listFiles(currentProjectId);
        for (const path of files) {
            try {
                const blob = await db.getFileBlob(currentProjectId, path);
                assetMap[path] = URL.createObjectURL(blob);
            } catch (e) {
                console.warn(`Could not create blob URL for asset: ${path}`, e);
            }
        }
    } catch (e) {
        console.error("Failed to build asset URL map:", e);
    }
    return assetMap;
}

function injectAssetRewriterScript(doc, assetMap) {
    if (Object.keys(assetMap).length === 0) return;
    const script = doc.createElement('script');
    script.textContent = `
        document.addEventListener('DOMContentLoaded', () => {
            const assetMap = ${JSON.stringify(assetMap)};
            const selectors = 'img[src], script[src], link[href], source[src], video[src], audio[src]';
            document.querySelectorAll(selectors).forEach(el => {
                const attr = el.hasAttribute('src') ? 'src' : 'href';
                const originalPath = el.getAttribute(attr);
                if (originalPath) {
                    const cleanPath = new URL(originalPath, document.baseURI).pathname.substring(1);
                    if (assetMap[cleanPath]) {
                        el.setAttribute(attr, assetMap[cleanPath]);
                    }
                }
            });
        });
    `;
    doc.head.appendChild(script);
}

async function updateNodeByDescription(nodeId, newDescription, buttonEl = null) {
    const node = findNodeById(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    recordHistory(`Edit description for ${nodeId} (modal)`);
    node.description = newDescription;

    let originalHtml = '';
    if (buttonEl) {
        originalHtml = buttonEl.innerHTML;
        buttonEl.disabled = true;
        buttonEl.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    }

    try {
        if (node.type === 'container') {
            const newChildren = await generateCompleteSubtree(node);
            node.children = newChildren;
            refreshAllUI();
        } else {
            const systemPrompt = getAgentSystemPrompt();
            const fullTreeString = JSON.stringify(vibeTree, null, 2);
            const userPrompt = `The user has updated the description for component "${node.id}" to: "${newDescription}". Analyze this change and generate a plan to update the entire website accordingly.\n\nFull Vibe Tree:\n\`\`\`json\n${fullTreeString}\n\`\`\``;

            const rawResponse = await callAI(systemPrompt, userPrompt, true);
            const agentDecision = JSON.parse(rawResponse);
            executeAgentPlan(agentDecision, (msg, t = 'info') => console.log(`[ModalUpdate] ${msg}`, t));
        }
        switchToTab('preview');
    } finally {
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.innerHTML = originalHtml || 'Save & Update Vibe';
        }
    }
}

function buildBasicMermaidFromTree(tree) {
    let graph = 'graph TD\n';
    const addNode = (node, parentId = null) => {
        const safeId = (node.id || 'node').replace(/[^a-zA-Z0-9_]/g, '_');
        const label = `${node.id}\\n(${node.type})`;
        graph += `  ${safeId}["${label}"]\n`;
        if (parentId) {
            graph += `  ${parentId} --> ${safeId}\n`;
        }
        if (Array.isArray(node.children)) {
            node.children.forEach(child => addNode(child, safeId));
        }
    };
    addNode(vibeTree); // Start from the root
    return graph;
}

function extractMermaidFromText(text) {
    if (!text) return '';
    const mermaidFence = text.match(/```mermaid\s*([\s\S]*?)\s*```/i);
    if (mermaidFence && mermaidFence) return mermaidFence;
    if (text.trim().startsWith('graph')) return text.trim();
    return '';
}

async function renderMermaidInto(container, graphText) {
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'mermaid';
    el.textContent = graphText;
    container.appendChild(el);
    try {
        await window.mermaid.run({ nodes: [el] });
    } catch (e) {
        console.error('Mermaid render error:', e);
        container.innerHTML = `<div class="flowchart-placeholder">Render error: ${e.message}</div>`;
        throw e;
    }
}

async function handleGenerateFlowchart() {
    if (typeof window.mermaid === 'undefined') return;

    const originalText = generateFlowchartButton.innerHTML;
    generateFlowchartButton.disabled = true;
    generateFlowchartButton.innerHTML = 'Generating... <div class="loading-spinner"></div>';
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">AI is analyzing your project...</div>';

    const systemPrompt = `You are a senior frontend architect. Given a "vibe tree" describing a website, produce a clear Mermaid diagram explaining its structure and behavior. Return ONLY a Mermaid definition. Prefer "graph TD". Use correct syntax like '-->'. Show key sections, group nodes by type, and draw edges for DOM containment and JS interactions.`;
    const userPrompt = `Create a Mermaid diagram for this website code structure.\n\nVibe Tree JSON:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

    try {
        const aiText = await callAI(systemPrompt, userPrompt, false);
        const mermaidText = extractMermaidFromText(aiText);
        if (!mermaidText) throw new Error('AI did not return a valid Mermaid graph.');
        await renderMermaidInto(flowchartOutput, mermaidText);
        console.log('AI-generated flowchart rendered.');
    } catch (e) {
        console.warn('AI flowchart failed, falling back to basic graph:', e);
        try {
            await renderMermaidInto(flowchartOutput, buildBasicMermaidFromTree(vibeTree));
        } catch (fallbackError) {
             flowchartOutput.innerHTML = `<div class="flowchart-placeholder">Could not render flowchart.</div>`;
        }
    } finally {
        generateFlowchartButton.disabled = false;
        generateFlowchartButton.innerHTML = originalText;
    }
}

async function handleGenerateProject() {
    try {
        const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
        if (!keyIsAvailable) {
            alert(`Please add your API Key in Settings to generate a project.`);
            return;
        }

        const prompt = (projectPromptInput.value || '').trim();
        if (!prompt) {
            alert('Please enter a description for your new project.');
            return;
        }

        let desiredId = (newProjectIdInput.value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!desiredId) desiredId = `project-${Date.now()}`;
        
        const existing = await db.listProjects();
        let projectId = desiredId;
        let suffix = 2;
        while (existing.includes(projectId)) projectId = `${desiredId}-${suffix++}`;

        newProjectContainer.style.display = 'none';
        startPageGenerationOutput.style.display = 'block';
        generationStatusText.textContent = 'Generating your project...';
        liveCodeOutput.textContent = '';

        vibeTree = { id: 'whole-page', type: 'container', description: prompt, children: [] };
        vibeTree.children = await generateCompleteSubtree(vibeTree);

        currentProjectId = projectId;
        resetHistory();
        
        liveCodeOutput.textContent = generateFullCodeString(vibeTree);
        generationStatusText.textContent = 'Project generated! Finalizing...';

        await autoSaveProject();
        await populateProjectList();

        refreshAllUI();
        switchToTab('preview');
        console.log(`New project '${currentProjectId}' created.`);
    } catch (e) {
        console.error('Project generation failed:', e);
        generationStatusText.textContent = 'Generation failed.';
        alert(`Failed to generate project: ${e.message}`);
        newProjectContainer.style.display = 'block';
    }
}

async function handleStartIterativeProjectBuild() {
    try {
        const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
        if (!keyIsAvailable) {
            alert(`Please add your API Key in Settings to generate a project.`);
            return;
        }

        const prompt = (projectPromptInput.value || '').trim();
        if (!prompt) {
            alert('Please enter a description for your new project.');
            return;
        }

        let desiredId = (newProjectIdInput.value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!desiredId) desiredId = `project-${Date.now()}`;

        const existing = await db.listProjects();
        let projectId = desiredId;
        let suffix = 2;
        while (existing.includes(projectId)) projectId = `${desiredId}-${suffix++}`;

        // Initialize a new, empty project
        currentProjectId = projectId;
        vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
        vibeTree.description = prompt; // Set the overall goal
        await db.saveProject(currentProjectId, vibeTree);
        await populateProjectList();
        resetHistory();
        refreshAllUI(); // Refresh UI to show the empty project state

        console.log(`New project '${currentProjectId}' created for iterative session.`);

        // Switch to agent tab and kick off the iterative process
        switchToTab('agent');
        agentPromptInput.value = prompt; // Pre-fill the goal
        handleStartIterativeSession(); // Start the planning phase

    } catch (e) {
        console.error('Iterative project build failed:', e);
        alert(`Failed to start iterative build: ${e.message}`);
    }
}

async function handleAiImproveDescription() {
    const nodeId = editNodeIdInput.value;
    const node = findNodeById(nodeId);
    if (!node) {
        editNodeError.textContent = 'Internal error: node not found.';
        return;
    }

    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (!keyIsAvailable) {
        alert(`Please add your API Key in Settings to use AI features.`);
        return;
    }

    const originalHtml = aiImproveDescriptionButton.innerHTML;
    aiImproveDescriptionButton.disabled = true;
    aiImproveDescriptionButton.innerHTML = 'Analyzing... <div class="loading-spinner"></div>';
    editNodeError.textContent = '';

    try {
        const systemPrompt = `You are a senior frontend engineer and technical writer. Given a website component (its type, code, and context), write an improved, more detailed description in 2-5 concise sentences. Focus on intent, structure, behavior, interactions, and dependencies. Output plain text only.`;

        const context = {
            node: { id: node.id, type: node.type, currentDescription: node.description || '', code: node.code || '' },
            parent: (() => {
                const res = findNodeAndParentById(node.id);
                return res && res.parent ? { id: res.parent.id, type: res.parent.type } : null;
            })(),
        };

        const userPrompt = `Improve the component description.\n\nComponent Context (JSON):\n${JSON.stringify(context, null, 2)}`;
        
        let improved = (await callAI(systemPrompt, userPrompt, false)).trim();
        const fenced = improved.match(/```[\s\S]*?```/);
        if (fenced && fenced) improved = fenced.replace(/```[a-z]*\s*|\s*```/gi, '').trim();

        if (improved) {
            editNodeDescriptionInput.value = improved;
            console.log(`AI generated a richer description for "${node.id}".`);
        } else {
            editNodeError.textContent = 'AI returned an empty response.';
        }
    } catch (e) {
        console.error('AI Improve Description failed:', e);
        editNodeError.textContent = e.message || 'Failed to get improved description.';
    } finally {
        aiImproveDescriptionButton.disabled = false;
        aiImproveDescriptionButton.innerHTML = originalHtml;
    }
}

function handleCollapseToggle(event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const childrenEl = btn.closest('.vibe-node').querySelector(':scope > .children');
    if (!childrenEl) return;

    const isCollapsed = childrenEl.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', String(!isCollapsed));
    btn.textContent = isCollapsed ? '▶' : '▼';
}

function handleNodeContentToggle(event) {
    // Do not toggle content if the drag handle was the click target
    if (event.target.classList.contains('drag-handle')) {
        return;
    }
    const header = event.currentTarget;
    header.closest('.vibe-node').classList.toggle('collapsed');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing application.");
    
    // Initialize non-auth-dependent parts first
    initializeApiSettings();
    initializeMermaid();
    bindEventListeners();
    
    // Initialize auth flow which will control the main app visibility
    initializeAuth();

    updateUndoRedoUI();
});
