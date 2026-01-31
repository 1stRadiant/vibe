
const startSel = document.getElementById('start-component-shorthand-select');
const agentSel = document.getElementById('agent-component-shorthand-select');

// --- UPDATED DATABASE CONFIGURATION & HELPER ---
/*const DB_NAME = 'VibeLocalDB';
const DB_VERSION = 2; // Increased version to create the new store
const STORE_NAME = 'projects';
const KV_STORE_NAME = 'appState'; // New store for session metadata

let dbPromise = null;
*/
const VIBE_JSON_LIBRARY = {
  "responsive-navbar": { "id": "responsive-navbar", "name": "Responsive Navbar", "description": "A sleek, modern navigation bar.", "html": "<nav class=\"vibe-nav\">...</nav>", "css": ".vibe-nav{...}", "javascript": "..." },
  "mega-menu": { "id": "mega-menu", "name": "Mega Menu", "html": "...", "css": "...", "javascript": "" },
  "topbar": { "id": "topbar", "name": "Topbar", "html": "...", "css": "...", "javascript": "" },
  "sidebar": { "id": "sidebar", "name": "Sidebar", "html": "...", "css": "...", "javascript": "..." },
  "breadcrumbs": { "id": "breadcrumbs", "name": "Breadcrumbs", "html": "...", "css": "...", "javascript": "" },
  "pagination": { "id": "pagination", "name": "Pagination", "html": "...", "css": "...", "javascript": "" },
  "sticky-header": { "id": "sticky-header", "name": "Sticky Header", "html": "...", "css": "...", "javascript": "..." },
  "mobile-drawer": { "id": "mobile-drawer", "name": "Mobile Drawer", "html": "...", "css": "...", "javascript": "..." },
  "grid-system": { "id": "grid-system", "name": "Grid System", "html": "...", "css": "...", "javascript": "" },
  "container": { "id": "container", "name": "Container", "html": "...", "css": "...", "javascript": "" },
  "hero-section": { "id": "hero-section", "name": "Hero Section", "html": "...", "css": "...", "javascript": "" },
  "footer-basic": { "id": "footer-basic", "name": "Footer", "html": "...", "css": "...", "javascript": "" },
  "card-grid": { "id": "card-grid", "name": "Card Grid", "html": "...", "css": "...", "javascript": "" },
  "card": { "id": "card", "name": "Content Card", "html": "...", "css": "...", "javascript": "" },
  "testimonial": { "id": "testimonial", "name": "Testimonial Card", "html": "...", "css": "...", "javascript": "" },
  "pricing-table": { "id": "pricing-table", "name": "Pricing Table", "html": "...", "css": "...", "javascript": "" },
  "carousel": { "id": "carousel", "name": "Carousel Slider", "html": "...", "css": "...", "javascript": "..." },
  "gallery-lightbox": { "id": "gallery-lightbox", "name": "Gallery + Lightbox", "html": "...", "css": "...", "javascript": "..." },
  "button": { "id": "button", "name": "Button System", "html": "...", "css": "...", "javascript": "" },
  "input-floating": { "id": "input-floating", "name": "Input with Floating Label", "html": "...", "css": "...", "javascript": "" },
  "toggle-switch": { "id": "toggle-switch", "name": "Toggle Switch", "html": "...", "css": "...", "javascript": "" },
  "modal": { "id": "modal", "name": "Modal Dialog", "html": "...", "css": "...", "javascript": "..." },
  "toast": { "id": "toast", "name": "Toast Notification", "html": "...", "css": "...", "javascript": "..." },
  "theme-switcher": { "id": "theme-switcher", "name": "Theme Switcher", "html": "...", "css": "...", "javascript": "..." }
};


// --- START OF LIVE VIEW PRE-BOOTSTRAPPER ---
(function() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'live') {
            document.title = 'Loading Project...';
            const style = document.createElement('style');
            style.textContent = `
                body { background-color: #282c34; }
                #auth-modal, #main-app-container { display: none !important; }
            `;
            requestAnimationFrame(() => document.head.appendChild(style));
        }
    } catch (e) {
        console.error('Live view pre-bootstrapper failed:', e);
    }
})();


// app.js

import * as api from './api.js';

// --- START OF LIVE VIEW BOOTLOADER ---

function compressProjectData(projectData) {
    try {
        // Optimization: Use native browser capabilities to handle large strings 
        // without looping through every single byte manually.
        const jsonString = JSON.stringify(projectData);
        return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    } catch (e) {
        console.error("Failed to encode project data:", e);
        throw new Error("Failed to encode project data for saving.");
    }
}

function decompressProjectData(dataString) {
    try {
        return JSON.parse(decodeURIComponent(atob(dataString).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
    } catch (e) {
        console.error("Failed to decode or parse project data:", e);
        throw new Error("Failed to decode or parse project data. It may be corrupt.");
    }
}

function generateFullCodeString(tree, userId, projectId) {
    let cssContent = '';
    let jsContent = '';
    let htmlContent = '';
    let headContent = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;

    const buildHtmlRecursive = (nodes) => {
        let currentHtml = '';
        if (!nodes) return currentHtml;
        const htmlNodes = nodes.filter(n => n.type === 'html');
        htmlNodes.forEach(node => {
            let finalCode = node.code;
            if (finalCode && finalCode.trim().startsWith('<')) {
                finalCode = finalCode.replace(/<([a-zA-Z0-9\-]+)/, `<$1 data-vibe-node-id="${node.id}"`);
            }
            if (node.children && node.children.length > 0) {
                const innerHtml = buildHtmlRecursive(node.children);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = finalCode;
                if (wrapper.firstElementChild) {
                    wrapper.firstElementChild.innerHTML = innerHtml;
                    currentHtml += wrapper.innerHTML + '\n';
                } else {
                    currentHtml += finalCode + '\n';
                }
            } else {
                currentHtml += finalCode + '\n';
            }
        });
        return currentHtml;
    };

    function traverse(node) {
        switch (node.type) {
            case 'head':
                if (node.code) headContent = node.code;
                break;
            case 'css':
                cssContent += node.code + '\n\n';
                break;
            case 'javascript':
            case 'js-function':
            case 'declaration':
                jsContent += node.code + '\n\n';
                break;
        }
        if (node.children) {
            node.children.forEach(traverse);
        }
    }

    traverse(tree);
    if (tree.children) {
        htmlContent = buildHtmlRecursive(tree.children);
    }

    const vibeDbScript = `
<script>
/* --- Vibe Database Connector --- */
(function() {
    const APPS_SCRIPT_URL = '${api.APPS_SCRIPT_URL}';
    const USER_ID = '${userId}';
    const PROJECT_ID = '${projectId}';
    const CHUNK_SIZE = 1500;

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT') || !USER_ID || !PROJECT_ID) {
        window.vibe = { loadData: () => Promise.resolve([]) };
        return;
    }

    const getFormDbId = (formId) => \`\${PROJECT_ID}__form__\${formId}\`;

    function jsonpRequest(action, params = {}) {
        return new Promise((resolve, reject) => {
            const callbackName = 'vibe_jsonp_callback_' + Math.round(100000 * Math.random());
            const script = document.createElement('script');
            let url = \`\${APPS_SCRIPT_URL}?action=\${action}&callback=\${callbackName}\`;
            for (const key in params) {
                url += \`&\${key}=\${encodeURIComponent(params[key])}\`;
            }
            script.src = url;
            window[callbackName] = (data) => {
                delete window[callbackName];
                document.body.removeChild(script);
                if (data.status === 'success') resolve(data.data);
                else reject(new Error(data.message || 'API Error'));
            };
            script.onerror = () => {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('API request failed.'));
            };
            document.body.appendChild(script);
        });
    }
    
    function decompressData(dataString) {
        const binaryString = atob(dataString);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        const jsonString = new TextDecoder().decode(uint8Array);
        return JSON.parse(jsonString);
    }

    async function saveProjectInChunks(projectId, data) {
        const jsonString = JSON.stringify(data);
        const uint8Array = new TextEncoder().encode(jsonString);
        let binaryString = '';
        uint8Array.forEach(byte => { binaryString += String.fromCharCode(byte); });
        const dataString = btoa(binaryString);

        const chunks = [];
        for (let i = 0; i < dataString.length; i += CHUNK_SIZE) {
            chunks.push(dataString.substring(i, i + CHUNK_SIZE));
        }

        for (let i = 0; i < chunks.length; i++) {
            await jsonpRequest('saveProjectChunk', {
                userId: USER_ID,
                projectId: projectId,
                chunkData: chunks[i],
                chunkIndex: i,
                totalChunks: chunks.length,
                compressed: false,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async function saveFormData(formId, formData) {
        const formDbId = getFormDbId(formId);
        let submissions = [];
        try {
            const existingData = await window.vibe.loadData(formId);
            if (Array.isArray(existingData)) {
                submissions = existingData;
            }
        } catch (e) {
            console.log('No existing data for this form, creating new list.');
        }
        
        submissions.push({
            timestamp: new Date().toISOString(),
            data: formData
        });

        await saveProjectInChunks(formDbId, submissions);
    }

    window.vibe = {
        loadData: async function(formId) {
            if (!formId) {
                return Promise.reject(new Error('formId is required.'));
            }
            try {
                const formDbId = getFormDbId(formId);
                const compressedData = await jsonpRequest('loadProject', { userId: USER_ID, projectId: formDbId });
                return decompressData(compressedData);
            } catch (e) {
                return [];
            }
        }
    };

    document.addEventListener('submit', async (e) => {
        const form = e.target;
        const formId = form.getAttribute('data-vibe-form');
        if (!formId) return;

        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        let originalButtonContent = '';
        if (submitButton) {
            originalButtonContent = submitButton.innerHTML || submitButton.value;
            submitButton.disabled = true;
            submitButton.value = 'Submitting...';
            submitButton.innerHTML = 'Submitting...';
        }

        try {
            await saveFormData(formId, data);
            form.innerHTML = '<p style="text-align: center; color: green; padding: 20px;">Thank you for your submission!</p>';
        } catch (error) {
            console.error('Form submission failed:', error);
            const errorEl = document.createElement('p');
            errorEl.style.color = 'red';
            errorEl.textContent = 'Submission failed. Please try again later.';
            form.appendChild(errorEl);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.value = originalButtonContent;
                submitButton.innerHTML = originalButtonContent;
            }
        }
    }, true);
})();
<\/script>
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${headContent.trim()}
    <style>${cssContent.trim()}</style>
</head>
<body>
${htmlContent.trim()}
    ${(userId && projectId) ? vibeDbScript.trim() : ''}
    <script>(function() {${jsContent.trim()}})();<\/script>
</body>
</html>`;
}


async function runLiveView(userId, projectId) {
    try {
        document.body.innerHTML = '<div style="font-family: sans-serif; text-align: center; padding-top: 20vh; color: #ccc; background-color: #282c34; height: 100vh; margin: 0;">Loading Project...</div>';
        const compressedData = await api.loadProject(userId, projectId);
        const projectTree = decompressProjectData(compressedData);
        
        let fullHtml;
        if (projectTree && projectTree.type === 'raw-html-container') {
             fullHtml = projectTree.code || '';
        } else {
             fullHtml = generateFullCodeString(projectTree, userId, projectId);
        }

        document.open();
        document.write(fullHtml);
        document.close();
    } catch (e) {
        console.error("Failed to load live view:", e);
        document.body.innerHTML = `<div style="font-family: sans-serif; text-align: center; padding-top: 20vh; color: #e06c75; background-color: #282c34; height: 100vh; margin: 0;"><h1>Error</h1><p>Could not load project.</p><p style="color: #999;">${e.message}</p></div>`;
    }
}

// --- END OF LIVE VIEW BOOTLOADER ---

const authModal = document.getElementById('auth-modal');
const mainAppContainer = document.getElementById('main-app-container');
const authError = document.getElementById('auth-error');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const signupUsernameInput = document.getElementById('signup-username');
const signupPasswordInput = document.getElementById('signup-password');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const userStatusText = document.getElementById('user-status-text');
const logoutButton = document.getElementById('logout-button');


const previewContainer = document.getElementById('website-preview');
const editorContainer = document.getElementById('vibe-editor');
const toggleInspectButton = document.getElementById('toggle-inspect-button');

const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const shareProjectButton = document.getElementById('share-project-button');
const saveToCloudButton = document.getElementById('save-to-cloud-button');
const saveToLocalButton = document.getElementById('save-to-local-button');
const saveToGithubButton = document.getElementById('save-to-github-button');

const startPage = document.getElementById('start');
const projectPromptInput = document.getElementById('project-prompt-input');
const generateProjectButton = document.getElementById('generate-project-button');
const startPageGenerationOutput = document.getElementById('start-page-generation-output');
const generationStatusText = document.getElementById('generation-status-text');
const liveCodeOutput = document.getElementById('live-code-output');

const projectInstructionsInput = document.getElementById('project-instructions-input');
const generateFromInstructionsButton = document.getElementById('generate-from-instructions-button');

const newProjectIdInput = document.getElementById('new-project-id-input');
const projectListContainer = document.getElementById('project-list');
const noProjectsMessage = document.getElementById('no-projects-message');
const newProjectContainer = document.getElementById('new-project-container');
const startIterativeBuildButton = document.getElementById('start-iterative-build-button');
const storageToggleButtons = document.querySelectorAll('.storage-toggle button');

// GITHUB UI Elements
const githubLoadContainer = document.getElementById('github-load-container');
const githubRepoSelect = document.getElementById('github-repo-select');
const githubBranchSelect = document.getElementById('github-branch-select');
const loadFromGithubButton = document.getElementById('load-from-github-button');
const githubSettingsContainer = document.getElementById('github-settings-container');
const githubPatInput = document.getElementById('github-pat-input');
const saveGithubPatButton = document.getElementById('save-github-pat-button');
const githubStatus = document.getElementById('github-status');
const logoutGithubButton = document.getElementById('logout-github-button');


const fullCodeEditor = document.getElementById('full-code-editor');
const updateTreeFromCodeButton = document.getElementById('update-tree-from-code-button');
const fullCodeAiPromptInput = document.getElementById('full-code-ai-prompt');
const runFullCodeAiButton = document.getElementById('run-full-code-ai-button');

const searchInput = document.getElementById('search-input');
const findNextButton = document.getElementById('find-next-button');
const findPrevButton = document.getElementById('find-prev-button');
const searchResultsCount = document.getElementById('search-results-count');

const aiEditorSearchInput = document.getElementById('ai-editor-search-input');
const aiEditorSearchButton = document.getElementById('ai-editor-search-button');

const htmlFileInput = document.getElementById('html-file-input');
const uploadHtmlButton = document.getElementById('upload-html-button');
const zipFileInput = document.getElementById('zip-file-input');
const uploadZipButton = document.getElementById('upload-zip-button');
const downloadZipButton = document.getElementById('download-zip-button');

const aiProviderSelect = document.getElementById('ai-provider-select');
const geminiSettingsContainer = document.getElementById('gemini-settings-container');
const geminiModelSelect = document.getElementById('gemini-model-select');
const geminiApiKeyContainer = document.getElementById('gemini-api-key-container');
const nscaleApiKeyContainer = document.getElementById('nscale-api-key-container');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key-button');
const apiKeyStatus = document.getElementById('api-key-status');
const nscaleApiKeyInput = document.getElementById('nscale-api-key-input');
const saveNscaleApiKeyButton = document.getElementById('save-nscale-api-key-button');
const nscaleApiKeyStatus = document.getElementById('nscale-api-key-status');

const agentPromptInput = document.getElementById('agent-prompt-input');
const runAgentSingleTaskButton = document.getElementById('run-agent-single-task-button');
const startIterativeSessionButton = document.getElementById('start-iterative-session-button');
const agentOutput = document.getElementById('agent-output');
const agentTabButton = document.querySelector('.tab-button[data-tab="agent"]');

const endSessionButton = document.getElementById('end-session-button');

const chatSystemPromptInput = document.getElementById('chat-system-prompt-input');
const chatOutput = document.getElementById('chat-output');
const chatPromptInput = document.getElementById('chat-prompt-input');
const sendChatButton = document.getElementById('send-chat-button');

const generateFlowchartButton = document.getElementById('generate-flowchart-button');
const flowchartOutput = document.getElementById('flowchart-output');
const consoleErrorIndicator = document.getElementById('console-error-indicator');
const newProjectButton = document.getElementById('new-project-button');

const openAiStructureModalButton = document.getElementById('open-ai-structure-modal-button');
const aiStructureModal = document.getElementById('ai-structure-modal');
const aiStructureCloseButton = document.getElementById('ai-structure-close-button');
const aiStructurePromptInput = document.getElementById('ai-structure-prompt-input');
const aiStructureExecuteButton = document.getElementById('ai-structure-execute-button');
const aiStructureError = document.getElementById('ai-structure-error');

const aiControlsModal = document.getElementById('ai-controls-modal');
const aiControlsModalTitle = document.getElementById('ai-controls-modal-title');
const aiControlsNodeIdInput = document.getElementById('ai-controls-node-id');
const aiControlsPromptInput = document.getElementById('ai-controls-prompt-input');
const aiControlsExecuteButton = document.getElementById('ai-controls-execute-button');
const aiControlsCloseButton = document.getElementById('ai-controls-close-button');
const aiControlsError = document.getElementById('ai-controls-error');

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

const globalAgentLoader = document.getElementById('global-agent-loader');
const globalAgentStatusText = document.getElementById('global-agent-status-text');
const globalAgentProgressText = document.getElementById('global-agent-progress-text');

const contextComponentList = document.getElementById('context-component-list');
const addNewComponentButton = document.getElementById('add-new-component-button');
const contextComponentViewer = document.getElementById('context-component-viewer');
const downloadContextButton = document.getElementById('download-context-button');
const uploadContextButton = document.getElementById('upload-context-button');
const contextUploadInput = document.getElementById('context-upload-input');

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
const componentAiPromptInput = document.getElementById('component-ai-prompt-input');
const generateComponentButton = document.getElementById('generate-component-button');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalButton = document.getElementById('close-settings-modal-button');
const startPageSettingsButton = document.getElementById('start-page-settings-button');
const openSettingsModalButton = document.getElementById('open-settings-modal-button');

const addNodeModal = document.getElementById('add-node-modal');
const closeModalButton = document.querySelector('.close-button');
const createNodeButton = document.getElementById('create-node-button');
const addNodeParentIdInput = document.getElementById('add-node-parent-id');
const newNodeIdInput = document.getElementById('new-node-id');
const newNodeDescriptionInput = document.getElementById('new-node-description');
const newNodeTypeInput = document.getElementById('new-node-type');
const addNodeError = document.getElementById('add-node-error');
const addNodeTargetIdInput = document.getElementById('add-node-target-id');
const addNodePositionInput = document.getElementById('add-node-position');

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

const aiProjectEditModal = document.getElementById('ai-project-edit-modal');
const aiProjectEditModalTitle = document.getElementById('ai-project-edit-modal-title');
const aiProjectEditNodeIdInput = document.getElementById('ai-project-edit-node-id');
const aiProjectEditPromptInput = document.getElementById('ai-project-edit-prompt-input');
const aiProjectEditExecuteButton = document.getElementById('ai-project-edit-execute-button');
const aiProjectEditCloseButton = document.getElementById('ai-project-edit-close-button');
const aiProjectEditError = document.getElementById('ai-project-edit-error');

const COMPONENT_LIBRARY_KEY_PREFIX = '_vibe_component_library_';
const getComponentLibraryKey = () => `${COMPONENT_LIBRARY_KEY_PREFIX}${currentUser.userId}`;

function getComponentLibrary() {
    try {
        const libraryStr = localStorage.getItem(getComponentLibraryKey());
        return libraryStr ? JSON.parse(libraryStr) : {};
    } catch (e) {
        console.error("Failed to load component library:", e);
        return {};
    }
}

function saveComponentLibrary(library) {
    try {
        localStorage.setItem(getComponentLibraryKey(), JSON.stringify(library));
        refreshShorthandDropdowns();
    } catch (e) {
        console.error("Failed to save component library:", e);
    }
}

function listComponents() { return Object.values(getComponentLibrary()); }
function getComponent(componentId) { return getComponentLibrary()[componentId] || null; }
function saveComponent(component) {
    const library = getComponentLibrary();
    library[component.id] = component;
    saveComponentLibrary(library);
}
function deleteComponent(componentId) {
    const library = getComponentLibrary();
    delete library[componentId];
    saveComponentLibrary(library);
}


// --- Application State ---
let currentUser = null; 
let githubUser = null; 
let taskQueue = [];
let isTaskQueueRunning = false;
let waitingForAgentConfirmation = false;
let currentAgentTaskContext = ""; 
let firstNodeToSwapId = null;

const vibeEventBus = new EventTarget();
const AUTO_PILOT_EVENTS = {
    QUEUE_COMPLETE: 'queue-complete',
    RUNTIME_ERROR: 'runtime-error',
    AGENT_LOG: 'agent-log'
};
let activeAutoPilotListeners = []; 

let currentProjectId = null;
let currentProjectStorageType = 'cloud';
let currentProjectGithubSource = null;
let agentConversationHistory = [];
let chatConversationHistory = [];
let iframeErrors = [];
let currentAIProvider = 'gemini';
let geminiApiKey = '';
let nscaleApiKey = '';
const NSCALE_API_ENDPOINT = 'https://inference.api.nscale.com/v1/chat/completions';
const NSCALE_MODEL = 'Qwen/Qwen3-235B-A22B';
let vibeTree = {};
const initialVibeTree = {
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
vibeTree = JSON.parse(JSON.stringify(initialVibeTree));

// --- Suggestion Engine (Autocompletion for Component IDs) ---
const SuggestionEngine = {
    dropdown: null,
    activeInput: null,
    visible: false,
    nodes: [],
    
    init() {
        const style = document.createElement('style');
        style.textContent = `
            .vibe-suggestion-dropdown {
                position: absolute;
                background: #282c34;
                border: 1px solid #444;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                max-height: 200px;
                overflow-y: auto;
                z-index: 9999;
                min-width: 250px;
                display: none;
            }
            .vibe-suggestion-item {
                padding: 8px 12px;
                cursor: pointer;
                color: #abb2bf;
                border-bottom: 1px solid #333;
                font-family: monospace;
                font-size: 0.9em;
            }
            .vibe-suggestion-item:last-child { border-bottom: none; }
            .vibe-suggestion-item:hover, .vibe-suggestion-item.selected {
                background-color: #3e4451;
                color: #fff;
            }
            .vibe-suggestion-item .type {
                float: right;
                font-size: 0.8em;
                opacity: 0.6;
                margin-left: 10px;
                background: #21252b;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .vibe-suggestion-item .desc {
                display: block;
                font-size: 0.8em;
                opacity: 0.7;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 2px;
            }
        `;
        document.head.appendChild(style);

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'vibe-suggestion-dropdown';
        document.body.appendChild(this.dropdown);
    },

    flattenNodes(node = vibeTree, list = []) {
        if(!node) return list;
        if (node.id) {
            list.push({
                id: node.id,
                type: node.type,
                description: node.description || ''
            });
        }
        if (node.children) {
            node.children.forEach(child => this.flattenNodes(child, list));
        }
        return list;
    },

    attachToInputs() {
        const inputs = [
            agentPromptInput,
            chatPromptInput,
            aiStructurePromptInput,
            aiProjectEditPromptInput,
            aiControlsPromptInput,
            componentAiPromptInput,
            fullCodeAiPromptInput
        ];

        inputs.forEach(input => {
            if(!input) return;
            input.addEventListener('keyup', (e) => this.handleInput(e));
            input.addEventListener('keydown', (e) => this.handleKeydown(e));
            input.addEventListener('blur', () => setTimeout(() => this.hide(), 200));
            input.addEventListener('click', () => this.hide());
        });
    },

    handleInput(e) {
        const input = e.target;
        this.activeInput = input;
        
        const cursorIndex = input.selectionStart;
        const textBeforeCursor = input.value.substring(0, cursorIndex);
        
        const match = textBeforeCursor.match(/#([\w-]*)$/);
        
        if (match) {
            const query = match[1].toLowerCase();
            this.nodes = this.flattenNodes();
            const filtered = this.nodes.filter(n => n.id.toLowerCase().includes(query));
            
            if (filtered.length > 0) {
                this.show(filtered, input);
            } else {
                this.hide();
            }
        } else {
            this.hide();
        }
    },

    handleKeydown(e) {
        if (!this.visible) return;

        const items = this.dropdown.querySelectorAll('.vibe-suggestion-item');
        let selected = this.dropdown.querySelector('.vibe-suggestion-item.selected');
        let index = Array.from(items).indexOf(selected);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            index = (index + 1) % items.length;
            this.selectItem(items[index]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            index = (index - 1 + items.length) % items.length;
            this.selectItem(items[index]);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (selected) {
                this.insertId(selected.dataset.id);
            }
        } else if (e.key === 'Escape') {
            this.hide();
        }
    },

    selectItem(item) {
        if (!item) return;
        this.dropdown.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
    },

    show(items, input) {
        this.visible = true;
        this.dropdown.innerHTML = '';
        
        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'vibe-suggestion-item';
            if (idx === 0) div.classList.add('selected');
            div.dataset.id = item.id;
            div.innerHTML = `
                ${item.id} <span class="type">${item.type}</span>
                <span class="desc">${item.description}</span>
            `;
            div.onclick = (e) => {
                e.preventDefault(); 
                this.insertId(item.id);
            };
            this.dropdown.appendChild(div);
        });

        const rect = input.getBoundingClientRect();
        this.dropdown.style.left = `${rect.left + window.scrollX}px`;
        this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        this.dropdown.style.width = `${rect.width}px`;
        this.dropdown.style.display = 'block';
    },

    hide() {
        this.visible = false;
        this.dropdown.style.display = 'none';
    },

    insertId(id) {
        if (!this.activeInput) return;
        const input = this.activeInput;
        const cursorIndex = input.selectionStart;
        const text = input.value;
        const textBeforeCursor = text.substring(0, cursorIndex);
        const match = textBeforeCursor.match(/#([\w-]*)$/); 

        if (match) {
            const beforeMatch = text.substring(0, match.index);
            const afterCursor = text.substring(cursorIndex);
            
            input.value = beforeMatch + id + afterCursor;
            input.focus();
            
            const newCursorPos = beforeMatch.length + id.length;
            input.setSelectionRange(newCursorPos, newCursorPos);
        }
        this.hide();
    }
};

// --- Authentication Logic ---

function showAuthForm(formToShow) {
    authError.textContent = '';
    if (formToShow === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        document.getElementById('auth-title').textContent = 'Sign Up';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        document.getElementById('auth-title').textContent = 'Login';
    }
}

async function handleLogin() {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if (!username || !password) {
        authError.textContent = 'Please enter a username and password.';
        return;
    }
    
    authError.textContent = '';
    loginButton.disabled = true;
    loginButton.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const userData = await api.login(username, password);
        onLoginSuccess(userData);
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login';
    }
}
const SESSION_KEYS = {
    TAB: 'vibe_session_tab',
    PROJECT_ID: 'vibe_session_project_id',
    STORAGE_TYPE: 'vibe_session_storage_type',
    GITHUB_SOURCE: 'vibe_session_github_source'
}
const idbKV = {
    async set(key, value) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(KV_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(KV_STORE_NAME);
            const request = store.put({ key, value });
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },
    async get(key) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(KV_STORE_NAME, 'readonly');
            const store = transaction.objectStore(KV_STORE_NAME);
            const request = store.get(key);
            
            request.onsuccess = () => {
                // request.result is undefined if key not found
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },
    async remove(key) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(KV_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(KV_STORE_NAME);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
}



async function handleSignup() {
    const username = signupUsernameInput.value.trim();
    const password = signupPasswordInput.value.trim();
    if (!username || !password) {
        authError.textContent = 'Please enter a username and password.';
        return;
    }
    
    authError.textContent = '';
    signupButton.disabled = true;
    signupButton.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const result = await api.signup(username, password);
        onLoginSuccess(result);
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        signupButton.disabled = false;
        signupButton.innerHTML = 'Sign Up';
    }
}

function onLoginSuccess(userData) {
    currentUser = userData;
    sessionStorage.setItem('vibeUser', JSON.stringify(currentUser));
    
    authModal.style.display = 'none';
    mainAppContainer.style.display = 'block';
    
    const sidebarUsernameEl = document.querySelector("#dropdownUser1 .d-none.d-sm-inline");
    if (sidebarUsernameEl) {
        sidebarUsernameEl.textContent = currentUser.username;
    }
    
    console.log(`User '${currentUser.username}' logged in.`);
    
    populateProjectList();
    resetToStartPage();
    updateSaveButtonStates(); 
    refreshShorthandDropdowns();
}

function handleLogout() {
    clearSessionMetadata(); // Clear persistent session
    currentUser = null;
    sessionStorage.removeItem('vibeUser');
    
    mainAppContainer.style.display = 'none';
    showAuthForm('login');
    authModal.style.display = 'block';
    if(shareProjectButton) shareProjectButton.disabled = true;
    updateSaveButtonStates();
    if(openAiStructureModalButton) openAiStructureModalButton.disabled = true;
    
    console.log("User logged out.");
}

function checkLoggedInState() {
    const storedUser = sessionStorage.getItem('vibeUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            if (userData.userId && userData.username) {
                onLoginSuccess(userData);
            }
        } catch (e) {
            console.error("Failed to parse stored user data.", e);
            handleLogout();
        }
    }
}

function showGlobalAgentLoader(status, progress = '') {
    if (!globalAgentLoader) return;
    globalAgentStatusText.textContent = status;
    globalAgentProgressText.textContent = progress;
    globalAgentLoader.classList.add('visible');
}

function updateGlobalAgentLoader(status, progress = '') {
    if (!globalAgentLoader || !globalAgentLoader.classList.contains('visible')) {
        showGlobalAgentLoader(status, progress);
        return;
    }
    globalAgentStatusText.textContent = status;
    globalAgentProgressText.textContent = progress;
}

function hideGlobalAgentLoader() {
    if (!globalAgentLoader) return;
    globalAgentLoader.classList.remove('visible');
}

// --- On-page Console Logging ---
const consoleOutput = document.getElementById('console-output');
let currentLogGroup = consoleOutput; 

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
            el.textContent = String(arg); 
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

function stringifySerializedArgs(args) {
    let fullMessage = '';
    for (const arg of args) {
        if (arg.type === 'object' && arg.value && arg.value.message && arg.value.name) {
            let errorString = `${arg.value.name.value}: ${arg.value.message.value}`;
            if (arg.value.stack) {
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

function renderConsoleMessage(level, args) {
    if (!consoleOutput) return;

    if (level === 'error') {
        const errorMessage = stringifySerializedArgs(args);
        vibeEventBus.dispatchEvent(new CustomEvent(AUTO_PILOT_EVENTS.RUNTIME_ERROR, { 
            detail: { message: errorMessage } 
        }));
    }

    const msgEl = document.createElement('div');
    msgEl.className = `console-message log-type-${level}`;
    const timestamp = `[${new Date().toLocaleTimeString()}] `;
    msgEl.appendChild(document.createTextNode(timestamp));

    args.forEach(arg => {
        msgEl.appendChild(createLogElement(arg));
        msgEl.appendChild(document.createTextNode(' ')); 
    });

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

    if (currentLogGroup.firstChild) {
        currentLogGroup.insertBefore(msgEl, currentLogGroup.firstChild);
    } else {
        currentLogGroup.appendChild(msgEl);
    }
    consoleOutput.scrollTop = 0; 
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
            
            if (currentLogGroup.firstChild) {
                currentLogGroup.insertBefore(group, currentLogGroup.firstChild);
            } else {
                currentLogGroup.appendChild(group);
            }
            
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

const originalConsole = { ...console };

const MAX_DEPTH = 5;

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


Object.keys(originalConsole).forEach(level => {
    if (typeof originalConsole[level] === 'function') {
        console[level] = (...args) => {
            originalConsole[level](...args);
            try {
                const serializedArgs = args.map(arg => serializeArg(arg));
                handleConsoleCommand(level, serializedArgs);
            } catch (e) {
                originalConsole.error('Vibe console proxy failed:', e);
            }
        };
    }
});

window.addEventListener('error', e => console.error(e.error || e.message));
window.addEventListener('unhandledrejection', e => console.error('Unhandled promise rejection:', e.reason));

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

function recordHistory(label = '') {
    if (historyState.isRestoring) return; 
    const current = serializeTree(vibeTree);
    if (current === historyState.lastSnapshotSerialized) {
        return; 
    }
    historyState.undo.push(historyState.lastSnapshotSerialized);
    historyState.redo = [];
    historyState.lastSnapshotSerialized = current;
    updateUndoRedoUI();
    if (label) originalConsole.info(`History recorded: ${label}`);
}

function resetHistory() {
    historyState.undo = [];
    historyState.redo = [];
    historyState.lastSnapshotSerialized = serializeTree(vibeTree);
    historyState.isRestoring = false;
    updateUndoRedoUI();
}

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

// --- START: Share Project Button Logic ---
async function handleShareProject() {
    if (!currentProjectId || !currentUser || currentProjectStorageType !== 'cloud') {
        alert("Only projects saved to the cloud can be shared.");
        return;
    }
    if (vibeTree && vibeTree.type === 'raw-html-container') {
        alert("Sharing via live link is not available for raw HTML projects. Please download the project as a ZIP to share it.");
        return;
    }

    const url = `${window.location.origin}${window.location.pathname}?view=live&user=${encodeURIComponent(currentUser.userId)}&project=${encodeURIComponent(currentProjectId)}`;
    
    try {
        await navigator.clipboard.writeText(url);
        
        const originalHtml = shareProjectButton.innerHTML;
        shareProjectButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        shareProjectButton.disabled = true;

        console.log(`Copied shareable link: ${url}`);

        setTimeout(() => {
            shareProjectButton.innerHTML = originalHtml;
            shareProjectButton.disabled = false;
        }, 2000);

    } catch (err) {
        console.error('Failed to copy share link: ', err);
        alert('Failed to copy the link to your clipboard. You can copy it manually from the console.');
        console.log(`Manual Copy: ${url}`);
    }
}
// --- END: Share Project Button Logic ---

// --- GITHUB INTEGRATION ---

const GITHUB_API_BASE = 'https://api.github.com';
const PROJECT_FILENAME = 'vibe-project.json';

const githubApi = {
    _getToken: () => sessionStorage.getItem('githubToken'),

    _fetch: async (endpoint, options = {}) => {
        const token = githubApi._getToken();
        if (!token) throw new Error("GitHub token not set.");

        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers,
        };

        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`GitHub API Error: ${errorData.message} (Status: ${response.status})`);
        }
        return response.json();
    },

    getUser: () => githubApi._fetch('/user'),
    getRepos: () => githubApi._fetch('/user/repos?sort=pushed&per_page=100'),
    getBranches: (owner, repo) => githubApi._fetch(`/repos/${owner}/${repo}/branches`),

    getProjectFile: async (owner, repo, branch) => {
        try {
            const data = await githubApi._fetch(`/repos/${owner}/${repo}/contents/${PROJECT_FILENAME}?ref=${branch}`);
            if (data.encoding !== 'base64') {
                throw new Error("Expected base64 encoded file from GitHub.");
            }
            return atob(data.content);
        } catch (error) {
            if (error.message.includes("404")) return null; 
            throw error;
        }
    },

    saveProjectFile: async (owner, repo, branch, content, commitMessage) => {
        let sha;
        try {
            const existingFile = await githubApi._fetch(`/repos/${owner}/${repo}/contents/${PROJECT_FILENAME}?ref=${branch}`);
            sha = existingFile.sha;
        } catch (e) {
            if (!e.message.includes("404")) throw e;
        }

        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        const body = {
            message: commitMessage,
            content: encodedContent,
            branch: branch,
        };
        if (sha) {
            body.sha = sha;
        }

        return githubApi._fetch(`/repos/${owner}/${repo}/contents/${PROJECT_FILENAME}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }
};

async function handleSaveGithubPat() {
    const token = githubPatInput.value.trim();
    if (!token) {
        alert("Please enter a GitHub Personal Access Token.");
        return;
    }
    sessionStorage.setItem('githubToken', token);
    await updateGithubUiState();
}

function handleLogoutGithub() {
    sessionStorage.removeItem('githubToken');
    githubUser = null;
    updateGithubUiState();
}

async function updateGithubUiState() {
    const token = sessionStorage.getItem('githubToken');
    if (token) {
        try {
            githubStatus.innerHTML = 'Verifying...';
            githubUser = await githubApi.getUser();
            githubSettingsContainer.classList.add('logged-in');
            githubStatus.innerHTML = `Logged in as <strong>${githubUser.login}</strong>.`;
            githubLoadContainer.style.display = 'block';
            await populateGithubRepos();
        } catch (error) {
            console.error("GitHub auth failed:", error);
            githubStatus.innerHTML = `<span class="text-danger">Invalid token or permission error.</span>`;
            sessionStorage.removeItem('githubToken');
            githubUser = null;
            githubSettingsContainer.classList.remove('logged-in');
            githubLoadContainer.style.display = 'none';
        }
    } else {
        githubUser = null;
        githubSettingsContainer.classList.remove('logged-in');
        githubLoadContainer.style.display = 'none';
        githubStatus.innerHTML = 'Not logged in. <a href="https://github.com/settings/tokens/new?scopes=repo&description=Vibe%20Web%20Builder" target="_blank">Create a token</a> with `repo` scope.';
    }
    updateSaveButtonStates();
}

async function populateGithubRepos() {
    try {
        githubRepoSelect.innerHTML = '<option>Loading repos...</option>';
        const repos = await githubApi.getRepos();
        githubRepoSelect.innerHTML = '<option value="">-- Select a Repository --</option>';
        repos
            .filter(repo => repo.permissions.push) 
            .forEach(repo => {
                const option = new Option(repo.full_name, repo.full_name);
                githubRepoSelect.add(option);
            });
    } catch (error) {
        githubRepoSelect.innerHTML = '<option>Error loading repos</option>';
        console.error("Failed to populate GitHub repos:", error);
    }
}

async function populateGithubBranches() {
    const repoFullName = githubRepoSelect.value;
    if (!repoFullName) {
        githubBranchSelect.innerHTML = '<option>-- Select a Repo First --</option>';
        return;
    }
    try {
        githubBranchSelect.innerHTML = '<option>Loading branches...</option>';
        const [owner, repo] = repoFullName.split('/');
        const branches = await githubApi.getBranches(owner, repo);
        githubBranchSelect.innerHTML = '';
        branches.forEach(branch => {
            const option = new Option(branch.name, branch.name);
            githubBranchSelect.add(option);
        });
    } catch (error) {
        githubBranchSelect.innerHTML = '<option>Error loading branches</option>';
        console.error("Failed to populate GitHub branches:", error);
    }
}


async function handleLoadFromGithub() {
    const repoFullName = githubRepoSelect.value;
    const branch = githubBranchSelect.value;
    if (!repoFullName || !branch) {
        alert("Please select a repository and a branch.");
        return;
    }

    const button = loadFromGithubButton;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Loading...';

    try {
        const [owner, repo] = repoFullName.split('/');
        const fileContent = await githubApi.getProjectFile(owner, repo, branch);
        
        if (fileContent === null) {
            if (confirm(`Project file '${PROJECT_FILENAME}' not found in this branch. Do you want to create a new, empty project and save it there?`)) {
                vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
                currentProjectId = repo;
            } else {
                return;
            }
        } else {
            vibeTree = JSON.parse(fileContent);
            currentProjectId = repo; 
        }

        currentProjectStorageType = 'github';
        currentProjectGithubSource = { owner, repo, branch };

        saveSessionMetadata(); // Save state

        shareProjectButton.disabled = true;
        openAiStructureModalButton.disabled = true;
        updateSaveButtonStates();
        
        console.log(`Project '${repo}' loaded from GitHub (${owner}/${repo}/${branch}).`);
        
        refreshAllUI();
        resetHistory();
        switchToTab('preview');

    } catch (error) {
        console.error(`Could not load project from GitHub:`, error);
        alert(`Error loading from GitHub: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function handleSaveToGitHub() {
    if (!currentProjectId || !vibeTree || !githubUser) {
        alert("Please load a project and log in to GitHub to save.");
        return;
    }

    let target = currentProjectGithubSource;
    if (currentProjectStorageType !== 'github' || !target) {
        const repoFullName = githubRepoSelect.value;
        const branch = githubBranchSelect.value;
        if (!repoFullName || !branch) {
            alert("This project is not from GitHub. Please select a repository and branch from the 'Load from GitHub' section on the Start page to specify a save destination.");
            switchToTab('start');
            return;
        }
        const [owner, repo] = repoFullName.split('/');
        target = { owner, repo, branch };
    }
    
    const commitMessage = prompt("Enter a commit message:", `Update ${currentProjectId} project`);
    if (commitMessage === null) return; 

    const button = saveToGithubButton;
    button.disabled = true;
    const originalHtml = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    
    try {
        const projectJsonString = JSON.stringify(vibeTree, null, 2);
        await githubApi.saveProjectFile(target.owner, target.repo, target.branch, projectJsonString, commitMessage);

        currentProjectStorageType = 'github';
        currentProjectGithubSource = target;
        currentProjectId = target.repo;
        
        button.innerHTML = '<i class="bi bi-check-lg"></i> Saved!';
        console.log(`Project saved to GitHub: ${target.owner}/${target.repo}/${target.branch}`);
        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 2000);

    } catch (error) {
        console.error("Save to GitHub failed:", error);
        button.innerHTML = '<i class="bi bi-x-circle"></i> Error';
        alert(`Failed to save to GitHub: ${error.message}`);
        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 3000);
    }
}

function checkGithubLoginState() {
    const token = sessionStorage.getItem('githubToken');
    if (token) {
        updateGithubUiState();
    }
}

// --- END GITHUB INTEGRATION ---

async function getNewProjectId(storageType, suggestedId) {
    const promptMessage = `Enter a name for the new ${storageType} project. If the name exists, you will be asked to confirm overwriting it.`;
    let newId = prompt(promptMessage, suggestedId);

    if (newId === null) { 
        return null;
    }

    newId = newId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    if (!newId) {
        alert("Project name cannot be empty.");
        return getNewProjectId(storageType, suggestedId); 
    }

    const existingProjects = storageType === 'cloud'
        ? await api.listProjects(currentUser.userId)
        : await localApi.listProjects();

    if (existingProjects.includes(newId)) {
        if (!confirm(`A ${storageType} project named "${newId}" already exists. Do you want to overwrite it?`)) {
            return getNewProjectId(storageType, newId); 
        }
    }

    return newId;
}

function updateSaveButtonStates() {
    if (saveToCloudButton) {
        saveToCloudButton.disabled = !currentProjectId || !currentUser;
    }
    if (saveToLocalButton) {
        saveToLocalButton.disabled = !currentProjectId;
    }
    if (saveToGithubButton) {
        saveToGithubButton.disabled = !currentProjectId || !githubUser;
    }
}

async function handleSaveToCloud() {
    if (!currentProjectId || !vibeTree) return;
    if (!currentUser) {
        alert("Please log in to save projects to the cloud.");
        return;
    }

    let projectIdToSave = currentProjectId;
    if (currentProjectStorageType !== 'cloud') {
        const newCloudId = await getNewProjectId('cloud', currentProjectId);
        if (newCloudId === null) return;
        projectIdToSave = newCloudId;
    }

    const button = saveToCloudButton;
    button.disabled = true;
    const originalHtml = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

    try {
        await api.saveProject(currentUser.userId, projectIdToSave, vibeTree);

        currentProjectId = projectIdToSave;
        currentProjectStorageType = 'cloud';
        currentProjectGithubSource = null; 
        
        saveSessionMetadata(); // Save state

        console.log(`Project '${currentProjectId}' saved to cloud.`);
        button.innerHTML = '<i class="bi bi-check-lg"></i> Saved!';

        shareProjectButton.disabled = false;
        openAiStructureModalButton.disabled = false;
        populateProjectList('cloud');
        
        document.querySelector('.storage-toggle button[data-storage="cloud"]').click();

        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 2000);

    } catch (error) {
        console.error("Save to cloud failed:", error);
        button.innerHTML = '<i class="bi bi-x-circle"></i> Error';
        alert(`Failed to save project to cloud: ${error.message}`);
        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 3000);
    }
}


async function handleSaveToLocal() {
    if (!currentProjectId || !vibeTree) return;

    let projectIdToSave = currentProjectId;
    if (currentProjectStorageType !== 'local') {
        const newLocalId = await getNewProjectId('local', currentProjectId);
        if (newLocalId === null) return;
        projectIdToSave = newLocalId;
    }

    const button = saveToLocalButton;
    button.disabled = true;
    const originalHtml = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

    try {
        await localApi.saveProject(projectIdToSave, vibeTree);
        
        currentProjectId = projectIdToSave;
        currentProjectStorageType = 'local';
        currentProjectGithubSource = null; 

        saveSessionMetadata(); // Save state

        console.log(`Project '${currentProjectId}' saved locally.`);
        button.innerHTML = '<i class="bi bi-check-lg"></i> Saved!';

        shareProjectButton.disabled = true;
        openAiStructureModalButton.disabled = true;
        populateProjectList('local');
        
        document.querySelector('.storage-toggle button[data-storage="local"]').click();

        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 2000);

    } catch (error) {
        console.error("Save to local failed:", error);
        button.innerHTML = '<i class="bi bi-x-circle"></i> Error';
        alert(`Failed to save project locally: ${error.message}`);
        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
        }, 3000);
    }
}


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

    document.querySelectorAll('.ai-powered-button').forEach(button => {
        button.disabled = !keyIsAvailable;
    });

    runAgentSingleTaskButton.disabled = !keyIsAvailable;
    startIterativeSessionButton.disabled = !keyIsAvailable;
    sendChatButton.disabled = !keyIsAvailable;
    updateTreeFromCodeButton.disabled = !keyIsAvailable;
    if(runFullCodeAiButton) runFullCodeAiButton.disabled = !keyIsAvailable;
    generateFlowchartButton.disabled = !keyIsAvailable;
    generateProjectButton.disabled = !keyIsAvailable;
    if(generateFromInstructionsButton) generateFromInstructionsButton.disabled = !keyIsAvailable;
    startIterativeBuildButton.disabled = !keyIsAvailable;
    aiEditorSearchButton.disabled = !keyIsAvailable;
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
    if (node && node.type === 'raw-html-container') return null;
    if (node.id === id) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeById(id, child);
            if (found) return found;
        }
    }
    return null;
}

function renderEditor(node) {
    if (node && node.type === 'raw-html-container') {
        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'editor-placeholder';
        placeholderEl.innerHTML = `
            <h3>Raw Uploaded Project</h3>
            <p>${node.description || 'This project was loaded directly from a file.'}</p>
            <p>The Vibe Editor is disabled for this mode. Use the <strong>Full Code</strong> tab to view and edit the source code.</p>
            <p>To enable the editor, use the "Process into Vibe Tree" button in the "Full Code" tab. This will use AI to structure your project.</p>
        `;
        return placeholderEl;
    }

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
            <span class="drag-handle" title="Click to select for swap">✥</span>
            <span class="id">
                ${hasChildren ? `<button class="collapse-toggle" aria-expanded="false" title="Expand/Collapse Children">▶</button>` : '<span class="collapse-placeholder"></span>'}
                ${node.id}
            </span>
            <span class="type">${node.type}</span>
        </div>
        <div class="vibe-node-content">
            <textarea class="description-input" rows="3" placeholder="Describe the purpose of this component...">${node.description}</textarea>
            <div class="button-group">
                <button class="update-button ai-powered-button" data-id="${node.id}">Update Vibe</button>
                <button class="ai-edit-project-button ai-powered-button" data-id="${node.id}" title="Use this node as context for an AI command to edit the whole project">AI Edit Project</button>
                <button class="generate-controls-button ai-powered-button" data-id="${node.id}" title="Let AI generate editable controls for this element">⚙️ Controls</button>
                ${isContainer ? `<button class="add-child-button" data-id="${node.id}">+ Add Child</button>` : ''}
                ${isSaveable ? `<button class="save-as-component-button ai-powered-button" data-id="${node.id}" title="Save as reusable component">⊕ Save</button>` : ''}
                ${(showCodeButton || isHeadNode) ? `<button class="toggle-code-button" data-id="${node.id}">View Code</button>` : ''}
                ${(showCodeButton || isHeadNode) ? `<button class="save-code-button" data-id="${node.id}" style="display: none;">Save Code</button>` : ''}
            </div>
            <div class="vibe-node-controls" id="controls-for-${node.id}"></div>
            ${(showCodeButton || isHeadNode) ? `<textarea class="code-editor-display" id="editor-${node.id}" style="display: none;"></textarea>` : ''}
        </div>
    `;
    
    const controlsContainer = nodeEl.querySelector(`#controls-for-${node.id}`);
    if (controlsContainer && Array.isArray(node.controls) && node.controls.length > 0) {
        node.controls.forEach(control => {
            controlsContainer.appendChild(renderControl(control, node.id));
        });
    }

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
    const saveButton = button.nextElementSibling; 
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

    recordHistory(`Update description for ${nodeId}`);

    button.disabled = true;
    button.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    console.log(`Updating node: ${nodeId}`);
    
    node.description = newDescription;

    try {
        if (node.type === 'container') {
            console.log(`Regenerating complete subtree for container: ${node.id}`);
            const newChildren = await generateCompleteSubtree(node);
            node.children = newChildren;
            refreshAllUI();
        } else {
            console.log(`Triggering systemic update for node: ${node.id}`);
            
            const systemPrompt = getAgentSystemPrompt();
            const fullTreeString = JSON.stringify(vibeTree, null, 2);
            const fullCurrentCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
            
            const userPrompt = `The user has updated the description for component "${node.id}" to: "${newDescription}". Analyze this change and generate a plan to update the entire website accordingly.

Full Vibe Tree context:
\`\`\`json
${fullTreeString}
\`\`\`

Full Generated Code context:
\`\`\`html
${fullCurrentCode}
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

    const expandedNodeStates = new Map();
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

    if (expandedNodeStates.size > 0 && !(vibeTree && vibeTree.type === 'raw-html-container')) {
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

    addEventListeners();
    applyVibes();
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Code has changed. Click "Generate Flowchart" to create an updated diagram.</div>';

    if (document.getElementById('code').classList.contains('active')) {
        showFullCode();
    }
    
    updateUndoRedoUI();
    autoSaveProject();
}

function getComponentContextForAI() {
    const components = listComponents();
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

function getVibeDbInstructionsForAI() {
    return `
---
**BUILT-IN DATABASE FOR FORMS (VibeDB):**
Your environment includes a simple, built-in database system for handling form submissions, which is automatically available in the live project.

**1. To SAVE Form Data:**
- Simply add the \`data-vibe-form\` attribute to any \`<form>\` element.
- The value of the attribute is a unique name for that form's data, e.g., \`<form data-vibe-form="contact-submissions">\`.
- No JavaScript is needed for saving; the system captures the submission automatically. After a successful submission, the form's content will be replaced with a "Thank you" message.

**2. To LOAD and DISPLAY Saved Data:**
- You must write JavaScript to fetch and render the data.
- Use the function \`window.vibe.loadData('your-form-name')\`. This function returns a Promise that resolves to an array of all submissions for that form.
- Each submission in the array is an object like: \`{ timestamp: "ISO_DATE_STRING", data: { fieldName1: "value1", ... } }\`
---
`;
}

function getImageGenerationInstructions() {
    return `
---
**IMAGE GENERATION (Pollinations AI):**
You have the ability to generate specific, high-quality images on the fly.
**WHEN TO USE:**
1. If the user explicitly asks to "add an image", "change the image", or "show a picture of X".
2. If you are creating a new design that requires placeholder images (hero backgrounds, card images, etc.).

**HOW TO GENERATE:**
Construct a URL using this format: \`https://pollinations.ai/p/{PROMPT}\`
- Replace \`{PROMPT}\` with a detailed, URL-encoded English description of the visual.
- **Example:** For a sunset, generate: \`https://pollinations.ai/p/hyperrealistic%20sunset%20over%20ocean%20vivid%20colors\`
- **Example:** For a tech background, generate: \`https://pollinations.ai/p/abstract%20blue%20technology%20circuit%20board%20isometric\`
---
`;
}

async function callAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    if (!geminiApiKey) throw new Error("Gemini API key is not set.");
    
    const components = listComponents();
    let libraryContext = "\n\n--- COMPONENT LIBRARY (REFERENCE ONLY) ---\n";
    libraryContext += "Use these components ONLY if specifically requested (via @id) or if they perfectly match the design requirement. Otherwise, prioritize creating custom, unique designs tailored to the user's prompt.\n";
    components.forEach(comp => {
        libraryContext += `### @${comp.id}\nHTML: ${comp.html}\nCSS: ${comp.css}\nJS: ${comp.javascript}\n---\n`;
    });

    const augmentedSystemPrompt = systemPrompt + libraryContext;
    const model = geminiModelSelect.value;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: augmentedSystemPrompt }] },
        generationConfig: forJson ? { responseMimeType: "application/json" } : {}
    };

    const response = await fetch(endpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(requestBody) 
    });
    
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
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
        throw new Error(`Gemini AI communication failed: ${e.message}`);
    }
}

async function generateCompleteSubtree(parentNode, streamCallback = null) {
    console.log(`Generating subtree for parent: ${parentNode.id}`);

    const systemPrompt = `You are an expert UI/UX designer and frontend architect. You are not just a code generator; you are a creative designer.

    **YOUR GOAL:** Create a visually stunning, modern, and fully responsive website component hierarchy based on a high-level description.
    
    **DESIGN GUIDELINES:**
    1.  **Aesthetics:** Use modern design trends (e.g., clean typography, ample whitespace, subtle shadows, rounded corners, vibrant colors). Avoid "browser default" looks.
    2.  **CSS:** Write robust, scoped CSS. Use Flexbox and Grid for layout. Ensure mobile responsiveness using media queries.
    3.  **Content:** Generate realistic, engaging placeholder content (text and images). Do not use "Lorem Ipsum" if possible; invent plausible content.
    4.  **Creativity:** Feel free to interpret the user's request artistically. If they say "portfolio", don't just make a list; make a hero section, a skills grid, a project gallery, and a contact form with a distinct style.

    **TASK:** Generate a valid JSON array of "vibe nodes" that represent the children of a given container. The output MUST be a JSON array [] and nothing else.

${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}

**JSON SCHEMA & RULES for each node in the array:**
1.  **Component Node Object:** Each object in the array must have:
    *   id: A unique, descriptive, kebab-case identifier.
    *   type: "head", "html", "css", "javascript", "js-function", or "declaration".
    *   description: A concise, one-sentence summary.
    *   code: The raw code for the component.
    *   children: (Optional) Nested array of child component nodes.
    *   selector: (For html nodes) CSS selector.
    *   position: (For html nodes) "beforeend" or "afterend".
`;

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
            selector: index === 0 ? '#whole-page' : `#${lastElementId}`,
            position: index === 0 ? 'beforeend' : 'afterend'
        };
        htmlNodes.push(htmlNode);
        lastElementId = elementId;
    });

    const scriptTags = Array.from(doc.querySelectorAll('script'));
    scriptTags.forEach((scriptTag, index) => {
        if (!scriptTag.src && scriptTag.textContent.trim()) {
            jsNodes.push({
                id: `script-${index + 1}`,
                type: 'javascript',
                description: 'JavaScript logic from a <script> tag.',
                code: scriptTag.textContent.trim()
            });
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

**OUTPUT:** A single, valid JSON object representing the vibe tree. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON structure itself. The final output must be only the raw JSON.`;

    const userPrompt = `Decompose the following code into the vibe tree JSON structure:\n\n\`\`\`html\n${fullCode}\n\`\`\``;

    const rawResponse = await callAI(systemPrompt, userPrompt, true);

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

    const button = updateTreeFromCodeButton;
    const originalButtonHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = 'Processing... <div class="loading-spinner"></div>';
    
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
        button.disabled = false;
        button.innerHTML = originalButtonHtml;
    }
}

async function handleUpdateTreeFromCode() {
    const fullCode = fullCodeEditor.value;
    if (vibeTree && vibeTree.type === 'raw-html-container') {
        vibeTree.code = fullCode;
        recordHistory("Update raw HTML code");
        applyVibes(); 
        autoSaveProject();
        alert("Raw HTML preview has been updated. To enable the Vibe Editor, click 'Process into Vibe Tree'.");
        return; 
    }
    await processCodeAndRefreshUI(fullCode);
}


async function handleFullCodeAiUpdate() {
    const prompt = fullCodeAiPromptInput.value.trim();
    const fullCode = fullCodeEditor.value;
    const selectionStart = fullCodeEditor.selectionStart;
    const selectionEnd = fullCodeEditor.selectionEnd;
    const selectedCode = fullCode.substring(selectionStart, selectionEnd);

    if (!prompt) {
        alert("Please enter a prompt describing your desired change.");
        fullCodeAiPromptInput.focus();
        return;
    }

    if (!selectedCode) {
        alert("Please select the code you want to modify in the editor.");
        fullCodeEditor.focus();
        return;
    }

    runFullCodeAiButton.disabled = true;
    runFullCodeAiButton.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    showGlobalAgentLoader('AI is updating full code...');

    try {
        const systemPrompt = `You are an expert AI developer who modifies a complete HTML file based on a user's request and a provided code selection. You are also given a JSON "vibe tree" which represents the logical structure of the HTML file.

**TASK:**
Your goal is to rewrite the ENTIRE HTML file to incorporate the user's change.

**INPUT:**
1.  **User Request:** A natural language description of the desired change.
2.  **Selected Code:** The specific snippet of code the user has highlighted. This is your primary area of focus.
3.  **Full Vibe Tree:** A JSON object that describes the component structure of the code. Use this to understand the context of the selected code (e.g., which component it belongs to, its dependencies). If the vibeTree is a "raw-html-container", it means the project has not been structured yet; just modify the full code directly.
4.  **Full Current Code:** The complete HTML file content that you need to modify.

**CRITICAL:** Your output must be ONLY the new, complete, and valid HTML code for the entire file. Do not provide explanations, diffs, snippets, or markdown formatting. Your entire response must be the raw HTML source code.
${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}`;

        const userPrompt = `User Request: "${prompt}"

Selected Code to modify:
\`\`\`html
${selectedCode}
\`\`\`

Full Vibe Tree for context:
\`\`\`json
${JSON.stringify(vibeTree, null, 2)}
\`\`\`

Full Current Code to be modified:
\`\`\`html
${fullCode}
\`\`\`
`;
        console.log("Calling AI to update full code with vibe context...");
        const newFullCode = await callAI(systemPrompt, userPrompt, false);

        if (!newFullCode || !newFullCode.trim().toLowerCase().includes('</html>')) {
            throw new Error("AI did not return valid HTML content.");
        }

        if (vibeTree && vibeTree.type === 'raw-html-container') {
             vibeTree.code = newFullCode;
             recordHistory("AI update to raw HTML");
             refreshAllUI();
        } else {
            await processCodeAndRefreshUI(newFullCode);
        }

        const originalScrollTop = (selectionStart / fullCode.length) * fullCodeEditor.scrollHeight;
        fullCodeEditor.scrollTop = originalScrollTop;
        
        fullCodeAiPromptInput.value = '';

    } catch (error) {
        console.error("Full Code AI Update failed:", error);
        alert(`An error occurred during the AI update: ${error.message}`);
    } finally {
        runFullCodeAiButton.disabled = false;
        runFullCodeAiButton.innerHTML = 'Update with AI';
        hideGlobalAgentLoader();
    }
}


async function handleFileUpload() {
    const file = htmlFileInput.files[0];
    if (!file) {
        alert("Please select an HTML file to upload.");
        return;
    }
    console.log(`File selected: ${file.name} (${file.type})`);

    const reader = new FileReader();
    
    reader.onload = async (event) => {
        try {
            const fileContent = event.target.result;

            // Generate a safe, unique Project ID
            const baseId = file.name.replace(/\.(html|htm)$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
            let projectId = baseId || `html-project-${Date.now()}`;
            
            // Switch logic to LOCAL immediately
            currentProjectStorageType = 'local';
            
            // Ensure ID uniqueness
            const existing = await localApi.listProjects();
            let suffix = 1;
            while (existing.includes(projectId)) {
                projectId = `${baseId}-${suffix++}`;
            }
            currentProjectId = projectId;

            // Construct the Raw Vibe Tree
            vibeTree = {
                id: `raw-${currentProjectId}`,
                type: 'raw-html-container',
                description: `Raw HTML project uploaded from file: ${file.name}`,
                code: fileContent,
                children: []
            };
            
            // Reset UI and History
            resetHistory();
            
            // Critical: Update UI to reflect Local storage mode
            const localToggleBtn = document.querySelector('.storage-toggle button[data-storage="local"]');
            if (localToggleBtn) {
                document.querySelectorAll('.storage-toggle button').forEach(b => b.classList.remove('active'));
                localToggleBtn.classList.add('active');
            }

            // Disable features not available in Raw mode
            updateSaveButtonStates();
            if(openAiStructureModalButton) openAiStructureModalButton.disabled = true;
            if(shareProjectButton) shareProjectButton.disabled = true;

            // Save and Refresh
            await localApi.saveProject(currentProjectId, vibeTree); // Explicit await
            saveSessionMetadata();
            
            refreshAllUI();
            switchToTab('preview');
            
            console.log(`Raw HTML project '${currentProjectId}' imported locally.`);
            
        } catch (err) {
            console.error("Error processing HTML upload:", err);
            alert("Failed to process the uploaded file.");
        }
    };

    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("An error occurred while reading the file.");
    };

    reader.readAsText(file);
}

function guessMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeMap = {
        'html': 'text/html', 'htm': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'ico': 'image/x-icon',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'txt': 'text/plain'
    };
    return mimeMap[ext] || 'application/octet-stream';
}

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

function rewriteCssUrls(cssText, resolverCb) {
    return cssText.replace(/url\(([^)]+)\)/g, (match, p1) => {
        let raw = p1.trim().replace(/^['"]|['"]$/g, '');
        const resolved = resolverCb(raw);
        if (!resolved) return match;
        const hadQuotes = /^['"].*['"]$/.test(p1.trim());
        return `url(${hadQuotes ? `"${resolved}"` : resolved})`;
    });
}




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

function getHeadContentFromTree(tree = vibeTree) {
    let headContent = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;
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

function nodeIdToFileName(id, ext) {
    const base = (id || 'file').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
    return `${base}.${ext}`;
}

function assembleMultiFileBundle(tree = vibeTree) {
    if (tree && tree.type === 'raw-html-container') {
        const files = new Map();
        files.set('index.html', tree.code || '');
        files.set('project.json', JSON.stringify(tree, null, 2));
        return { files, indexHtml: tree.code || '' };
    }
    
    const headContent = getHeadContentFromTree(tree);
    const bodyContent = buildHtmlBodyFromTree(tree);
    const { cssNodes, jsNodes } = collectCssJsNodes(tree);

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

    return { files, indexHtml };
}

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

async function handleDownloadProjectZip() {
    try {
        if (!window.JSZip) {
            throw new Error('JSZip library failed to load.');
        }
        const { files } = assembleMultiFileBundle(vibeTree);
        const zip = new JSZip();

        for (const [path, content] of files.entries()) {
            zip.file(path, content);
        }

        let bundledHtmlContent;
        if (vibeTree && vibeTree.type === 'raw-html-container') {
             bundledHtmlContent = vibeTree.code || '';
        } else {
             bundledHtmlContent = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
        }
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

function applyVibes() {
    try {
        iframeErrors = [];
        const doc = previewContainer.contentWindow.document;
        let html;

        if (vibeTree && vibeTree.type === 'raw-html-container') {
            html = vibeTree.code || '';
        } else {
            html = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
        }

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

    window.addEventListener('message',e=>{if(e.data.type==='toggle-inspect'){inspectEnabled=e.data.enabled;if(inspectEnabled)ensureStyles();else if(hoverEl){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}}});
})();
<\/script>`;
        
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${commsScriptText}\n</head>`);
        } else {
            html = commsScriptText + html;
        }

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
    let fullCode;
    if (vibeTree && vibeTree.type === 'raw-html-container') {
        fullCode = vibeTree.code || '';
        if (updateTreeFromCodeButton) {
             updateTreeFromCodeButton.innerHTML = '<i class="bi bi-magic"></i> Process into Vibe Tree';
             updateTreeFromCodeButton.title = 'Use AI to analyze this code and convert it into the editable Vibe Tree structure. This will enable the Vibe Editor.';
             updateTreeFromCodeButton.onclick = () => processCodeAndRefreshUI(fullCodeEditor.value);
        }
    } else {
        fullCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
         if (updateTreeFromCodeButton) {
             updateTreeFromCodeButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Update from Code';
             updateTreeFromCodeButton.title = 'Replace the current Vibe Tree with a new structure parsed from the code in this editor.';
             updateTreeFromCodeButton.onclick = handleUpdateTreeFromCode;
        }
    }
    
    fullCodeEditor.value = fullCode;
    console.log('Displaying full website code.');
}


function hideFullCode() {
}

// --- START: Click-to-Swap Reordering Logic ---
function handleClickToSwap(event) {
    event.stopPropagation();
    const handleEl = event.currentTarget;
    const nodeEl = handleEl.closest('.vibe-node');
    const nodeId = nodeEl.dataset.nodeId;

    if (!firstNodeToSwapId) {
        firstNodeToSwapId = nodeId;
        nodeEl.classList.add('swap-selected');
        console.log(`Selected '${nodeId}' for swap.`);
    } else {
        const secondNodeId = nodeId;
        
        const firstNodeEl = editorContainer.querySelector(`.vibe-node[data-node-id="${firstNodeToSwapId}"]`);
        if (firstNodeEl) {
            firstNodeEl.classList.remove('swap-selected');
        }

        if (firstNodeToSwapId === secondNodeId) {
            console.log("Swap cancelled: Same node selected twice.");
            firstNodeToSwapId = null;
            return;
        }

        const firstResult = findNodeAndParentById(firstNodeToSwapId);
        const secondResult = findNodeAndParentById(secondNodeId);

        const originalFirstNodeId = firstNodeToSwapId;
        firstNodeToSwapId = null; 
        
        if (!firstResult || !secondResult) {
            console.error("Swap failed: One or both nodes not found in the tree.");
            return;
        }

        if (!firstResult.parent || !secondResult.parent || firstResult.parent.id !== secondResult.parent.id) {
            console.warn("Swap failed: Nodes are not siblings. Reordering is only supported between sibling nodes.");
            alert("Reordering is only supported between nodes at the same level (siblings).");
            return;
        }

        swapNodes(originalFirstNodeId, secondNodeId);
    }
}

function swapNodes(nodeId1, nodeId2) {
    const result1 = findNodeAndParentById(nodeId1);
    if (!result1 || !result1.parent) {
        console.error(`Cannot swap: Node '${nodeId1}' or its parent not found.`);
        return;
    }
    
    const parent = result1.parent;
    const index1 = parent.children.findIndex(n => n.id === nodeId1);
    const index2 = parent.children.findIndex(n => n.id === nodeId2);

    if (index1 === -1 || index2 === -1) {
        console.error("Cannot swap: One of the nodes was not found in the parent's children array.");
        return;
    }
    
    recordHistory(`Swap nodes ${nodeId1} and ${nodeId2}`);

    [parent.children[index1], parent.children[index2]] = [parent.children[index2], parent.children[index1]];

    console.log(`Swapped nodes '${nodeId1}' and '${nodeId2}'.`);
    recalculateSelectors(parent);
    refreshAllUI();
    autoSaveProject();
}
// --- END: Click-to-Swap Reordering Logic ---


function addEventListeners() {
    document.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', handleUpdate);
    });
    document.querySelectorAll('.ai-edit-project-button').forEach(button => {
        button.addEventListener('click', handleAiProjectEditClick);
    });
    document.querySelectorAll('.generate-controls-button').forEach(button => {
        button.addEventListener('click', openGenerateControlsModal);
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
    document.querySelectorAll('.save-as-component-button').forEach(button => {
        button.addEventListener('click', handleSaveNodeAsComponentFromEditor);
    });
    document.querySelectorAll('.collapse-toggle').forEach(button => {
        button.addEventListener('click', handleCollapseToggle);
    });
    document.querySelectorAll('.vibe-node-header').forEach(header => {
        header.addEventListener('click', handleNodeContentToggle);
    });
    document.querySelectorAll('.drag-handle').forEach(handle => {
        handle.addEventListener('click', handleClickToSwap);
    });

    if (editorContainer) {
        editorContainer.addEventListener('input', handleControlChange);
        editorContainer.addEventListener('change', handleControlChange);
    }
}

// --- Agent Logic ---

function showAgentSpinner() {
    if (agentTabButton) agentTabButton.classList.add('loading');
}
function hideAgentSpinner() {
    if (agentTabButton) agentTabButton.classList.remove('loading');
}

function logToAgent(message, type = 'info') {
    vibeEventBus.dispatchEvent(new CustomEvent(AUTO_PILOT_EVENTS.AGENT_LOG, { 
        detail: { message, type } 
    }));

    const placeholder = agentOutput.querySelector('.agent-message-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const msgEl = document.createElement('div');
    msgEl.className = `agent-message log-type-${type}`;
    
    msgEl.innerHTML = message;
    
    if (agentOutput.firstChild) {
        agentOutput.insertBefore(msgEl, agentOutput.firstChild);
    } else {
        agentOutput.appendChild(msgEl);
    }
    agentOutput.scrollTop = 0; 
}

function getAgentSystemPrompt() {
    return `You are an expert AI web developer and designer.

**ROLE:**
1.  **Designer:** When asked to create or change something, design it with modern UI/UX principles.
2.  **Implementer:** Convert natural language into specific updates for the project structure.

**CAPABILITIES:**
- You can create new nodes, update existing ones, or change the structure.
- You can understand "Vibe Shorthand" (e.g., @navbar) but you are NOT limited to it. You can and should write custom HTML/CSS/JS when the user asks for something specific or unique.

**OUTPUT FORMAT:**
Return ONLY a single, valid JSON object:
{
  "plan": "Briefly explain your design decisions and the changes you are making.",
  "actions": [
    {
      "actionType": "create" | "update",
      "nodeId": "id-of-node",
      "parentId": "parent-id",
      "newNode": {
         "id": "unique-id",
         "type": "html" | "css" | "javascript" | "js-function",
         "description": "...",
         "code": "FULL MODIFIED CODE STRING HERE",
         "selector": "#prev-id",
         "position": "afterend"
      }
    }
  ]
}

${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}`;
}

// START OF CHANGE: New and refactored functions for the Task Queue system

function renderTaskQueue() {
    const queueListEl = document.getElementById('task-queue-list');
    if (!queueListEl) return;

    if (!queueListEl.dataset.listenerAttached) {
        queueListEl.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-task-button')) {
                if (isTaskQueueRunning) return;
                const index = parseInt(event.target.dataset.index, 10);
                taskQueue.splice(index, 1);
                renderTaskQueue();
                updateTaskQueueUI(); 
            }
        });
        queueListEl.dataset.listenerAttached = 'true';
    }

    queueListEl.innerHTML = '';
    taskQueue.forEach((task, index) => {
        const li = document.createElement('li');
        const textNode = document.createTextNode(task);
        const span = document.createElement('span');
        span.appendChild(textNode);
        
        li.innerHTML = `
            ${span.outerHTML}
            <button class="remove-task-button" data-index="${index}" title="Remove task" ${isTaskQueueRunning ? 'disabled' : ''}>&times;</button>
        `;
        queueListEl.appendChild(li);
    });
}

function registerAutoPilotListener(eventName, taskDescription) {
    const validEvents = Object.values(AUTO_PILOT_EVENTS);
    if (!validEvents.includes(eventName)) {
        logToAgent(`<strong>Auto Pilot Error:</strong> Invalid event '${eventName}'. Valid events: ${validEvents.join(', ')}`, 'error');
        return;
    }

    const listener = (e) => {
        if (eventName === AUTO_PILOT_EVENTS.QUEUE_COMPLETE && isTaskQueueRunning) return;

        let finalTask = taskDescription;
        
        if (eventName === AUTO_PILOT_EVENTS.RUNTIME_ERROR && e.detail && e.detail.message) {
            finalTask += ` (Context: ${e.detail.message})`;
        }

        logToAgent(`<strong>Auto Pilot Triggered:</strong> Event '${eventName}' detected. Adding task: "${finalTask}"`, 'plan');
        
        taskQueue.push(finalTask);
        renderTaskQueue();
        updateTaskQueueUI();
        
        if (!isTaskQueueRunning && !waitingForAgentConfirmation) {
            handleStartTaskQueue();
        }
    };

    vibeEventBus.addEventListener(eventName, listener);
    
    activeAutoPilotListeners.push({ event: eventName, fn: listener });

    logToAgent(`<strong>Auto Pilot Armed:</strong> Watching for <code>${eventName}</code> to execute: "${taskDescription}"`, 'info');
}

function insertAtCursor(textarea, text) {
    if (!textarea || !text) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
}

function renderAutoPilotTriggers() {
    const inputParent = agentPromptInput.parentNode;
    
    let triggerBar = document.getElementById('auto-pilot-trigger-bar');
    if (!triggerBar) {
        triggerBar = document.createElement('div');
        triggerBar.id = 'auto-pilot-trigger-bar';
        triggerBar.className = 'auto-pilot-trigger-bar';
        triggerBar.style.marginBottom = '8px';
        triggerBar.style.display = 'flex';
        triggerBar.style.gap = '8px';
        triggerBar.style.flexWrap = 'wrap';
        
        inputParent.insertBefore(triggerBar, agentPromptInput);
    }

    triggerBar.innerHTML = '';

    const triggers = [
        { label: '⚡ On Queue Complete', event: AUTO_PILOT_EVENTS.QUEUE_COMPLETE, defaultAction: 'Check the page for visual consistency' },
        { label: '🐞 On Runtime Error', event: AUTO_PILOT_EVENTS.RUNTIME_ERROR, defaultAction: 'Analyze and fix the error' },
        { label: '📝 On Agent Log', event: AUTO_PILOT_EVENTS.AGENT_LOG, defaultAction: 'Review the last action' }
    ];

    triggers.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'action-button small secondary';
        btn.textContent = t.label;
        btn.title = `Insert trigger for ${t.event}`;
        btn.onclick = () => {
            const text = `WHEN ${t.event} DO ${t.defaultAction}`;
            insertAtCursor(agentPromptInput, text);
        };
        triggerBar.appendChild(btn);
    });
}

function handleAddTaskToQueue() {
    const userPrompt = agentPromptInput.value.trim();
    if (!userPrompt) return;

    const triggerMatch = userPrompt.match(/^WHEN\s+([\w-]+)\s+DO\s+(.+)$/i);

    if (triggerMatch) {
        const eventName = triggerMatch[1].toLowerCase();
        const taskToRun = triggerMatch[2];
        registerAutoPilotListener(eventName, taskToRun);
        
        agentPromptInput.value = '';
        return;
    }
    
    if (waitingForAgentConfirmation) {
        logToAgent(userPrompt, 'user');
        agentPromptInput.value = '';
        currentAgentTaskContext += `\nUser: ${userPrompt}`;
        waitingForAgentConfirmation = false;
        showGlobalAgentLoader('Processing your reply...');
        updateTaskQueueUI(); 
        
        executeSingleTask(currentAgentTaskContext)
            .then(() => {
                logToAgent(`<strong>Task completed successfully.</strong>`, 'info');
                taskQueue.shift(); 
                renderTaskQueue();
                updateTaskQueueUI();
                setTimeout(processNextTaskInQueue, 1500);
            })
            .catch(error => {
                if (waitingForAgentConfirmation) return;

                isTaskQueueRunning = false;
                logToAgent(`<strong>Task Failed:</strong><br><strong>Error:</strong> <pre>${error.message}</pre>`, 'error');
                updateTaskQueueUI();
                renderTaskQueue();
                hideGlobalAgentLoader();
            });
        return;
    }

    taskQueue.push(userPrompt);
    agentPromptInput.value = '';
    renderTaskQueue();
    updateTaskQueueUI();
    agentPromptInput.focus();
}

async function handleStartTaskQueue() {
    if (isTaskQueueRunning || taskQueue.length === 0) return;

    isTaskQueueRunning = true;
    updateTaskQueueUI();
    renderTaskQueue();
    agentOutput.innerHTML = '';
    logToAgent(`<strong>Starting task queue with ${taskQueue.length} tasks.</strong>`, 'plan');
    
    await processNextTaskInQueue();
}

async function processNextTaskInQueue() {
    if (!isTaskQueueRunning || taskQueue.length === 0) {
        isTaskQueueRunning = false;
        waitingForAgentConfirmation = false;
        currentAgentTaskContext = "";
        logToAgent('<strong>Task queue complete.</strong> All tasks have been processed.', 'plan');
        updateTaskQueueUI();
        renderTaskQueue();
        hideGlobalAgentLoader();

        vibeEventBus.dispatchEvent(new CustomEvent(AUTO_PILOT_EVENTS.QUEUE_COMPLETE));

        return;
    }

    const currentTask = taskQueue[0];
    
    if (!currentAgentTaskContext || !currentAgentTaskContext.includes(currentTask)) {
        currentAgentTaskContext = currentTask;
    }

    const progressText = `Task ${taskQueue.length - taskQueue.length + 1} of ${taskQueue.length}`;
    showGlobalAgentLoader('Agent is processing queue...', progressText);
    logToAgent(`---<br><strong>Starting Task (${taskQueue.length} remaining):</strong> ${currentTask}`, 'plan');

    try {
        await executeSingleTask(currentAgentTaskContext);
        
        if (waitingForAgentConfirmation) {
            updateTaskQueueUI(); 
            return; 
        }

        logToAgent(`<strong>Task completed successfully:</strong> ${currentTask}`, 'info');
        taskQueue.shift(); 
        currentAgentTaskContext = ""; 
        renderTaskQueue();
        updateTaskQueueUI();

        setTimeout(processNextTaskInQueue, 1500);
    } catch (error) {
        if (waitingForAgentConfirmation) {
            updateTaskQueueUI();
            return;
        }

        isTaskQueueRunning = false;
        logToAgent(`<strong>Task Failed:</strong> ${currentTask}<br><strong>Error:</strong> <pre>${error.message}</pre>`, 'error');
        logToAgent('<strong>Queue processing halted due to error.</strong> You can address the issue, remove the failed task, and start the queue again.', 'error');
        updateTaskQueueUI();
        renderTaskQueue();
        hideGlobalAgentLoader();
        console.error("Error in task queue, processing stopped:", error);
    }
}

function renderAgentQuestionUI(questionText) {
    const questionHtml = `
        <div class="agent-question-container" style="background: rgba(97, 175, 239, 0.15); border-left: 4px solid #61afef; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-weight: bold; color: #61afef; margin-bottom: 8px;">AI needs clarification:</div>
            <div style="font-size: 1.1em; margin-bottom: 15px;">${questionText}</div>
            <div class="quick-response-buttons" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="action-button small quick-reply-btn" onclick="window.vibeAPI.handleQuickReply('Yes')">Yes</button>
                <button class="action-button small quick-reply-btn" onclick="window.vibeAPI.handleQuickReply('No')">No</button>
                <button class="action-button small quick-reply-btn" onclick="window.vibeAPI.handleQuickReply('Proceed')">Proceed</button>
                <button class="action-button small quick-reply-btn" style="background: #e06c75;" onclick="window.vibeAPI.handleQuickReply('Cancel')">Cancel</button>
            </div>
        </div>
    `;
    logToAgent(questionHtml, 'plan'); 
}

function handleQuickReply(replyText) {
    if (!waitingForAgentConfirmation) return;
    
    if (agentPromptInput) {
        agentPromptInput.value = replyText;
        handleAddTaskToQueue(); 
    }
    
    const buttons = agentOutput.querySelectorAll('.quick-reply-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'default';
    });
}

async function executeSingleTask(promptContext) {
    showAgentSpinner();
    try {
        const systemPrompt = getAgentSystemPrompt();
        const fullTreeString = JSON.stringify(vibeTree, null, 2);
        const fullCurrentCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
        
        const userPrompt = `User Request History:\n"${promptContext}"\n\nFull Vibe Tree:\n\`\`\`json\n${fullTreeString}\n\`\`\`\n\nFull Generated Code:\n\`\`\`html\n${fullCurrentCode}\n\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);
        
        if (agentDecision.question) {
            renderAgentQuestionUI(agentDecision.question);
            currentAgentTaskContext += `\nAI: ${agentDecision.question}`;
            waitingForAgentConfirmation = true;
            hideGlobalAgentLoader(); 
            return; 
        }

        executeAgentPlan(agentDecision, logToAgent);
        waitingForAgentConfirmation = false; 
    } catch(e) {
        throw e;
    } finally {
        hideAgentSpinner();
    }
}

function updateTaskQueueUI() {
    if (runAgentSingleTaskButton) {
        if (waitingForAgentConfirmation) {
            runAgentSingleTaskButton.textContent = 'Reply to Agent';
            runAgentSingleTaskButton.disabled = false;
            runAgentSingleTaskButton.classList.add('pulse-button'); 
        } else {
            runAgentSingleTaskButton.textContent = 'Add Task';
            runAgentSingleTaskButton.disabled = isTaskQueueRunning;
            runAgentSingleTaskButton.classList.remove('pulse-button');
        }
    }
    
    if (startIterativeSessionButton) {
        startIterativeSessionButton.textContent = `Process Queue (${taskQueue.length})`;
        startIterativeSessionButton.disabled = isTaskQueueRunning || taskQueue.length === 0;
    }
    
    if(endSessionButton) {
        endSessionButton.textContent = 'Stop Queue';
        endSessionButton.style.display = isTaskQueueRunning ? 'inline-block' : 'none';
    }

    if (agentPromptInput) {
        if (waitingForAgentConfirmation) {
            agentPromptInput.placeholder = "Type your answer here...";
            agentPromptInput.disabled = false;
            agentPromptInput.focus();
        } else {
            agentPromptInput.placeholder = "Describe a task to add to the queue...";
            agentPromptInput.disabled = isTaskQueueRunning;
        }
    }

    const taskQueueContainer = document.getElementById('task-queue-container');
    if (taskQueueContainer) {
        taskQueueContainer.style.display = taskQueue.length > 0 || isTaskQueueRunning ? 'block' : 'none';
    }
}

function handleStopTaskQueue() {
    if (isTaskQueueRunning) {
        logToAgent('Task queue stopped by user.', 'info');
        isTaskQueueRunning = false;
        waitingForAgentConfirmation = false;
        currentAgentTaskContext = "";
    }
    updateTaskQueueUI();
    renderTaskQueue(); 
    hideAgentSpinner();
    hideGlobalAgentLoader();
}

// END OF CHANGE


async function handleFixError(errorMessage, fixButton) {
    fixButton.disabled = true;
    fixButton.innerHTML = 'Fixing... <div class="loading-spinner"></div>';
    showAgentSpinner();
    showGlobalAgentLoader('Fixing runtime error...');

    console.log(`Attempting to fix error: "${errorMessage.split('\n')[0]}..."`);

    switchToTab('agent');
    
    const fixTask = `A runtime error was detected. Analyze the error and the code to fix it. Error details: ${errorMessage}`;
    taskQueue.unshift(fixTask);
    renderTaskQueue();
    updateTaskQueueUI();
    
    logToAgent(`<strong>New Task Added:</strong> Fix a runtime error.`, 'plan');
    logToAgent(`<strong>Error Details:</strong>\n<pre>${errorMessage}</pre>`, 'info');
    
    if(!isTaskQueueRunning) {
        handleStartTaskQueue();
    } else {
        logToAgent('Fix task has been added to the front of the running queue.', 'info');
    }
}

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

// --- Chat Logic ---

function logToChat(message, type = 'model') {
    const placeholder = chatOutput.querySelector('.chat-message-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const msgEl = document.createElement('div');
    msgEl.className = `chat-message log-type-${type}`;
    
    msgEl.textContent = message;
    
    chatOutput.appendChild(msgEl);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    return msgEl;
}

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
        wrapper.appendChild(actionsContainer);

        let targetFilePath = null;
        const filePathRegex = /^language-(?:[a-z0-9_-]+):(.+)$/i;

        for (const cls of codeEl.classList) {
            const match = cls.match(filePathRegex);
            if (match && match[1]) {
                targetFilePath = match[1];
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
        console.warn(`File saving for '${cleanPath}' is not implemented in the backend.`);
        alert("This feature is not yet implemented. Code has not been saved.");
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

async function buildCombinedHtmlFromDb(projectId) {
    if (!projectId) throw new Error("Project ID is required.");
    console.warn("buildCombinedHtmlFromDb is not implemented for the backend.");
    return `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>File system not implemented on backend.</h1></body></html>`;
}


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

function handleUseAgentToInsertSnippet(codeContent) {
    const lastUserMessage = chatConversationHistory.filter(m => m.role === 'user').pop();
    const context = lastUserMessage ? `Based on our last conversation about "${lastUserMessage.content}", please ` : 'Please ';
    
    const agentPrompt = `${context}insert the following code snippet into the project where it makes the most sense. Analyze the existing code and create or update the necessary components.\n\nCode Snippet:\n\`\`\`\n${codeContent}\n\`\`\``;

    agentPromptInput.value = agentPrompt;
    switchToTab('agent');
    handleAddTaskToQueue();
}


async function handleSendChatMessage() {
    const userPrompt = chatPromptInput.value.trim();
    if (!userPrompt) return;

    const systemPrompt = chatSystemPromptInput.value.trim() || `You are an expert pair programmer. The user will provide you with the full content of their project files and a request to change them.
1.  Analyze the user's request and the provided file context.
2.  Identify which file(s) need to be modified.
3.  When you provide code, you MUST return the **complete, updated content** of the file. Do not provide snippets, diffs, or partial code.
4.  Enclose the full file content in a markdown code block, and use a language fence that includes the file path. For example: \`\`\`html:index.html ... complete file content ... \`\`\`
${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}`;

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

function handleAddChildClick(event) {
    const parentId = event.target.dataset.id;
    addNodeParentIdInput.value = parentId;
    addNodeTargetIdInput.value = '';
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
            } else { 
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
    if (node && node.type === 'raw-html-container') return null;
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
        } else {
            targetParent.children.splice(targetIndex + 1, 0, sourceNode);
        }
        recalculateSelectors(targetParent);
    }
    
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
        if (idMatch && idMatch[1]) {
            lastHtmlSiblingId = idMatch[1];
        } else {
            console.warn(`Node ${child.id} lacks an 'id' attribute, which may break layout.`);
            lastHtmlSiblingId = child.id; 
        }
    });
}

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
        targetForPositioning = null;
        positionForNewNode = 'beforeend';
    } else {
        parentForNewNode = targetParent;
        targetForPositioning = targetNode;
        positionForNewNode = position;
    }
    
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

function handleAiProjectEditClick(event) {
    const nodeId = event.target.dataset.id;
    if (!nodeId) return;

    aiProjectEditModalTitle.textContent = `AI Command for: ${nodeId}`;
    aiProjectEditNodeIdInput.value = nodeId;
    aiProjectEditPromptInput.value = '';
    aiProjectEditError.textContent = '';
    aiProjectEditModal.style.display = 'block';
    aiProjectEditPromptInput.focus();
}

function closeAiProjectEditModal() {
    if (aiProjectEditModal) {
        aiProjectEditModal.style.display = 'none';
    }
}

async function handleAiProjectEditExecute() {
    const focusNodeId = aiProjectEditNodeIdInput.value;
    const prompt = aiProjectEditPromptInput.value.trim();

    if (!prompt) {
        aiProjectEditError.textContent = "Please enter a command for the AI.";
        return;
    }

    aiProjectEditExecuteButton.disabled = true;
    aiProjectEditExecuteButton.innerHTML = 'Executing... <div class="loading-spinner"></div>';
    aiProjectEditError.textContent = '';
    showGlobalAgentLoader('AI is editing the project...');

    try {
        const fullCurrentCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);

        const systemPrompt = `You are an expert AI developer. Your task is to modify a complete HTML file based on a user's request, which is **focused on a specific component** within the project.

**INPUTS:**
- **User Request:** The natural language command.
- **Focus Node ID:** The ID of the component the user's request is about. This is your primary point of reference.
- **Full Vibe Tree:** The JSON structure of the entire project. Use this to understand the relationships between the focus node and other components (like its CSS or JS dependencies).
- **Full Current Code:** The complete HTML file you must edit.

**RULES:**
1.  Analyze the user's request in the context of the component identified by the \`Focus Node ID\`.
2.  Your changes are **not limited** to the code of the focus node. You must modify any part of the \`Full Current Code\` necessary to achieve the goal. For example, if the user asks to style an HTML node, you should find the correct \`<style>\` block and add the CSS rules there.
3.  **CRITICAL:** Your output must be **only the new, complete, and valid HTML code for the entire file.** Do not provide explanations, diffs, snippets, or markdown formatting. Your entire response must be the raw HTML source code.
${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}`;

        const userPrompt = `User Request: "${prompt}"
Focus Node ID: "${focusNodeId}"

Full Vibe Tree for context:
\`\`\`json
${JSON.stringify(vibeTree, null, 2)}
\`\`\`

Full Current Code to be modified:
\`\`\`html
${fullCurrentCode}
\`\`\`
`;
        console.log(`Calling AI for project-wide edit, focusing on node '${focusNodeId}'...`);
        const newFullCode = await callAI(systemPrompt, userPrompt, false);

        if (!newFullCode || !newFullCode.trim().toLowerCase().includes('</html>')) {
            throw new Error("AI did not return valid HTML content. It might have been a partial response. Please try again.");
        }

        await processCodeAndRefreshUI(newFullCode);

        closeAiProjectEditModal();
        
    } catch (error) {
        console.error("AI Project Edit failed:", error);
        aiProjectEditError.textContent = `Error: ${error.message}`;
    } finally {
        aiProjectEditExecuteButton.disabled = false;
        aiProjectEditExecuteButton.innerHTML = 'Execute Command';
        hideGlobalAgentLoader();
    }
}

function openAiStructureModal() {
    if (!currentProjectId) {
        alert("Please load or create a project before updating its structure.");
        return;
    }
     if (currentProjectStorageType !== 'cloud') {
        alert("AI Structure Update is only available for projects saved to the cloud.");
        return;
    }
    aiStructurePromptInput.value = '';
    aiStructureError.textContent = '';
    aiStructureModal.style.display = 'block';
    aiStructurePromptInput.focus();
}

function closeAiStructureModal() {
    aiStructureModal.style.display = 'none';
}

async function handleAiStructureUpdate() {
    const prompt = aiStructurePromptInput.value.trim();
    if (!prompt) {
        aiStructureError.textContent = "Please enter your instructions.";
        return;
    }

    aiStructureExecuteButton.disabled = true;
    aiStructureExecuteButton.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    aiStructureError.textContent = '';
    showGlobalAgentLoader('AI is restructuring the project...');

    try {
        const systemPrompt = `You are an expert system that modifies a website's "vibe tree" JSON structure based on user instructions. You will receive the current vibe tree and a set of instructions. Your task is to apply these instructions and return the NEW, COMPLETE, and VALID vibe tree as a single JSON object.

**CRITICAL OUTPUT RULE:** Your entire response must be ONLY the raw JSON object for the complete, modified vibe tree. Do not include any explanatory text, comments, or markdown formatting.

**VIBE NODE SCHEMA (Reminder):**
- Each node needs: id, type, description, code.
- HTML nodes need: selector, position.
- 'selector' and 'position' MUST be calculated correctly relative to siblings. The first HTML child of a parent uses the parent's ID as a selector. Subsequent siblings chain off the ID of the previous sibling.

Analyze the user's request and intelligently modify the provided vibe tree to match. This may involve adding, removing, reordering, or modifying nodes. Preserve existing code and descriptions where possible unless the user asks for them to be changed.`;

        const userPrompt = `User Instructions: "${prompt}"

Current Vibe Tree JSON:
\`\`\`json
${JSON.stringify(vibeTree, null, 2)}
\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        let newVibeTree;
        try {
            let jsonText = rawResponse.trim();
            const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                jsonText = match[1];
            }
            newVibeTree = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse AI response for structure update:", rawResponse);
            throw new Error("The AI returned invalid JSON. Please try rephrasing your instructions.");
        }

        if (!newVibeTree || newVibeTree.id !== 'whole-page' || !Array.isArray(newVibeTree.children)) {
            throw new Error("The AI returned an invalid Vibe Tree structure. The root 'id' must be 'whole-page' and it must have a 'children' array.");
        }

        recordHistory('AI Structure Update');
        vibeTree = newVibeTree;
        refreshAllUI();
        closeAiStructureModal();
        
    } catch (error) {
        console.error("AI Structure Update failed:", error);
        aiStructureError.textContent = `Error: ${error.message}`;
    } finally {
        aiStructureExecuteButton.disabled = false;
        aiStructureExecuteButton.innerHTML = 'Update Structure';
        hideGlobalAgentLoader();
    }
}


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

let searchState = {
    term: '',
    matches: [], 
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

function clearEditorHighlights() {
    editorContainer.querySelectorAll('.ai-search-highlight').forEach(el => {
        el.classList.remove('ai-search-highlight');
    });
}

async function handleAiEditorSearch() {
    const query = aiEditorSearchInput.value.trim();
    
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
            let parent = nodeEl.parentElement;
            while(parent && parent !== editorContainer) {
                if (parent.classList.contains('children') && parent.classList.contains('collapsed')) {
                    const toggleBtn = parent.closest('.vibe-node')?.querySelector('.collapse-toggle');
                    if (toggleBtn) {
                        toggleBtn.click();
                    }
                }
                parent = parent.parentElement;
            }
        }
    });
    
    if (firstResultEl) {
        firstResultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function switchToTab(tabId) {
    const tabContents = document.querySelector('.tab-content-area');
    if (!tabContents) {
        console.error("Critical layout element .tab-content-area not found.");
        return;
    }

    // Save state to IndexedDB (Fire and forget, handle error quietly)
    idbKV.set(SESSION_KEYS.TAB, tabId).catch(err => console.error("Failed to save tab state", err));

    const newContent = tabContents.querySelector(`#${tabId}`);
    if (!newContent || newContent.classList.contains('active')) {
        return;
    }

    if (tabId === 'console') {
        consoleErrorIndicator.classList.remove('active');
    }

    document.querySelectorAll('.tab-button.active').forEach(btn => btn.classList.remove('active'));
    const currentContent = tabContents.querySelector('.tab-content.active');
    if (currentContent) {
        currentContent.classList.remove('active');
    }

    document.querySelectorAll(`.tab-button[data-tab="${tabId}"]`).forEach(btn => btn.classList.add('active'));
    newContent.classList.add('active');

    if (tabId === 'code') {
        showFullCode();
    }
    if (tabId === 'files') {
        renderFileTree();
        if (filesPreviewEl) {
            filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file to preview it here.</div>';
        }
    }
    if (tabId === 'context') {
        renderComponentList();
        if (contextComponentViewer) {
            contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
        }
    }
    
    if (tabId === 'merge') {
        showFullCode(); 
        if (typeof window.merge_loadFromGlobalEditor === 'function') {
            window.merge_loadFromGlobalEditor();
        }
    }

    if (tabId === 'agent') {
        if (!document.getElementById('task-queue-container') && agentOutput) {
            agentOutput.insertAdjacentHTML('beforebegin', `
                <div id="task-queue-container" style="display: none; margin-bottom: 20px;">
                    <h4>Task Queue</h4>
                    <ul id="task-queue-list" class="task-queue-list"></ul>
                </div>
            `);
        }
        updateTaskQueueUI();
        refreshShorthandDropdowns();
    }
}

function handleTabSwitching() {
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;

        event.preventDefault();
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

const DB_NAME = 'VibeLocalDB';
const DB_VERSION = 2; // UPDATED: Incremented to trigger onupgradeneeded
const STORE_NAME = 'projects';
const KV_STORE_NAME = 'appState'; // FIXED: Defined this missing variable
let dbPromise = null;

function getDb() {
    if (!('indexedDB' in window)) {
        console.error("This browser doesn't support IndexedDB. Local storage will not work.");
        return Promise.reject(new Error("IndexedDB not supported."));
    }
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Ensure 'projects' store exists
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'projectId' });
                }

                // Ensure 'appState' store exists (This previously caused the error)
                if (!db.objectStoreNames.contains(KV_STORE_NAME)) {
                    db.createObjectStore(KV_STORE_NAME, { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                dbPromise = null;
                reject(event.target.error);
            };
        });
    }
    return dbPromise;
}

const localApi = {
    async listProjects() {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },
    async saveProject(projectId, projectData) {
        const db = await getDb();
        try {
            const compressed = compressProjectData(projectData);
            const projectObject = { projectId, data: compressed };
            
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(projectObject);

                request.onsuccess = () => {
                    console.log(`Locally saved project '${projectId}' to IndexedDB.`);
                    resolve();
                };
                request.onerror = (event) => {
                    console.error(`Failed to save local project '${projectId}':`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error(`Failed to compress or save local project '${projectId}':`, e);
            return Promise.reject(e);
        }
    },
    async loadProject(projectId) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(projectId);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    reject(new Error(`Local project '${projectId}' not found.`));
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },
    async deleteProject(projectId) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(projectId);

            request.onsuccess = () => {
                console.log(`Locally deleted project '${projectId}' from IndexedDB.`);
                resolve();
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
};

async function populateProjectList(storageType = 'cloud') {
    if (!currentUser && storageType === 'cloud') {
        projectListContainer.innerHTML = '';
        noProjectsMessage.style.display = 'block';
        noProjectsMessage.textContent = 'Please log in to see cloud projects.';
        return;
    }
    
    try {
        const projects = storageType === 'cloud' 
            ? await api.listProjects(currentUser.userId)
            : await localApi.listProjects();

        projectListContainer.innerHTML = ''; 

        const uiProjects = projects.filter(p => !p.includes('__form__'));

        noProjectsMessage.style.display = uiProjects.length === 0 ? 'block' : 'none';
        noProjectsMessage.textContent = 'No projects found.';
        
        uiProjects.forEach(projectId => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-list-item';
            const icon = storageType === 'cloud' ? '☁️' : '💻';
            projectItem.innerHTML = `
                <span class="project-id-text">${icon} ${projectId}</span>
                <div class="project-item-buttons">
                    <button class="load-project-button action-button" data-id="${projectId}" data-storage="${storageType}">Load</button>
                    <button class="delete-project-button" data-id="${projectId}" data-storage="${storageType}">Delete</button>
                </div>
            `;
            projectListContainer.appendChild(projectItem);
        });
    } catch (error) {
        console.error(`Failed to fetch ${storageType} project list:`, error);
        noProjectsMessage.textContent = `Error loading ${storageType} projects.`;
        noProjectsMessage.style.display = 'block';
    }
}

async function handleLoadProject(event) {
    const button = event.target;
    const projectId = button.dataset.id;
    const storageType = button.dataset.storage;

    if (storageType === 'cloud' && !currentUser) {
        alert("Error: No user is logged in.");
        return;
    }
    
    try {
        const dataFromDb = storageType === 'cloud'
            ? await api.loadProject(currentUser.userId, projectId)
            : await localApi.loadProject(projectId);

        vibeTree = decompressProjectData(dataFromDb);
        currentProjectId = projectId;
        currentProjectStorageType = storageType;
        currentProjectGithubSource = null;

        saveSessionMetadata(); // Save state

        shareProjectButton.disabled = (storageType !== 'cloud');
        openAiStructureModalButton.disabled = (storageType !== 'cloud');
        updateSaveButtonStates();
        
        console.log(`Project '${projectId}' loaded from ${storageType}.`);
        
        refreshAllUI();
        resetHistory();
        switchToTab('preview');
    } catch (error) {
        console.error(`Could not load project '${projectId}' from ${storageType}:`, error);
        alert(`Error: ${error.message}`);
    }
}

async function handleDeleteProject(event) {
    const button = event.target;
    const projectId = button.dataset.id;
    const storageType = button.dataset.storage;

    if (storageType === 'cloud' && !currentUser) {
        alert("Error: No user is logged in.");
        return;
    }

    if (confirm(`Are you sure you want to permanently delete project '${projectId}' from ${storageType} storage?`)) {
        try {
            if (storageType === 'cloud') {
                await api.deleteProject(currentUser.userId, projectId);
                const allProjects = await api.listProjects(currentUser.userId);
                for(const p of allProjects) {
                    if (p.startsWith(`${projectId}__form__`)) {
                        await api.deleteProject(currentUser.userId, p);
                        console.log(`Deleted associated form data: ${p}`);
                    }
                }
            } else {
                await localApi.deleteProject(projectId);
            }
            console.log(`Project '${projectId}' deleted from ${storageType}.`);
            
            populateProjectList(storageType);
            if (currentProjectId === projectId) {
                resetToStartPage();
            }
        } catch (error) {
            console.error(`Failed to delete project '${projectId}' from ${storageType}:`, error);
            alert(`Error: ${error.message}`);
        }
    }
}

function autoSaveProject() {
    if (!currentProjectId || !vibeTree) return;
    
    switch(currentProjectStorageType) {
        case 'cloud':
            if (currentUser) {
                api.saveProject(currentUser.userId, currentProjectId, vibeTree);
            }
            break;
        case 'local':
            localApi.saveProject(currentProjectId, vibeTree);
            break;
        case 'github':
            break;
    }
}

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
        const component = getComponent(componentId);
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

function closeComponentModal() {
    contextComponentModal.style.display = 'none';
}

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

function handleSaveComponent() {
    const id = componentIdInput.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const name = componentNameInput.value.trim();
    const isEditing = componentIdInput.readOnly;

    componentModalError.textContent = '';
    if (!id || !name) {
        componentModalError.textContent = 'ID and Name are required.';
        return;
    }

    if (!isEditing && getComponent(id)) {
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

    saveComponent(component);
    console.log(`Component '${name}' saved.`);
    closeComponentModal();
    renderComponentList();
    selectComponentForPreview(id);
}

function handleDeleteComponentFromModal() {
    const componentId = deleteComponentButton.dataset.id;
    if (componentId && confirm(`Are you sure you want to delete the component "${componentId}"?`)) {
        deleteComponent(componentId);
        console.log(`Component '${componentId}' deleted.`);
        closeComponentModal();
        renderComponentList();
        contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
    }
}

function renderComponentList() {
    if (!contextComponentList) return;
    const components = listComponents();
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

function selectComponentForPreview(componentId) {
    if (!contextComponentViewer) return;

    contextComponentList.querySelectorAll('.component-list-item').forEach(el => {
        el.classList.toggle('selected', el.dataset.id === componentId);
    });
    
    const component = getComponent(componentId);
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

function handleDownloadContext() {
    try {
        const library = getComponentLibrary();
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

function handleUploadContextTrigger() {
    contextUploadInput.click();
}

async function processContextUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        console.log("No file selected for context upload.");
        return;
    }

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
            const currentCount = listComponents().length;

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

            saveComponentLibrary(newLibrary);
            console.log(`Successfully imported ${componentCount} components.`);
            
            renderComponentList();
            if (contextComponentViewer) {
                contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
            }

        } catch (error) {
            console.error("Failed to upload/process context library:", error);
            alert(`Error importing library: ${error.message}`);
        } finally {
            contextUploadInput.value = '';
        }
    };

    reader.onerror = (error) => {
        console.error("Error reading context file:", error);
        alert("An error occurred while reading the file.");
    };

    reader.readAsText(file);
}

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

async function handleSaveNodeAsComponent(event) {
    const nodeId = event.target.dataset.nodeId;
    await extractAndOpenComponentModal(nodeId, event.target);
}

async function handleSaveNodeAsComponentFromEditor(event) {
    const nodeId = event.target.dataset.id;
    await extractAndOpenComponentModal(nodeId, event.target);
}


let filesState = {
    selectedPath: null,
    clipboard: null
};

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

function renderFileTree() {
    if (!filesTreeEl) return;
    filesTreeEl.innerHTML = '';

    if (!currentProjectId) {
        filesTreeEl.innerHTML = '<div class="files-empty">No project loaded. Create or load a project to manage files.</div>';
        return;
    }
    filesTreeEl.innerHTML = '<div class="files-empty">File management is not connected to the backend.</div>';
    return;
}

function selectFile(path, liEl) {
    filesState.selectedPath = path;
    filesTreeEl.querySelectorAll('li.selected').forEach(li => li.classList.remove('selected'));
    if (liEl) liEl.classList.add('selected');
    renderFilePreview(path);
}

async function renderFilePreview(path) {
    if (!filesPreviewEl) return;
    filesPreviewEl.innerHTML = '';
    filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">File preview not implemented with backend.</div>';
}

function ensureProjectForFiles() {
    if (currentProjectId) return true;
    alert('Please create or load a project before managing files.');
    return false;
}

async function handleFilesUpload() {
    alert("File management not implemented with backend.");
}
async function handleFilesNewFolder() {
    alert("File management not implemented with backend.");
}
async function handleFilesNewFile() {
    alert("File management not implemented with backend.");
}
async function handleFilesDownload() {
    alert("File management not implemented with backend.");
}
function handleFilesCopy() {
    alert("File management not implemented with backend.");
}
async function handleFilesPaste() {
    alert("File management not implemented with backend.");
}
async function handleFilesRename() {
    alert("File management not implemented with backend.");
}
async function handleFilesDelete() {
    alert("File management not implemented with backend.");
}

// START: Dynamic Controls Feature
function renderControl(control, nodeId) {
    const controlWrapper = document.createElement('div');
    controlWrapper.className = `control-wrapper type-${control.type}`;
    
    // Checkbox labels usually go after the input, handled inside the switch for layout preference
    if (control.type !== 'checkbox') {
        controlWrapper.innerHTML = `<label for="control-${nodeId}-${control.id}">${control.label}</label>`;
    }

    let inputEl;
    switch (control.type) {
        case 'slider':
            inputEl = document.createElement('div');
            inputEl.className = 'slider-container';
            const unit = control.unit || '';
            inputEl.innerHTML = `
                <input type="range" id="control-${nodeId}-${control.id}" 
                       min="${control.min || 0}" max="${control.max || 100}" step="${control.step || 1}" value="${control.value}"
                       data-node-id="${nodeId}" data-control-id="${control.id}">
                <span class="slider-value">${control.value}${unit}</span>
            `;
            break;
        case 'color':
            inputEl = document.createElement('input');
            inputEl.type = 'color';
            inputEl.id = `control-${nodeId}-${control.id}`;
            inputEl.value = control.value;
            inputEl.dataset.nodeId = nodeId;
            inputEl.dataset.controlId = control.id;
            break;
        case 'select':
             inputEl = document.createElement('select');
             inputEl.id = `control-${nodeId}-${control.id}`;
             inputEl.dataset.nodeId = nodeId;
             inputEl.dataset.controlId = control.id;
             (control.options || []).forEach(opt => {
                 const option = document.createElement('option');
                 option.value = typeof opt === 'object' ? opt.value : opt;
                 option.textContent = typeof opt === 'object' ? opt.label : opt;
                 if (option.value === control.value) option.selected = true;
                 inputEl.appendChild(option);
             });
            break;
        case 'number':
            inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.id = `control-${nodeId}-${control.id}`;
            inputEl.value = control.value;
            if (control.min !== undefined) inputEl.min = control.min;
            if (control.max !== undefined) inputEl.max = control.max;
            if (control.step !== undefined) inputEl.step = control.step;
            inputEl.dataset.nodeId = nodeId;
            inputEl.dataset.controlId = control.id;
            break;
        case 'checkbox':
            controlWrapper.innerHTML = ''; // Clear default label
            // Create a flex container for checkbox
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.gap = '10px';
            
            inputEl = document.createElement('input');
            inputEl.type = 'checkbox';
            inputEl.id = `control-${nodeId}-${control.id}`;
            inputEl.checked = control.value === true || control.value === 'true';
            inputEl.dataset.nodeId = nodeId;
            inputEl.dataset.controlId = control.id;
            
            const labelEl = document.createElement('label');
            labelEl.htmlFor = `control-${nodeId}-${control.id}`;
            labelEl.textContent = control.label;
            labelEl.style.marginBottom = '0';
            
            checkboxContainer.appendChild(inputEl);
            checkboxContainer.appendChild(labelEl);
            controlWrapper.appendChild(checkboxContainer);
            return controlWrapper; // Return early as we handled appending
        case 'text':
        case 'url':
        case 'image':
        default:
            inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.id = `control-${nodeId}-${control.id}`;
            inputEl.value = control.value;
            inputEl.dataset.nodeId = nodeId;
            inputEl.dataset.controlId = control.id;
            if(control.placeholder) inputEl.placeholder = control.placeholder;
            break;
    }
    
    // For non-slider/non-checkbox inputs that were created above
    if (control.type !== 'slider' && control.type !== 'checkbox') {
        controlWrapper.appendChild(inputEl);
    } else if (control.type === 'slider') {
         controlWrapper.appendChild(inputEl);
    }
    
    return controlWrapper;
}

function openGenerateControlsModal(event) {
    const button = event.target.closest('button');
    const nodeId = button.dataset.id;
    if (!nodeId) return;

    aiControlsModalTitle.textContent = `Generate Controls for: ${nodeId}`;
    aiControlsNodeIdInput.value = nodeId;
    aiControlsPromptInput.value = '';
    aiControlsError.textContent = '';
    aiControlsModal.style.display = 'block';
    aiControlsPromptInput.focus();
}

function closeGenerateControlsModal() {
    aiControlsModal.style.display = 'none';
}

async function handleExecuteGenerateControls() {
    const nodeId = aiControlsNodeIdInput.value;
    const prompt = aiControlsPromptInput.value.trim();
    const button = aiControlsExecuteButton;

    if (!prompt) {
        aiControlsError.textContent = "Please describe the controls you want to generate.";
        return;
    }
    if (!nodeId) {
        aiControlsError.textContent = "Internal Error: No node ID specified.";
        return;
    }
    
    const node = findNodeById(nodeId);
    if (!node) {
        aiControlsError.textContent = `Internal Error: Node ${nodeId} not found.`;
        return;
    }

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = 'Generating... <div class="loading-spinner"></div>';
    aiControlsError.textContent = '';
    
    try {
        const systemPrompt = `You are an expert UI/UX designer and developer. Your task is to translate a user's natural language request into a JSON array of UI control objects for editing a web component. You can create controls for CSS properties, HTML attributes, and JavaScript variables.

**INPUT:**
1. **User Request:** A plain text description of the desired controls.
2. **Node Context:** The JSON object of the Vibe Tree node the controls will primarily apply to.
3. **Full Vibe Tree:** The entire project structure.

**OUTPUT:** You MUST respond with a single, valid JSON array of control objects. Do not add any other text or markdown.

**CONTROL SCHEMA (MANDATORY):**
- Each object in the array represents one control and must have:
  - \`id\`: A unique, kebab-case identifier (e.g., "image-url", "padding-top").
  - \`label\`: A human-readable label (e.g., "Image Link", "Top Padding").
  - \`type\`: One of **"text"**, **"number"**, **"slider"**, **"color"**, **"select"**, or **"checkbox"**.
  - \`value\`: A sensible initial value extracted from the code.
  - \`controlTarget\`: **"css"** or **"js"**.

**TYPE GUIDELINES:**
- Use **"text"** for URLs, strings, image sources, or general content.
- Use **"number"** for specific numeric inputs without a range.
- Use **"slider"** for numeric inputs with a defined range (requires \`min\`, \`max\`, \`step\`).
- Use **"checkbox"** for boolean toggles (true/false).

- **FOR CSS CONTROLS (\`controlTarget: "css"\`):**
  - \`selector\`: The CSS selector (e.g., "#element-id").
  - \`targetCssProperty\`: The CSS property (e.g., "backgroundImage", "fontSize"). Use camelCase.
  - If type is "text" and it's an image, the value usually needs to be wrapped in url(), but let the system handle the wrapping logic unless it's a raw string property.

- **FOR JAVASCRIPT CONTROLS (\`controlTarget: "js"\`):**
  - \`targetJsNodeId\`: The 'id' of the vibe node containing the JS.
  - \`targetJsVariable\`: The exact name of the variable to control.
`;

        const userPrompt = `User Request: "${prompt}"\n\nNode Context:\n\`\`\`json\n${JSON.stringify(node, null, 2)}\n\`\`\`\n\nFull Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const newControls = JSON.parse(rawResponse);
        
        if (!Array.isArray(newControls)) {
            throw new Error("AI did not return a valid JSON array for controls.");
        }

        recordHistory(`Generate controls for ${nodeId}`);
        
        const existingControls = new Map((node.controls || []).map(c => [c.id, c]));
        newControls.forEach(c => existingControls.set(c.id, c));
        node.controls = Array.from(existingControls.values());
        
        console.log(`Generated and merged ${newControls.length} controls for node ${nodeId}`);
        
        refreshAllUI();
        // Update initially to ensure synchronization
        newControls.forEach(control => {
            if (control.controlTarget === 'js') {
                updateDynamicJsVariable(control);
            }
        });
        updateDynamicStyles();

        autoSaveProject();
        closeGenerateControlsModal();

    } catch (e) {
        console.error(`Failed to generate controls for ${nodeId}:`, e);
        aiControlsError.textContent = `AI Error: ${e.message}`;
    } finally {
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}

function handleControlChange(event) {
    const input = event.target;
    const nodeId = input.dataset.nodeId;
    const controlId = input.dataset.controlId;

    if (!nodeId || !controlId) return;

    const node = findNodeById(nodeId);
    if (!node || !node.controls) return;

    const control = node.controls.find(c => c.id === controlId);
    if (!control) return;

    // Handle Checkbox vs Value inputs
    let newValue;
    if (input.type === 'checkbox') {
        newValue = input.checked; // Boolean
    } else {
        newValue = input.value; // String (even for number inputs usually)
    }

    if (String(control.value) === String(newValue)) return;

    control.value = newValue;

    if (control.type === 'slider') {
        const valueSpan = input.nextElementSibling;
        if (valueSpan && valueSpan.classList.contains('slider-value')) {
            valueSpan.textContent = `${newValue}${control.unit || ''}`;
        }
    }

    if (control.controlTarget === 'js') {
        updateDynamicJsVariable(control);
    } else {
        updateDynamicStyles();
    }
    
    autoSaveProject();
}


function updateDynamicJsVariable(control) {
    if (!control.targetJsNodeId || !control.targetJsVariable) {
        console.warn('JS control is missing targetJsNodeId or targetJsVariable', control);
        return;
    }

    const targetNode = findNodeById(control.targetJsNodeId);
    if (!targetNode) {
        console.error(`Could not find target JS node with ID: ${control.targetJsNodeId}`);
        return;
    }

    const variableName = control.targetJsVariable;
    const rawValue = control.value;
    let replacementValue;

    // --- SAFE VALUE FORMATTING ---
    // We determine how to format the value in the JS code based on the control type.
    
    if (control.type === 'checkbox') {
        // Boolean: true or false (no quotes)
        // Handles if the value comes in as boolean true or string "true"
        replacementValue = String(rawValue === true || rawValue === 'true');
    } 
    else if (control.type === 'number' || control.type === 'slider') {
        // Number: 10, 3.5 (no quotes)
        // Handle edge cases where value might be empty or invalid
        if (rawValue === '' || rawValue === null || isNaN(Number(rawValue))) {
            replacementValue = '0';
        } else {
            replacementValue = String(rawValue);
        }
    } 
    else {
        // Strings: "text", "color", "url" (needs quotes)
        // We use String(rawValue) to safely handle any input type, then escape quotes
        const safeString = String(rawValue === null || rawValue === undefined ? '' : rawValue);
        replacementValue = `"${safeString.replace(/"/g, '\\"')}"`;
    }
    // -----------------------------

    const patterns = [
        new RegExp(`(const|let|var)\\s+(${variableName})\\s*=\\s*([^;]+);`, 'g'),
        new RegExp(`(${variableName})\\s*:\\s*([^,}]+)([,}])`, 'g'),
        new RegExp(`(${variableName})\\s*=\\s*([^;]+);`, 'g')
    ];
    
    let matched = false;
    let newCode = targetNode.code;
    
    for (let i = 0; i < patterns.length && !matched; i++) {
        const pattern = patterns[i];
        if (pattern.test(targetNode.code)) {
            pattern.lastIndex = 0;
            
            if (i === 0) {
                newCode = targetNode.code.replace(pattern, `$1 $2 = ${replacementValue};`);
            } else if (i === 1) {
                newCode = targetNode.code.replace(pattern, `$1: ${replacementValue}$3`);
            } else if (i === 2) {
                newCode = targetNode.code.replace(pattern, `$1 = ${replacementValue};`);
            }
            
            if (newCode !== targetNode.code) {
                matched = true;
            }
        }
    }
    
    if (!matched) {
        console.error(`Could not find variable "${variableName}" in node "${targetNode.id}". Code:\n${targetNode.code}`);
        return;
    }

    if (targetNode.code !== newCode) {
        console.log(`Updating JS variable '${variableName}' in node '${targetNode.id}' to ${replacementValue}`);
        targetNode.code = newCode;
        
        recordHistory(`Update JS variable ${variableName}`);
        
        applyVibes();
        autoSaveProject();
    }
}

function updateDynamicStyles() {
    const DYNAMIC_STYLES_NODE_ID = 'vibe-dynamic-styles';
    
    let stylesNode = findNodeById(DYNAMIC_STYLES_NODE_ID);
    if (!stylesNode) {
        stylesNode = {
            id: DYNAMIC_STYLES_NODE_ID,
            type: 'css',
            description: 'This stylesheet is automatically generated by the interactive UI controls. Do not edit the code here directly, as your changes will be overwritten.',
            code: ''
        };
        if (!vibeTree.children) vibeTree.children = [];
        vibeTree.children.push(stylesNode);
    }

    const stylesBySelector = new Map();

    function traverseForControls(node) {
        if (node.controls && Array.isArray(node.controls)) {
            for (const control of node.controls) {
                if (control.controlTarget === 'js') continue;
                if (!control.selector || control.value === undefined) continue;
                if (!stylesBySelector.has(control.selector)) {
                    stylesBySelector.set(control.selector, {});
                }
                const styles = stylesBySelector.get(control.selector);
                const cssProperty = control.targetCssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
                styles[cssProperty] = `${control.value}${control.unit || ''}`;
            }
        }
        if (node.children) {
            node.children.forEach(traverseForControls);
        }
    }

    traverseForControls(vibeTree);

    let newCssCode = `/* This file is auto-generated by Vibe Controls */\n\n`;
    for (const [selector, styles] of stylesBySelector.entries()) {
        newCssCode += `${selector} {\n`;
        for (const [prop, value] of Object.entries(styles)) {
            newCssCode += `  ${prop}: ${value};\n`;
        }
        newCssCode += `}\n\n`;
    }

    if (stylesNode.code !== newCssCode) {
        stylesNode.code = newCssCode;
        applyVibes();
    }
}

function bindEventListeners() {
    if (showSignupLink) showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showAuthForm('signup'); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showAuthForm('login'); });
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (signupButton) signupButton.addEventListener('click', handleSignup);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (loginPasswordInput) loginPasswordInput.addEventListener('keydown', (e) => e.key === 'Enter' && handleLogin());
    if (signupPasswordInput) signupPasswordInput.addEventListener('keydown', (e) => e.key === 'Enter' && handleSignup());
    
    handleTabSwitching();
    if (toggleInspectButton) toggleInspectButton.addEventListener('click', toggleInspectMode);
    if (undoButton) undoButton.addEventListener('click', doUndo);
    if (redoButton) redoButton.addEventListener('click', doRedo);
    if (shareProjectButton) shareProjectButton.addEventListener('click', handleShareProject);
    if (saveToCloudButton) saveToCloudButton.addEventListener('click', handleSaveToCloud);
    if (saveToLocalButton) saveToLocalButton.addEventListener('click', handleSaveToLocal);
    if (saveToGithubButton) saveToGithubButton.addEventListener('click', handleSaveToGitHub);
    if (updateTreeFromCodeButton) updateTreeFromCodeButton.addEventListener('click', handleUpdateTreeFromCode);
    if (runFullCodeAiButton) {
        runFullCodeAiButton.addEventListener('click', handleFullCodeAiUpdate);
    }
    if (fullCodeAiPromptInput) {
        fullCodeAiPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFullCodeAiUpdate();
            }
        });
    }
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

    if (storageToggleButtons) {
        storageToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                storageToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                populateProjectList(button.dataset.storage);
            });
        });
    }

    if (saveGithubPatButton) saveGithubPatButton.addEventListener('click', handleSaveGithubPat);
    if (logoutGithubButton) logoutGithubButton.addEventListener('click', handleLogoutGithub);
    if (githubRepoSelect) githubRepoSelect.addEventListener('change', populateGithubBranches);
    if (loadFromGithubButton) loadFromGithubButton.addEventListener('click', handleLoadFromGithub);
    
    if (runAgentSingleTaskButton) runAgentSingleTaskButton.addEventListener('click', handleAddTaskToQueue);
    if (startIterativeSessionButton) startIterativeSessionButton.addEventListener('click', handleStartTaskQueue);
    if (endSessionButton) endSessionButton.addEventListener('click', handleStopTaskQueue);
    
    if (agentPromptInput) {
        renderAutoPilotTriggers();
    }
    
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
    
    // Updated Logic here for new project
    if (newProjectButton) newProjectButton.addEventListener('click', () => {
        clearSessionMetadata();
        resetToStartPage();
    });
    
    if (globalAgentLoader) globalAgentLoader.addEventListener('click', hideGlobalAgentLoader);

    if (openAiStructureModalButton) openAiStructureModalButton.addEventListener('click', openAiStructureModal);
    if (aiStructureCloseButton) aiStructureCloseButton.addEventListener('click', closeAiStructureModal);
    if (aiStructureExecuteButton) aiStructureExecuteButton.addEventListener('click', handleAiStructureUpdate);
    
    if (aiProjectEditExecuteButton) aiProjectEditExecuteButton.addEventListener('click', handleAiProjectEditExecute);
    if (aiProjectEditCloseButton) aiProjectEditCloseButton.addEventListener('click', closeAiProjectEditModal);
    if (aiProjectEditPromptInput) {
        aiProjectEditPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAiProjectEditExecute(); }
        });
    }

    if (aiControlsExecuteButton) aiControlsExecuteButton.addEventListener('click', handleExecuteGenerateControls);
    if (aiControlsCloseButton) aiControlsCloseButton.addEventListener('click', closeGenerateControlsModal);
    if (aiControlsPromptInput) {
        aiControlsPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleExecuteGenerateControls(); }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) settingsModal.style.display = 'none';
        if (event.target === addNodeModal) closeModal();
        if (event.target === editNodeModal) closeEditNodeModal();
        if (event.target === contextComponentModal) closeComponentModal();
        if (event.target === aiProjectEditModal) closeAiProjectEditModal();
        if (event.target === aiStructureModal) closeAiStructureModal();
        if (event.target === aiControlsModal) closeGenerateControlsModal();
    });
    
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (currentProjectStorageType === 'cloud' && saveToCloudButton && !saveToCloudButton.disabled) {
                handleSaveToCloud();
            } else if (currentProjectStorageType === 'github' && saveToGithubButton && !saveToGithubButton.disabled) {
                handleSaveToGitHub();
            } else if (saveToLocalButton && !saveToLocalButton.disabled) {
                handleSaveToLocal();
            }
        }
    });
}
    
function resetToStartPage() {
    console.log("Resetting to new project state.");
    currentProjectId = null;
    currentProjectStorageType = 'cloud';
    currentProjectGithubSource = null;
    if(shareProjectButton) shareProjectButton.disabled = true;
    updateSaveButtonStates();
    if(openAiStructureModalButton) openAiStructureModalButton.disabled = true;
    vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
    resetHistory();
    switchToTab('start');
    projectPromptInput.value = '';
    if (projectInstructionsInput) projectInstructionsInput.value = '';
    newProjectIdInput.value = '';
    startPageGenerationOutput.style.display = 'none';
    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if(generateProjectButton) generateProjectButton.disabled = !keyIsAvailable;
    if(newProjectContainer) newProjectContainer.style.display = 'block';
    if(editorContainer) editorContainer.innerHTML = '';
    if(previewContainer) previewContainer.srcdoc = '';
    
    if(agentOutput) {
        agentOutput.innerHTML = ''; 
        const placeholder = document.createElement('div');
        placeholder.className = 'agent-message-placeholder';
        placeholder.textContent = "The agent's plan and actions will appear here.";
        agentOutput.appendChild(placeholder);
    }

    if(chatOutput) chatOutput.innerHTML = '<div class="chat-message-placeholder">Start the conversation by typing a message below.</div>';
    if(flowchartOutput) flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Click "Generate Flowchart" to create a diagram.</div>';
    if(consoleOutput) consoleOutput.innerHTML = '';
    if(fullCodeEditor) fullCodeEditor.value = '';

    const cloudToggle = document.querySelector('.storage-toggle button[data-storage="cloud"]');
    if (cloudToggle) {
        cloudToggle.click();
        storageToggleButtons.forEach(btn => btn.classList.remove('active'));
        cloudToggle.classList.add('active');
        populateProjectList('cloud');
    }

    activeAutoPilotListeners.forEach(l => vibeEventBus.removeEventListener(l.event, l.fn));
    activeAutoPilotListeners = [];

    console.log("Ready for new project.");
}

async function buildAssetUrlMap() { return {}; }
function injectAssetRewriterScript(doc, assetMap) {}

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
            
            if (agentDecision.question) {
                alert(`AI Question: ${agentDecision.question}\n\n(Please provide clearer instructions in the description field and try again.)`);
                return;
            }

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
    if (tree && tree.type === 'raw-html-container') {
        return 'graph TD\n  A["Raw HTML Project"] -- "Not structured" --> B["Vibe Editor Disabled"];';
    }
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
    addNode(vibeTree); 
    return graph;
}

function extractMermaidFromText(text) {
    if (!text) return '';
    const mermaidFence = text.match(/```mermaid\s*([\s\S]*?)\s*```/i);
    if (mermaidFence && mermaidFence[1]) return mermaidFence[1];
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

        const storageType = document.querySelector('input[name="projectStorage"]:checked').value;
        let desiredId = (newProjectIdInput.value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!desiredId) desiredId = `project-${Date.now()}`;
        
        const existing = storageType === 'cloud' 
            ? await api.listProjects(currentUser.userId)
            : await localApi.listProjects();

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
        currentProjectStorageType = storageType;
        
        shareProjectButton.disabled = (storageType !== 'cloud');
        openAiStructureModalButton.disabled = (storageType !== 'cloud');
        updateSaveButtonStates();
        resetHistory();
        
        liveCodeOutput.textContent = generateFullCodeString(vibeTree, currentUser.userId, currentProjectId);
        generationStatusText.textContent = 'Project generated! Finalizing...';

        autoSaveProject();
        saveSessionMetadata(); // Save state

        await populateProjectList(storageType);
        
        storageToggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.storage === storageType));

        refreshAllUI();
        switchToTab('preview');
        console.log(`New project '${currentProjectId}' created in ${storageType} storage.`);
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

        const storageType = document.querySelector('input[name="projectStorage"]:checked').value;
        let desiredId = (newProjectIdInput.value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!desiredId) desiredId = `project-${Date.now()}`;

        const existing = storageType === 'cloud' 
            ? await api.listProjects(currentUser.userId)
            : await localApi.listProjects();
            
        let projectId = desiredId;
        let suffix = 2;
        while (existing.includes(projectId)) projectId = `${desiredId}-${suffix++}`;

        currentProjectId = projectId;
        currentProjectStorageType = storageType;
        shareProjectButton.disabled = (storageType !== 'cloud');
        openAiStructureModalButton.disabled = (storageType !== 'cloud');
        updateSaveButtonStates();

        vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
        vibeTree.description = prompt;
        autoSaveProject();
        saveSessionMetadata(); // Save state

        await populateProjectList(storageType);
        storageToggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.storage === storageType));

        resetHistory();
        refreshAllUI();

        console.log(`New project '${currentProjectId}' created in ${storageType} for task queue session.`);

        switchToTab('agent');
        agentPromptInput.value = prompt; 
        handleAddTaskToQueue();
        handleStartTaskQueue();

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
        const fenced = improved.match(/```([\s\S]*?)```/);
        if (fenced && fenced[1]) {
            improved = fenced[1].trim();
        }

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
    if (event.target.classList.contains('drag-handle')) {
        return;
    }
    
    if (event.target.closest('button, a, input, textarea')) {
        return;
    }
    
    const header = event.currentTarget;
    header.closest('.vibe-node').classList.toggle('collapsed');
}

// --- Component Shorthand Logic ---

function refreshShorthandDropdowns() {
    const components = listComponents();
    const dropdowns = [
        document.getElementById('agent-component-shorthand-select'),
        document.getElementById('start-component-shorthand-select')
    ];

    dropdowns.forEach(select => {
        if (!select) return;
        
        // Preserve selection if possible
        const currentVal = select.value;
        
        select.innerHTML = '<option value="">-- Insert Component Library (@) --</option>';

        components.sort((a, b) => a.id.localeCompare(b.id)).forEach(comp => {
            const option = document.createElement('option');
            option.value = `@${comp.id}`;
            option.textContent = `${comp.name} (@${comp.id})`;
            select.appendChild(option);
        });
        
        select.value = currentVal;
    });
}

function initializeShorthandSystem() {
    // 1. Automatic Seeding if empty
    const currentLibrary = getComponentLibrary();
    if (Object.keys(currentLibrary).length === 0) {
        console.log("Seeding component library from JSON...");
        saveComponentLibrary(VIBE_JSON_LIBRARY);
    }

    refreshShorthandDropdowns();

    // 2. Attach Listeners for Shorthand Buttons
    const agentBtn = document.getElementById('agent-insert-shorthand-button');
    if (agentBtn) {
        agentBtn.addEventListener('click', () => {
            const select = document.getElementById('agent-component-shorthand-select');
            const input = document.getElementById('agent-prompt-input');
            if (select && select.value && input) {
                insertAtCursor(input, select.value);
                select.value = ""; 
            }
        });
    }

    const startBtn = document.getElementById('start-insert-shorthand-button');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const select = document.getElementById('start-component-shorthand-select');
            const input = document.getElementById('project-prompt-input');
            if (select && select.value && input) {
                insertAtCursor(input, select.value);
                select.value = "";
            }
        });
    }
}

function initMainApp() {
    initializeApiSettings();
    initializeMermaid();
    initializeShorthandSystem(); 
    SuggestionEngine.init();
    
    bindEventListeners();
    
    SuggestionEngine.attachToInputs();
    
    checkLoggedInState();
    checkGithubLoginState(); 

    // Wait slightly for auth states to settle before restoring the project session
    setTimeout(restoreSession, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const isLiveView = params.get('view') === 'live';
    const userId = params.get('user');
    const projectId = params.get('project');

    if (isLiveView && userId && projectId) {
        runLiveView(userId, projectId);
    } else {
        initMainApp();
    }
});


window.vibeAPI = {
    callAI: callAI, 
    switchToTab: switchToTab,
    getCurrentProject: () => ({ id: currentProjectId, tree: vibeTree }),
    refreshUI: refreshAllUI,
    handleQuickReply: handleQuickReply
};

console.log("Vibe Automation API exposed as window.vibeAPI");


/*  if (typeof newValue === 'boolean') {
        replacementValue = String(newValue); // "true" or "false" (no quotes)
    } else if (!isNaN(Number(newValue)) && String(newValue).trim() !== '') {
        // It's a number
        replacementValue = String(newValue); 
    } else {
        // It's a string, wrap in quotes
        replacementValue = `"${String(newValue).replace(/"/g, '\\"')}"`;
    }
*/



async function clearSessionMetadata() {
    try {
        await idbKV.remove(SESSION_KEYS.PROJECT_ID);
        await idbKV.remove(SESSION_KEYS.STORAGE_TYPE);
        await idbKV.remove(SESSION_KEYS.GITHUB_SOURCE);
        // Note: We deliberately keep the TAB preference so the user stays on the same screen
    } catch (e) {
        console.error("Failed to clear session metadata:", e);
    }
}

async function restoreSession() {
    // 1. Show loading state if UI elements exist
    if (generationStatusText && startPageGenerationOutput) {
        startPageGenerationOutput.style.display = 'block';
        generationStatusText.textContent = "Restoring previous session...";
    }

    try {
        // 2. Restore Tab Preference (Async get)
        const lastTab = await idbKV.get(SESSION_KEYS.TAB);
        
        // 3. Check for saved project
        const pid = await idbKV.get(SESSION_KEYS.PROJECT_ID);
        const type = await idbKV.get(SESSION_KEYS.STORAGE_TYPE);

        // If no project was saved, just handle the tab and exit
        if (!pid) {
            if (lastTab && lastTab !== 'start') {
                switchToTab(lastTab);
            }
            if (startPageGenerationOutput) startPageGenerationOutput.style.display = 'none';
            return;
        }

        console.log(`Attempting to restore session for project '${pid}' (${type})...`);
        
        let restoredTree = null;

        if (type === 'cloud') {
            // For cloud, we need to be logged in. 
            if (!currentUser) {
                console.log("Session restore skipped: User not logged in for cloud project.");
                await clearSessionMetadata(); // Clear stale data
                if (startPageGenerationOutput) startPageGenerationOutput.style.display = 'none';
                return;
            }
            const compressed = await api.loadProject(currentUser.userId, pid);
            restoredTree = decompressProjectData(compressed);
        } 
        else if (type === 'local') {
            const compressed = await localApi.loadProject(pid);
            restoredTree = decompressProjectData(compressed);
        } 
        else if (type === 'github') {
            const sourceStr = await idbKV.get(SESSION_KEYS.GITHUB_SOURCE);
            const token = sessionStorage.getItem('githubToken');
            
            if (sourceStr && token) {
                const source = JSON.parse(sourceStr);
                const content = await githubApi.getProjectFile(source.owner, source.repo, source.branch);
                if (content) {
                    restoredTree = JSON.parse(content);
                    currentProjectGithubSource = source;
                }
            }
        }

        if (restoredTree) {
            vibeTree = restoredTree;
            currentProjectId = pid;
            currentProjectStorageType = type;

            // Update UI State to match restored project
            if (shareProjectButton) shareProjectButton.disabled = (type !== 'cloud');
            if (openAiStructureModalButton) openAiStructureModalButton.disabled = (type !== 'cloud');
            updateSaveButtonStates();
            
            // Re-populate project lists and toggle active buttons
            await populateProjectList(type);
            if (storageToggleButtons) {
                storageToggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.storage === type));
            }

            refreshAllUI();
            resetHistory(); 
            
            // Hide loading text
            if (startPageGenerationOutput) startPageGenerationOutput.style.display = 'none';

            // Finally switch to the last active tab or preview
            if (lastTab) {
                switchToTab(lastTab);
            } else {
                switchToTab('preview');
            }
            
            console.log(`Session successfully restored: ${pid}`);
        }
    } catch (e) {
        console.error("Failed to restore session:", e);
        if (startPageGenerationOutput) startPageGenerationOutput.style.display = 'none';
        await clearSessionMetadata(); 
        resetToStartPage();
    }
}
async function saveSessionMetadata() {
    if (currentProjectId) {
        try {
            await idbKV.set(SESSION_KEYS.PROJECT_ID, currentProjectId);
            await idbKV.set(SESSION_KEYS.STORAGE_TYPE, currentProjectStorageType);
            
            if (currentProjectGithubSource) {
                await idbKV.set(SESSION_KEYS.GITHUB_SOURCE, JSON.stringify(currentProjectGithubSource));
            } else {
                await idbKV.remove(SESSION_KEYS.GITHUB_SOURCE);
            }
            
            // Save current tab as well
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab) {
                await idbKV.set(SESSION_KEYS.TAB, activeTab.dataset.tab);
            }
        } catch (e) {
            console.error("Failed to save session metadata to IndexedDB:", e);
        }
    }
}



// New helper to convert binary data to Base64 Data URI
function arrayBufferToDataUri(buffer, mimeType) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
}

// Helper to clean up paths for matching
function normalizePath(path) {
    return path.replace(/^[./]+/, '').replace(/^\/+/, '');
}

// Robust function to flatten zip into a single HTML string with Data URIs
async function buildCombinedHtmlFromZip(jszip) {
    // 1. Find the entry point (index.html)
    const fileNames = Object.keys(jszip.files);
    const htmlCandidates = fileNames.filter(n => !jszip.files[n].dir && n.toLowerCase().endsWith('index.html'));
    
    if (htmlCandidates.length === 0) {
        // Fallback: try any html file
        const anyHtml = fileNames.find(n => !jszip.files[n].dir && n.toLowerCase().endsWith('.html'));
        if (anyHtml) htmlCandidates.push(anyHtml);
        else throw new Error('No index.html found in ZIP.');
    }
    
    // Pick the shortest path index.html (usually root)
    htmlCandidates.sort((a, b) => a.length - b.length);
    const indexPath = htmlCandidates[0];
    const indexDir = indexPath.includes('/') ? indexPath.substring(0, indexPath.lastIndexOf('/') + 1) : '';

    console.log(`Processing ZIP with entry point: ${indexPath}`);

    // 2. Create a map of Path -> DataURI for all non-HTML assets
    const assetMap = {};
    
    for (const name of fileNames) {
        const file = jszip.files[name];
        if (file.dir || name === indexPath) continue;

        const mime = guessMimeType(name);
        // Normalize path relative to the root of the zip
        const normalizedName = normalizePath(name); 

        if (mime.startsWith('text/') || mime === 'application/javascript') {
            // Store text content (CSS/JS) directly? 
            // Better strategy: Convert EVERYTHING to Data URI to handle relative paths easily in regex
            // OR keep text as text for <style> injection. 
            // Let's go with text for CSS/JS to keep file size slightly lower, DataURI for binary.
        } 
        
        // We load everything as Uint8Array first to be safe
        const content = await file.async('uint8array');
        const dataUri = arrayBufferToDataUri(content, mime);
        assetMap[normalizedName] = dataUri;
    }

    // 3. Load Index HTML
    let htmlContent = await jszip.files[indexPath].async('text');
    
    // 4. Helper to resolve relative paths in the HTML/CSS to our Asset Map
    const resolveAndReplace = (content, currentFileDir) => {
        // Regex to find urls: src="...", href="...", url(...)
        return content.replace(/(src="|href="|url\(['"]?)([^'"()]+)(['"]?\))/g, (match, prefix, url, suffix) => {
            if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('#')) return match;
            
            // Logic to resolve relative path (e.g. "../images/logo.png")
            // This is a simplified resolver. 
            let fullPathInZip = (currentFileDir + url).replace(/\/+/g, '/');
            
            // Handle simple "../"
            const parts = fullPathInZip.split('/');
            const stack = [];
            for(let part of parts) {
                if(part === '..') stack.pop();
                else if(part !== '.') stack.push(part);
            }
            fullPathInZip = stack.join('/');
            
            const normalizedTarget = normalizePath(fullPathInZip);
            
            if (assetMap[normalizedTarget]) {
                // If it's a CSS/JS file, we might want to inline it, but for raw-container, 
                // replacing with Data URI is the safest "catch-all" for <img src> and background-image.
                // For <link rel="stylesheet"> and <script src>, we usually want to inline the TEXT content.
                return `${prefix}${assetMap[normalizedTarget]}${suffix}`;
            }
            
            return match; // Return original if not found
        });
    };

    // 5. Inline CSS and JS files directly (Better than Data URI for these)
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Handle CSS Links
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
            // Resolve path
            const resolvedPath = normalizePath(resolveZipPath(indexDir, href));
            const zipFile = jszip.files[resolvedPath];
            if (zipFile) {
                let cssText = await zipFile.async('text');
                // We must also rewrite URLs *inside* the CSS (background-images, fonts)
                const cssDir = resolvedPath.includes('/') ? resolvedPath.substring(0, resolvedPath.lastIndexOf('/') + 1) : '';
                cssText = resolveAndReplace(cssText, cssDir);
                
                const style = document.createElement('style');
                style.textContent = cssText;
                link.replaceWith(style);
            }
        }
    }

    // Handle Script Tags
    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src) {
            const resolvedPath = normalizePath(resolveZipPath(indexDir, src));
            const zipFile = jszip.files[resolvedPath];
            if (zipFile) {
                const jsText = await zipFile.async('text');
                script.removeAttribute('src');
                script.textContent = jsText;
            }
        }
    }

    // Serialize back to string
    htmlContent = new XMLSerializer().serializeToString(doc);

    // 6. Final Pass: Replace images/fonts in the HTML (img src, etc)
    htmlContent = resolveAndReplace(htmlContent, indexDir);

    return htmlContent;
}

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
        
        // Use the new builder that embeds assets
        const combinedHtml = await buildCombinedHtmlFromZip(jszip);

        // Generate ID
        const derivedId = file.name.replace(/\.zip$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        let projectId = derivedId || `zip-project-${Date.now()}`;
        
        // Switch to Local Storage
        currentProjectStorageType = 'local';
        const existing = await localApi.listProjects();
        let suffix = 1;
        while (existing.includes(projectId)) {
            projectId = `${derivedId}-${suffix++}`;
        }
        currentProjectId = projectId;
        
        // Update UI State
        const localToggleBtn = document.querySelector('.storage-toggle button[data-storage="local"]');
        if (localToggleBtn) {
            document.querySelectorAll('.storage-toggle button').forEach(b => b.classList.remove('active'));
            localToggleBtn.classList.add('active');
        }

        updateSaveButtonStates();
        if(shareProjectButton) shareProjectButton.disabled = true;
        if(openAiStructureModalButton) openAiStructureModalButton.disabled = true;

        // Create Tree
        vibeTree = {
            id: `raw-${currentProjectId}`,
            type: 'raw-html-container',
            description: `Raw project uploaded from ZIP file: ${file.name}`,
            code: combinedHtml,
            children: []
        };

        // Save
        await localApi.saveProject(currentProjectId, vibeTree);
        saveSessionMetadata();
        
        resetHistory();
        refreshAllUI();
        switchToTab('preview');
        console.log(`Raw ZIP project '${currentProjectId}' imported locally with embedded assets.`);

    } catch (e) {
        console.error('ZIP import failed:', e);
        alert(`Failed to import ZIP: ${e.message}`);
    } finally {
        uploadZipButton.disabled = false;
        uploadZipButton.innerHTML = originalText;
        // Reset file input so change event triggers again if same file selected
        zipFileInput.value = '';
    }
}
