import * as api from './api.js';
import { initNervousSystem, refreshNervousSystem, reportNervousSystemError, clearNervousSystemErrors } from './nervous-system.js';

// NOTE: DOM element references below are declared at module-load time.
// Since this is an ES module, it is deferred by default, so the DOM
// will be available when these run. Ensure you do NOT load this file
// with the 'async' attribute.

const startSel = document.getElementById('start-component-shorthand-select');
const agentSel = document.getElementById('agent-component-shorthand-select');

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


// --- START OF LIVE VIEW BOOTLOADER ---

function compressProjectData(projectData) {
    try {
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
    if (!dataString) return null;

    if (typeof dataString === 'object') {
        return dataString;
    }

    if (typeof dataString === 'string' && (dataString.trim().startsWith('{') || dataString.trim().startsWith('['))) {
        try {
            return JSON.parse(dataString);
        } catch (e) {
            console.warn("Looked like JSON but failed to parse directly, trying Base64 decode.", e);
        }
    }

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
                // FIX: Better handling for replacement to avoid duplicating if the user code is just a wrapper
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
                // FIX: No IIFE wrapping here to preserve global scope access
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

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT') || !USER_ID || !PROJECT_ID) {
        window.vibe = { loadData: () => Promise.resolve([]) };
        return;
    }

    async function postRequest(action, payload) {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, ...payload })
        });
        const result = await response.json();
        if (result.status === 'success') return result.data !== undefined ? result.data : result;
        throw new Error(result.message || 'API Error');
    }

    window.vibe = {
        loadData: async function(formId) {
            if (!formId) return Promise.reject(new Error('formId is required.'));
            try {
                return await postRequest('loadFormData', { userId: USER_ID, projectId: PROJECT_ID, formId: formId });
            } catch (e) {
                console.error('VibeDB Load Error:', e);
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
            await postRequest('saveFormData', { userId: USER_ID, projectId: PROJECT_ID, formId: formId, data: data });
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
    <script>${jsContent.trim()}<\/script>
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
        // Report to Nervous System — try to attribute to a JS node
        reportNervousSystemError(null, errorMessage);
        // Forward to APUI iframe if visible
        try { const f=document.getElementById('apui-frame'); if(f) f.contentWindow.postMessage({type:'apui-node-error',nodeId:null,message:errorMessage},'*'); } catch(e) {}
        // Also relay as outer-console-error so Jarvis in APUI can see it
        try { const f=document.getElementById('apui-frame'); if(f&&f.contentWindow) f.contentWindow.postMessage({type:'apui-outer-console-error',message:errorMessage},'*'); } catch(e) {}
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
        case 'groupCollapsed': {
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
        }
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
    if (!currentProjectId || !vibeTree) {
        alert("Please load or create a project before sharing it.");
        return;
    }
    if (!currentUser) {
        alert("Please log in before sharing a project.");
        return;
    }

    const originalHtml = shareProjectButton ? shareProjectButton.innerHTML : '';

    try {
        // Uploaded HTML/ZIP projects start as local raw projects. A live share URL
        // needs cloud storage, so transparently save a cloud copy first.
        if (currentProjectStorageType !== 'cloud') {
            const suggestedId = currentProjectId || `shared-project-${Date.now()}`;
            const cloudProjectId = await getNewProjectId('cloud', suggestedId);
            if (cloudProjectId === null) return;

            if (shareProjectButton) {
                shareProjectButton.disabled = true;
                shareProjectButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            }

            await api.saveProject(currentUser.userId, cloudProjectId, vibeTree);
            currentProjectId = cloudProjectId;
            currentProjectStorageType = 'cloud';
            currentProjectGithubSource = null;
            saveSessionMetadata();
            await populateProjectList('cloud');
            storageToggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.storage === 'cloud'));
            updateSaveButtonStates();
        }

        const url = `${window.location.origin}${window.location.pathname}?view=live&user=${encodeURIComponent(currentUser.userId)}&project=${encodeURIComponent(currentProjectId)}`;
        await copyTextToClipboard(url);

        if (shareProjectButton) {
            shareProjectButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
            shareProjectButton.disabled = true;
        }

        console.log(`Copied shareable link: ${url}`);

        setTimeout(() => {
            if (shareProjectButton) {
                shareProjectButton.innerHTML = originalHtml || '<i class="bi bi-share me-2"></i>Share Project';
                updateProjectActionButtonStates();
            }
        }, 2000);

    } catch (err) {
        console.error('Failed to create/copy share link: ', err);
        alert(`Failed to create the share link: ${err.message}`);
        if (shareProjectButton) {
            shareProjectButton.innerHTML = originalHtml || '<i class="bi bi-share me-2"></i>Share Project';
            updateProjectActionButtonStates();
        }
    }
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        const ok = document.execCommand('copy');
        if (!ok) throw new Error('Browser copy command failed.');
    } finally {
        textarea.remove();
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

        updateProjectActionButtonStates();
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
            updateProjectActionButtonStates();
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

function updateProjectActionButtonStates() {
    const hasProject = !!currentProjectId && !!vibeTree;
    if (shareProjectButton) shareProjectButton.disabled = !hasProject;
    if (openAiStructureModalButton) openAiStructureModalButton.disabled = !hasProject;
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

        updateProjectActionButtonStates();
        populateProjectList('cloud');
        
        document.querySelector('.storage-toggle button[data-storage="cloud"]').click();

        setTimeout(() => {
            button.innerHTML = originalHtml;
            updateSaveButtonStates();
            updateProjectActionButtonStates();
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

        updateProjectActionButtonStates();
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
    var _savedModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
    var _savedCustomModel = localStorage.getItem('geminiCustomModel') || '';
    if (_savedCustomModel) {
        // Restore custom model selection
        geminiModelSelect.value = '__custom__';
        var _customContainer = document.getElementById('gemini-custom-model-container');
        var _customInput = document.getElementById('gemini-custom-model-input');
        if (_customContainer) _customContainer.style.display = 'block';
        if (_customInput) _customInput.value = _savedCustomModel;
    } else {
        geminiModelSelect.value = _savedModel;
    }

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
    const isRunnable = ['html', 'css', 'javascript', 'js-function'].includes(node.type);

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
                ${isRunnable ? `<button class="run-node-button" data-id="${node.id}" title="Run this node's code as a standalone notebook cell">▶ Run</button>` : ''}
            </div>
            <div class="vibe-node-controls" id="controls-for-${node.id}"></div>
            ${(showCodeButton || isHeadNode) ? `<textarea class="code-editor-display" id="editor-${node.id}" style="display: none;"></textarea>` : ''}
            ${isRunnable ? `<div class="run-output-panel" id="run-output-${node.id}" style="display:none;"></div>` : ''}
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

// --- Live "Notebook Cell" Code Runner ---
// Lets a user run a single node's code in isolation to test it, much like a
// notebook cell. JS-type nodes execute in a throwaway sandboxed iframe; the
// user's code can assign a value to a special `run.output` variable (or
// simply `return` a value / call console.log) to see results inline.
// HTML/CSS nodes instead render a live isolated preview of just that node.

/**
 * Executes a snippet of JavaScript inside a fresh, sandboxed (scriptable but
 * otherwise isolated) iframe, capturing console output, any thrown error,
 * and whatever the user assigned to `run.output` (or returned).
 * Resolves with { output, hadOutput, logs, error }.
 */
function runJsInSandbox(code, timeoutMs = 5000) {
    return new Promise((resolve) => {
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.style.display = 'none';

        let settled = false;
        const cleanup = () => {
            window.removeEventListener('message', onMessage);
            clearTimeout(timeoutId);
            if (frame.parentNode) frame.parentNode.removeChild(frame);
        };
        const onMessage = (e) => {
            if (settled || !e.data || e.data.__vibeRunResult !== true) return;
            settled = true;
            cleanup();
            resolve(e.data);
        };
        window.addEventListener('message', onMessage);

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve({ error: `Execution timed out after ${Math.round(timeoutMs / 1000)}s. Check for infinite loops or unresolved async code.`, logs: [], output: undefined, hadOutput: false });
        }, timeoutMs);

        const encodedCode = JSON.stringify(code);
        frame.srcdoc = `<!DOCTYPE html><html><body><script>
(function(){
    var logs = [];
    function fmt(a){
        try { return (typeof a === 'object' && a !== null) ? JSON.stringify(a, null, 2) : String(a); }
        catch(_) { return String(a); }
    }
    var origLog = console.log, origErr = console.error, origWarn = console.warn;
    console.log = function(){ logs.push(Array.prototype.map.call(arguments, fmt).join(' ')); };
    console.error = function(){ logs.push('ERR: ' + Array.prototype.map.call(arguments, fmt).join(' ')); };
    console.warn = function(){ logs.push('WARN: ' + Array.prototype.map.call(arguments, fmt).join(' ')); };

    var run = { output: undefined };
    var output, error = null, hadOutput = false;
    try {
        var userCode = ${encodedCode};
        var fn = new Function('run', 'console', userCode);
        var ret = fn(run, console);
        if (run.output !== undefined) { output = run.output; hadOutput = true; }
        else if (ret !== undefined) { output = ret; hadOutput = true; }
    } catch (e) {
        error = (e && e.message) ? e.message : String(e);
    }

    var serialized;
    try { serialized = (output === undefined) ? undefined : JSON.stringify(output, null, 2); }
    catch(_) { serialized = String(output); }

    parent.postMessage({ __vibeRunResult: true, output: serialized, hadOutput: hadOutput, logs: logs, error: error }, '*');
})();
<\/script></body></html>`;

        document.body.appendChild(frame);
    });
}

/** Builds a minimal standalone HTML doc to preview a single html/css node in isolation. */
function buildRunPreviewDoc(node) {
    if (node.type === 'css') {
        return `<!DOCTYPE html><html><head><style>${node.code || ''}</style></head>
<body style="margin:0;background:#12182c;color:#dfe4ff;padding:16px;font-family:'Rajdhani',sans-serif;">
<p style="opacity:.5;font-size:11px;margin:0 0 10px;">CSS preview — sample elements below use these styles</p>
<div class="ws-sample-target" style="padding:10px;border:1px dashed rgba(255,255,255,.15);border-radius:6px;margin-bottom:8px;">Sample element</div>
<button>Sample button</button>&nbsp;<input placeholder="Sample input">
</body></html>`;
    }
    // html node: render its markup standalone so it can be visually spot-checked.
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:12px;background:#12182c;color:#dfe4ff;font-family:'Rajdhani',sans-serif;box-sizing:border-box;}*{box-sizing:border-box;}</style></head>
<body>${node.code || ''}</body></html>`;
}

/** Renders the { output, logs, error } result of a JS sandbox run into the output panel. */
function renderJsRunResult(panel, result) {
    const { output, hadOutput, logs, error } = result || {};
    let html = '';

    if (Array.isArray(logs) && logs.length) {
        html += `<div class="run-output-logs">${logs.map(l => `<div class="run-log-line">${escapeHtml(l)}</div>`).join('')}</div>`;
    }

    if (error) {
        html += `<div class="run-output-error">⚠ ${escapeHtml(error)}</div>`;
    } else if (hadOutput) {
        html += `<div class="run-output-value"><span class="run-output-label">run.output →</span><pre>${escapeHtml(output)}</pre></div>`;
    } else if (!logs || !logs.length) {
        html += `<div class="run-output-empty">No output yet. Assign a value to <code>run.output</code> (or <code>console.log(...)</code>) in your code to see results here.</div>`;
    }

    panel.innerHTML = html;
}

/** Click handler for a node's "▶ Run" button. Runs that node's code as an isolated notebook cell. */
async function handleRunNodeCode(event) {
    const button = event.target.closest('.run-node-button');
    if (!button) return;
    const nodeId = button.dataset.id;
    const node = findNodeById(nodeId);
    const outputPanel = document.getElementById(`run-output-${nodeId}`);
    if (!node || !outputPanel) return;

    // Prefer whatever is currently in the open code editor (unsaved edits included).
    const codeTextarea = document.getElementById(`editor-${nodeId}`);
    const liveCode = (codeTextarea && codeTextarea.style.display === 'block') ? codeTextarea.value : (node.code || '');

    outputPanel.style.display = 'block';
    outputPanel.innerHTML = `<div class="run-output-status">▶ Running…</div>`;

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Running';

    try {
        if (node.type === 'html' || node.type === 'css') {
            const doc = buildRunPreviewDoc({ ...node, code: liveCode });
            outputPanel.innerHTML = `
                <div class="run-output-status">Live preview:</div>
                <iframe class="run-output-iframe" sandbox="allow-scripts" srcdoc="${doc.replace(/"/g, '&quot;')}"></iframe>
            `;
        } else {
            // javascript / js-function
            const result = await runJsInSandbox(liveCode);
            renderJsRunResult(outputPanel, result);
        }
    } catch (e) {
        outputPanel.innerHTML = `<div class="run-output-error">⚠ ${escapeHtml(e.message || String(e))}</div>`;
    } finally {
        button.disabled = false;
        button.textContent = originalLabel;
    }
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

    // Refresh nervous system if it's active
    if (document.getElementById('nervous-system')?.classList.contains('active')) {
        refreshNervousSystem(vibeTree, {});
    }

    // Refresh wiki if it's active
    if (document.getElementById('wiki')?.classList.contains('active')) {
        renderWiki();
    }

    // Notify APUI bridge subscribers
    if (window.__vibeBridge?._refreshCallbacks?.length) {
        window.__vibeBridge._refreshCallbacks.forEach(cb => { try { cb(vibeTree); } catch(e) {} });
    }
    // Push full tree to APUI iframe via postMessage (works same-origin and cross-origin)
    try {
        const frame = document.getElementById('apui-frame');
        if (frame?.contentWindow) {
            frame.contentWindow.postMessage({
                type: 'apui-init',
                vibeTree: JSON.parse(JSON.stringify(vibeTree)),
                projectId: currentProjectId,
                pinnedNodes: [..._apuiPinnedNodes]
            }, '*');
        }
    } catch(e) {}
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

function getGeminiModel() {
    if (geminiModelSelect && geminiModelSelect.value === '__custom__') {
        var customInput = document.getElementById('gemini-custom-model-input');
        var customVal = customInput ? customInput.value.trim() : '';
        if (customVal) return customVal;
    }
    return geminiModelSelect ? geminiModelSelect.value : 'gemini-2.5-flash';
}

async function callAI(systemPrompt, userPrompt, forJson = false, streamCallback = null, images = []) {
    if (!geminiApiKey) throw new Error("Gemini API key is not set.");
    
    const components = listComponents();
    let libraryContext = "\n\n--- COMPONENT LIBRARY (REFERENCE ONLY) ---\n";
    libraryContext += "Use these components ONLY if specifically requested (via @id) or if they perfectly match the design requirement. Otherwise, prioritize creating custom, unique designs tailored to the user's prompt.\n";
    components.forEach(comp => {
        libraryContext += `### @${comp.id}\nHTML: ${comp.html}\nCSS: ${comp.css}\nJS: ${comp.javascript}\n---\n`;
    });

    const augmentedSystemPrompt = systemPrompt + libraryContext;
    const model = getGeminiModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    // Build parts array — text first, then any images
    const parts = [{ text: userPrompt }];
    if (Array.isArray(images)) {
        images.forEach(img => {
            // img can be { mimeType, data } (base64) or a raw dataURL string
            if (typeof img === 'string' && img.startsWith('data:')) {
                const [header, data] = img.split(',');
                const mimeType = header.split(':')[1].split(';')[0];
                parts.push({ inlineData: { mimeType, data } });
            } else if (img && img.data) {
                parts.push({ inlineData: { mimeType: img.mimeType || 'image/png', data: img.data } });
            }
        });
    }

    const requestBody = {
        contents: [{ role: "user", parts }],
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

/**
 * Robustly parse a JSON string returned by an AI model.
 * Strips markdown fences, finds the outermost { } or [ ], then parses.
 */
function _parseAIJson(raw) {
    // Fast path
    try { return JSON.parse(raw); } catch(_) {}
    // Strip fences
    let s = raw.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/, '')
        .replace(/\s*```$/, '').trim();
    // Extract outermost object or array
    const oc = s.indexOf('{'), ac = s.indexOf('[');
    let start = -1, endChar = '';
    if (oc !== -1 && (ac === -1 || oc < ac)) { start = oc; endChar = '}'; }
    else if (ac !== -1)                        { start = ac; endChar = ']'; }
    if (start !== -1) {
        const end = s.lastIndexOf(endChar);
        if (end > start) s = s.slice(start, end + 1);
    }
    return JSON.parse(s); // throws if still broken — caller handles
}


async function callGeminiAI(systemPrompt, userPrompt, forJson = false, streamCallback = null, images = []) {
    if (!geminiApiKey) {
        throw new Error("Gemini API key is not set.");
    }

    const model = getGeminiModel();
    const useStreaming = typeof streamCallback === 'function';
    const endpoint = useStreaming 
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${geminiApiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    // Build parts — text first, then images
    const parts = [{ text: userPrompt }];
    if (Array.isArray(images)) {
        images.forEach(img => {
            if (typeof img === 'string' && img.startsWith('data:')) {
                const [header, data] = img.split(',');
                const mimeType = header.split(':')[1].split(';')[0];
                parts.push({ inlineData: { mimeType, data } });
            } else if (img && img.data) {
                parts.push({ inlineData: { mimeType: img.mimeType || 'image/png', data: img.data } });
            }
        });
    }

    const requestBody = {
        contents: [{ role: "user", parts }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
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

/* ═══════════════════════════════════════════════════════════════
   VISION UTILITIES — Screenshot & Image Attachment
   ═══════════════════════════════════════════════════════════════ */

// Pending images for the next AI call (agent or chat)
// Each entry is a dataURL string  
const _pendingImages = { agent: [], chat: [], workshop: [] };

/**
 * Capture the live preview iframe as a PNG dataURL.
 * Uses html2canvas if available, otherwise falls back to a blob URL
 * created from the iframe's srcdoc / src content rendered on a canvas
 * via a foreign-object SVG trick (works same-origin or srcdoc iframes).
 */
/**
 * Capture the LIVE preview iframe as a PNG dataURL.
 *
 * Key insight: website-preview is populated via doc.write() making it same-origin.
 * We load html2canvas into the PARENT window and point it at iDoc.body directly —
 * this captures the actual live rendered state including any JS-driven navigation.
 * No offscreen iframe needed (that approach always captured static initial HTML).
 */
async function capturePreviewScreenshot() {
    const liveIframe = document.getElementById('website-preview');
    if (!liveIframe) throw new Error('Preview iframe not found.');

    // Switch to preview tab so the iframe is visible and laid out
    const previewTabBtn = document.querySelector('.tab-button[data-tab="preview"]')
                       || document.querySelector('[onclick*="preview"]');
    if (previewTabBtn) previewTabBtn.click();
    await new Promise(r => setTimeout(r, 300));

    const iDoc = liveIframe.contentDocument || liveIframe.contentWindow?.document;
    if (!iDoc || !iDoc.body) throw new Error('Preview iframe not ready.');

    const W = liveIframe.offsetWidth  || liveIframe.clientWidth  || 900;
    const H = liveIframe.offsetHeight || liveIframe.clientHeight || 600;

    // ── Strategy 1: html2canvas in PARENT window targeting live iframe body ──
    try {
        await _ensureHtml2CanvasInParent();
        const canvas = await window.html2canvas(iDoc.body, {
            useCORS:         true,
            allowTaint:      true,
            scale:           0.75,
            logging:         false,
            backgroundColor: '#ffffff',
            width:           W,
            height:          H,
            windowWidth:     iDoc.documentElement.scrollWidth  || W,
            windowHeight:    iDoc.documentElement.scrollHeight || H,
        });
        return canvas.toDataURL('image/png');
    } catch(e) {
        console.warn('[Screenshot] html2canvas parent strategy failed:', e.message || e);
    }

    // ── Strategy 2: inject html2canvas INTO the live iframe (same-origin) ──
    try {
        return await _captureViaInjection(liveIframe, W, H);
    } catch(e) {
        console.warn('[Screenshot] injection strategy failed:', e.message || e);
    }

    // ── Strategy 3: SVG foreignObject ──
    try {
        return await _svgScreenshotFallback(liveIframe);
    } catch(e) {
        console.warn('[Screenshot] SVG fallback failed:', e.message || e);
    }

    return _blankCanvasFallback(liveIframe);
}

/** Load html2canvas into the parent window once */
function _ensureHtml2CanvasInParent() {
    if (window.html2canvas) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload  = resolve;
        s.onerror = () => reject(new Error('Failed to load html2canvas'));
        document.head.appendChild(s);
    });
}

/**
 * Inject html2canvas directly into the live same-origin iframe and call it there.
 * Works because doc.write() iframes are same-origin — script tags CAN be appended
 * after doc.close() and will execute; we just need to wait for them.
 */
function _captureViaInjection(iframe, W, H) {
    return new Promise((resolve, reject) => {
        const iWin = iframe.contentWindow;
        const iDoc = iframe.contentDocument || iWin.document;
        if (!iDoc || !iDoc.head) return reject(new Error('Cannot access iframe document'));

        if (iWin.html2canvas) {
            _runHtml2CanvasInIframe(iWin, iDoc, W, H, resolve, reject);
            return;
        }

        const s = iDoc.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload  = () => _runHtml2CanvasInIframe(iWin, iDoc, W, H, resolve, reject);
        s.onerror = () => reject(new Error('html2canvas failed to load in iframe'));
        iDoc.head.appendChild(s);
    });
}

function _runHtml2CanvasInIframe(iWin, iDoc, W, H, resolve, reject) {
    iWin.html2canvas(iDoc.body, {
        useCORS: true, allowTaint: true, scale: 0.75,
        logging: false, backgroundColor: '#ffffff',
        width: W, height: H,
    }).then(canvas => resolve(canvas.toDataURL('image/png')))
      .catch(reject);
}

async function _svgScreenshotFallback(iframe) {
    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) throw new Error('Cannot access preview document.');

    const W = iframe.offsetWidth  || 800;
    const H = iframe.offsetHeight || 600;

    const html = iDoc.documentElement.outerHTML;
    const svgData = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>
        <foreignObject width='100%' height='100%'>
            <div xmlns='http://www.w3.org/1999/xhtml'>${html}</div>
        </foreignObject>
    </svg>`;

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width  = W;
                canvas.height = H;
                canvas.getContext('2d').drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/png'));
            } catch(drawErr) {
                URL.revokeObjectURL(url);
                reject(new Error('Canvas draw failed: ' + drawErr.message));
            }
        };
        img.onerror = (ev) => {
            URL.revokeObjectURL(url);
            reject(new Error('SVG image load failed. Event: ' + (ev && ev.type)));
        };
        img.src = url;
    });
}

function _blankCanvasFallback(iframe) {
    const W = (iframe && iframe.offsetWidth)  || 800;
    const H = (iframe && iframe.offsetHeight) || 600;
    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(135,206,235,0.6)';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[ Preview Screenshot — open Preview tab first ]', W / 2, H / 2 - 10);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(135,206,235,0.35)';
    ctx.fillText('Or attach an image manually below', W / 2, H / 2 + 18);
    return canvas.toDataURL('image/png');
}

/** Add a dataURL image to the pending queue for a given context (agent | chat) */
function addPendingImage(context, dataURL) {
    if (!_pendingImages[context]) _pendingImages[context] = [];
    _pendingImages[context].push(dataURL);
    _refreshImagePreviews(context);
}

/** Drain and return the pending images for a context, then clear */
function consumePendingImages(context) {
    const imgs = (_pendingImages[context] || []).slice();
    _pendingImages[context] = [];
    _refreshImagePreviews(context);
    return imgs;
}

/** Re-render the thumbnail strip for a context */
function _refreshImagePreviews(context) {
    const container = document.getElementById(`${context}-image-previews`);
    if (!container) return;
    container.innerHTML = '';
    (_pendingImages[context] || []).forEach((dataURL, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:inline-block;margin:0 4px 4px 0;';
        const img = document.createElement('img');
        img.src = dataURL;
        img.style.cssText = 'width:52px;height:52px;object-fit:cover;border-radius:4px;border:1px solid rgba(65,105,225,0.5);vertical-align:top;';
        const del = document.createElement('button');
        del.textContent = '×';
        del.title = 'Remove image';
        del.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#c62828;color:#fff;border:none;border-radius:50%;width:16px;height:16px;font-size:10px;line-height:16px;text-align:center;cursor:pointer;padding:0;';
        del.onclick = () => { _pendingImages[context].splice(i, 1); _refreshImagePreviews(context); };
        wrap.appendChild(img);
        wrap.appendChild(del);
        container.appendChild(wrap);
    });
    container.style.display = (_pendingImages[context] || []).length ? 'block' : 'none';
}

/** Handle a FileList from an <input type=file> and add images to pending */
function handleImageFileInput(context, files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = e => addPendingImage(context, e.target.result);
        reader.readAsDataURL(file);
    });
}

/** One-click: screenshot preview → add to agent queue, then run agent */
async function screenshotAndEdit(context = 'agent') {
    const btn = document.getElementById(`${context}-screenshot-btn`);
    if (btn) { btn.disabled = true; btn.textContent = '📷 Capturing…'; }
    try {
        const dataURL = await capturePreviewScreenshot();
        addPendingImage(context, dataURL);
        console.log(`Screenshot captured for ${context}.`);
        if (btn) { btn.textContent = '✓ Captured'; setTimeout(() => { btn.disabled = false; btn.innerHTML = '📷 Screenshot'; }, 1400); }
    } catch (e) {
        console.error('Screenshot failed:', e);
        if (btn) { btn.textContent = '✗ Failed'; setTimeout(() => { btn.disabled = false; btn.innerHTML = '📷 Screenshot'; }, 2000); }
    }
}


/**
 * Capture the Workshop preview iframe (ws-preview-frame) as a PNG dataURL.
 * Mirrors capturePreviewScreenshot but targets the workshop iframe.
 */
async function captureWorkshopPreviewScreenshot() {
    const wsIframe = document.getElementById('ws-preview-frame');
    if (!wsIframe) throw new Error('Workshop preview iframe not found.');

    const iDoc = wsIframe.contentDocument || wsIframe.contentWindow?.document;
    if (!iDoc || !iDoc.body) throw new Error('Workshop preview iframe not ready.');

    const W = wsIframe.offsetWidth  || wsIframe.clientWidth  || 600;
    const H = wsIframe.offsetHeight || wsIframe.clientHeight || 240;

    // Strategy 1: html2canvas in parent targeting the workshop iframe body
    try {
        await _ensureHtml2CanvasInParent();
        const canvas = await window.html2canvas(iDoc.body, {
            useCORS: true, allowTaint: true, scale: 0.75,
            logging: false, backgroundColor: '#ffffff', width: W, height: H,
            windowWidth:  iDoc.documentElement.scrollWidth  || W,
            windowHeight: iDoc.documentElement.scrollHeight || H,
        });
        return canvas.toDataURL('image/png');
    } catch(e) {
        console.warn('[WS Screenshot] html2canvas failed:', e.message || e);
    }

    // Strategy 2: inject html2canvas into the workshop iframe
    try {
        return await _captureViaInjection(wsIframe, W, H);
    } catch(e) {
        console.warn('[WS Screenshot] injection failed:', e.message || e);
    }

    // Strategy 3: SVG foreignObject
    try {
        return await _svgScreenshotFallback(wsIframe);
    } catch(e) {
        console.warn('[WS Screenshot] SVG fallback failed:', e.message || e);
    }

    return _blankCanvasFallback(wsIframe);
}

/** One-click: screenshot the workshop preview → add to workshop pending images */
async function screenshotAndEditWorkshop() {
    const btn = document.getElementById('ws-screenshot-btn');
    if (btn) { btn.disabled = true; btn.textContent = '📷 Capturing…'; }
    try {
        const dataURL = await captureWorkshopPreviewScreenshot();
        addPendingImage('workshop', dataURL);
        if (btn) { btn.textContent = '✓ Captured'; setTimeout(() => { btn.disabled = false; btn.innerHTML = '📷 Screenshot'; }, 1400); }
    } catch(e) {
        console.error('WS Screenshot failed:', e);
        if (btn) { btn.textContent = '✗ Failed'; setTimeout(() => { btn.disabled = false; btn.innerHTML = '📷 Screenshot'; }, 2000); }
    }
}

/**
 * Parses a raw AI text response into a JSON array of "vibe nodes".
 * Shared by the Design Agent and the Backend/Logic Agent so both stages
 * of the pipeline handle fenced code blocks / stray text the same way.
 */
function parseVibeNodeArrayResponse(rawResponse, agentLabel = 'agent') {
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

        const nodesArray = JSON.parse(jsonResponse);
        if (!Array.isArray(nodesArray)) {
            throw new Error(`AI (${agentLabel}) did not return a valid JSON array.`);
        }
        console.log(`Successfully parsed response from ${agentLabel}.`);

        return nodesArray;
    } catch (e) {
        console.error(`Failed to parse JSON from ${agentLabel}:`, rawResponse);
        throw new Error(`AI (${agentLabel}) returned invalid JSON. Original response logged in console. Error: ${e.message}`);
    }
}

/**
 * System prompt for the Design Agent. This agent runs FIRST and is
 * responsible only for the visual structure (HTML) and styling (CSS) of
 * the app — no JavaScript / logic. The Backend/Logic Agent runs afterward
 * and wires up interactivity on top of this approved design.
 */
function getDesignAgentSystemPrompt() {
    return `# System Prompt: Mobile App UI/UX Generation Framework
You are an expert mobile UI/UX design assistant and front-end architect. Your task is to design or generate code for a mobile application interface based on the user's specific app concept.
To ensure the generated interface is modern, scalable, and highly intuitive, you must structure the layout, aesthetics, and user flow around the two core design paradigms and the strict structural execution rules detailed below.
## 1. Core Visual Archetypes (Choose One or Blend)
Depending on the app category requested by the user, apply or blend these two structural paradigms:
### Archetype A: High-Contrast, Utility & Transactional (Best for FinTech, Booking, E-commerce, Logistics)
 * **Color Palette:** Clean white or light-gray canvas, utilizing a single, highly saturated, high-contrast primary color (e.g., vivid blue, emerald green) exclusively for key action points.
 * **Visual Hierarchy:** High typographic contrast. Headers use heavy, bold sans-serif fonts to command instant attention, while body metadata is rendered in lighter, scannable weights.
 * **Interface Structure:**
   * **Immersive Hero Section:** Large media components or data visualization modules at the top, transitioning smoothly into a card-based detail layout below.
   * **Segmented Workspaces:** Horizontal scrolling filter tabs to switch contexts rapidly without reloading the page.
   * **Fixed Utilities:** Sticky, persistent action strips at the bottom of the screen housing primary metrics and high-contrast call-to-action (CTA) buttons.
### Archetype B: Content-Driven, Community & Engagement (Best for Social, Media, Lifestyle, Productivity)
 * **Color Palette:** Soft, welcoming pastel tones, muted gradient backdrops, or clean monochrome dark/light themes. Uses energetic accent colors (like gold, coral, or neon highlights) strictly around user profiles, notifications, or interaction states.
 * **Visual Hierarchy:** Soft, rounded, friendly sans-serif headlines paired with hyper-efficient, compact body text to maximize data density without causing clutter.
 * **Interface Structure:**
   * **Ephemeral Content Trackers:** A top-mounted, horizontally scrollable capsule or circle carousel dedicated to chronological or quick-glance status updates.
   * **Modular Feed Blocks:** Vertical stacks of distinct, rounded content containers (cards) separating individual entries. Each block encapsulates user metadata, core asset content (images/charts/text), and an identical cluster of engagement icons (save, share, act).
   * **Grid Assemblies:** Profile or inventory screens that cleanly divide content into tight, multi-column media grids with explicit tab filters.
## 2. Global Component Standards
No matter the app type, synthesize every screen using these modular building blocks:
 * **The Global Navigation Array:** A persistent, clean bottom navigation tab bar featuring 3 to 5 minimal wireframe icons indicating the core operational pillars of the app.
 * **The Global Form Factor:** Input fields must use explicit placeholder text, clear bounding boxes (outlined or softly shaded), and display clear helper text or inline badges for user verification.
 * **The Content Card:** Group related pieces of information into a single rounded container (8px - 16px corner radius) with a subtle drop shadow or fine border to chunk information visually.
## 3. Strict UI Execution Rules
When generating screens, workflows, or front-end code, you must strictly adhere to these 4 UX guardrails:
 * **Rule 1: Optimize for the "Thumb-Zone".** Anchor primary interactive targets—such as submission buttons, checkout triggers, navigation bars, and primary menus—to the bottom third of the display interface to ensure effortless one-handed ergonomics.
 * **Rule 2: Enforce Sticky, High-Contrast Call-to-Actions (CTAs).** A user should never have to search for the "next step." Core action buttons must freeze on scroll where appropriate, utilizing a striking fill color that separates them immediately from surrounding content.
 * **Rule 3: Establish a Flawless Typographic Hierarchy.** Apply a strict scale: Large/Bold for primary titles, Medium/Regular for operational subtitles and metrics, and Small/Muted Gray for non-critical secondary metadata, timestamps, or helper strings.
 * **Rule 4: Prevent Information Density Overload.** Never present a raw, unformatted wall of data. Fragment dense user data, product catalogs, or social posts into modular card blocks. Ensure generous white space between blocks to give elements room to breathe.

## 4. Your Deliverable in This System
You are the **Design Agent** in a two-agent pipeline. A separate **Backend/Logic Agent** will run after you and add all JavaScript interactivity — you are NOT responsible for logic, and must NOT write any <script> tags or JavaScript.

**SEGMENTATION RULES — MANDATORY:**
1.  **One node per concern.** Each logical section/screen of the UI gets its OWN html node. Never bundle multiple sections into one giant html node. For example: a screen with a header, a content feed, and a bottom nav MUST produce separate html nodes: screen-header, content-feed, bottom-nav.
2.  **Every html node gets its own css node.** Create a dedicated css node (e.g., "hero-styles") for each html node you create. NEVER use inline styles. NEVER bundle all CSS into one node.
3.  **No JavaScript.** Do not create javascript or js-function nodes, and do not embed <script> tags or inline event handlers (onclick, etc.) — only markup and styling. Where interactivity will later be needed, mark the element with a clear, semantic id/class/data-attribute so the Backend Agent can hook into it (e.g., id="submit-order-btn", data-role="like-button").
4.  **Descriptive descriptions are REQUIRED.** Every node MUST have a clear, specific description (2-3 sentences) explaining: what it does, what it looks like, and which archetype/rules it follows.
5.  **Unique, semantic IDs.** Use descriptive kebab-case IDs like "hero-section", "nav-styles", "bottom-nav-bar" — not generic names like "section-1".
6.  **Content:** Use realistic text and images (via Pollinations AI), not Lorem Ipsum.
7.  **Responsive:** Use Flexbox/Grid and media queries; design mobile-first per the framework above even for non-mobile apps.

**TASK:** Generate a valid JSON array of "vibe nodes" (html and css types ONLY) that represent the children of a given container. The output MUST be a JSON array [] and nothing else.

${getImageGenerationInstructions()}

**JSON SCHEMA for the array:**
[
  {
    "id": "unique-section-id",
    "type": "html",
    "description": "The HTML structure, which archetype it follows, and any hooks left for the Backend Agent.",
    "code": "<section id='unique-section-id' class='modern-section'>...</section>",
    "selector": "#parent-id",
    "position": "beforeend"
  },
  {
    "id": "section-styles",
    "type": "css",
    "description": "Styles for the section.",
    "code": "#unique-section-id { ... } .modern-section { ... }"
  }
]
`;
}

/**
 * System prompt for the Backend/Logic Agent. This agent runs SECOND,
 * after the Design Agent has produced an approved UI, and is responsible
 * only for making that UI functional (state, events, data, API calls).
 */
function getBackendLogicAgentSystemPrompt() {
    return `You are an expert backend/frontend logic engineer. A Design Agent has already produced the visual structure (HTML) and styling (CSS) for this app and it has been APPROVED. Your ONLY job is to take that approved design and make it fully functional by adding the JavaScript logic layer — you do not redesign the UI.

**RULES — MANDATORY:**
1.  **Preserve the design.** Return every provided html and css node as-is. You may make small, surgical edits to the html (e.g. adding an id, class, or data-attribute) ONLY when required so your JavaScript can hook into an element. Never redesign layout, colors, typography, or copy.
2.  **Add interactivity as separate nodes.** Any event listeners, state management, animations, API calls, or logic goes into new "javascript" or "js-function" nodes — never inline <script> tags inside html nodes, never inline onclick handlers.
3.  **One concern per JS node.** Give each JS node a clear, descriptive kebab-case id (e.g. "cart-add-item-logic", "form-validation-logic", "like-button-logic").
4.  **Descriptive descriptions are REQUIRED.** Every new node needs a clear, specific description (2-3 sentences): what it does, what it hooks into, and any key behavior. These descriptions power the Code Wiki.
5.  **Return everything.** Your output must include ALL of the original design nodes (html/css, unmodified except for allowed surgical hooks) PLUS your new javascript/js-function nodes, as a single flat JSON array.

**TASK:** Generate a valid JSON array of "vibe nodes" — the finished, fully-functional children of the given parent container. The output MUST be a JSON array [] and nothing else.

${getVibeDbInstructionsForAI()}

**JSON SCHEMA for the array:**
[
  { "id": "unique-section-id", "type": "html", "description": "...", "code": "<section id='unique-section-id'>...</section>", "selector": "#parent-id", "position": "beforeend" },
  { "id": "section-styles", "type": "css", "description": "...", "code": "#unique-section-id { ... }" },
  { "id": "section-logic", "type": "js-function", "description": "...", "code": "function initSection() { ... }" }
]
`;
}

/** STAGE 1 of the pipeline — designs the UI only (html/css, no logic). */
async function runDesignAgent(parentNode, streamCallback = null, refImages = []) {
    console.log(`[Design Agent] Designing UI for parent: ${parentNode.id}`);
    if (typeof streamCallback === 'function') streamCallback('🎨 Design Agent is laying out the UI...');

    const systemPrompt = getDesignAgentSystemPrompt();
    const userPrompt = `Design the UI for the following container. Pick the best-fitting archetype (or a blend of both) for the app/section described, and lay it out per the framework rules.
{
    "parentId": "${parentNode.id}",
    "appDescription": "${(parentNode.description || '').replace(/`/g, "'")}"
}`;

    const rawResponse = await callAI(systemPrompt, userPrompt, true, streamCallback, refImages);
    return parseVibeNodeArrayResponse(rawResponse, 'Design Agent');
}

/** STAGE 2 of the pipeline — adds JS logic on top of the approved design. */
async function runBackendLogicAgent(parentNode, designNodes, streamCallback = null, refImages = []) {
    console.log(`[Backend Agent] Wiring up logic for parent: ${parentNode.id}`);
    if (typeof streamCallback === 'function') streamCallback('🛠️ Backend Agent is wiring up the logic...');

    const systemPrompt = getBackendLogicAgentSystemPrompt();
    const userPrompt = `Add the JavaScript logic layer to the following approved UI design.
{
    "parentId": "${parentNode.id}",
    "appDescription": "${(parentNode.description || '').replace(/`/g, "'")}"
}

Approved Design Nodes (HTML/CSS) — JSON:
\`\`\`json
${JSON.stringify(designNodes, null, 2)}
\`\`\``;

    const rawResponse = await callAI(systemPrompt, userPrompt, true, streamCallback, refImages);
    return parseVibeNodeArrayResponse(rawResponse, 'Backend Agent');
}

/**
 * Generates the complete children for a container using a two-agent pipeline:
 * the Design Agent designs the UI (HTML/CSS) first, then the Backend/Logic
 * Agent adds the JavaScript on top of that approved design. Set
 * `useDesignAgent = false` to fall back to a single combined generation pass.
 */
async function generateCompleteSubtree(parentNode, streamCallback = null, refImages = [], useDesignAgent = true) {
    console.log(`Generating subtree for parent: ${parentNode.id}`);

    if (!useDesignAgent) {
        // Legacy single-pass path: one agent produces HTML/CSS/JS together.
        const systemPrompt = `You are an expert UI/UX designer and frontend architect with a focus on creating beautifully structured, self-documenting code.

    **YOUR GOAL:** Create a visually stunning, modern website component hierarchy that is also easy to understand through the Code Wiki.

    **SEGMENTATION RULES — MANDATORY:**
    1.  **One node per concern.** Each logical section of the UI gets its OWN html node.
    2.  **Every html node gets its own css node.** NEVER use inline styles.
    3.  **JavaScript gets its own node.** Never embedded in an html node's <script> tag.
    4.  **Descriptive descriptions are REQUIRED.**
    5.  **Unique, semantic IDs.**

    **TASK:** Generate a valid JSON array of "vibe nodes" that represent the children of a given container. The output MUST be a JSON array [] and nothing else.

${getVibeDbInstructionsForAI()}
${getImageGenerationInstructions()}
`;
        const userPrompt = `Generate the child components for the following parent container:
{
    "parentId": "${parentNode.id}",
    "newDescription": "${parentNode.description}"
}`;
        const rawResponse = await callAI(systemPrompt, userPrompt, true, streamCallback, refImages);
        return parseVibeNodeArrayResponse(rawResponse, 'Combined Agent');
    }

    const designNodes = await runDesignAgent(parentNode, streamCallback, refImages);
    const finalNodes = await runBackendLogicAgent(parentNode, designNodes, streamCallback, refImages);
    return finalNodes;
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

    // 1. Extract ALL <style> tags
    const styleTags = Array.from(doc.querySelectorAll('style'));
    styleTags.forEach((styleTag, index) => {
        // Only extract if it's a direct child of head or body (prevents breaking scoped styles inside components)
        // FIX: Allow extraction if it's top-level, otherwise keep it inside HTML.
        // For simplicity in Vibe, we usually extract all styles to CSS tab, 
        // but if the user complains about "changing code", we should be careful.
        // Let's stick to standard Vibe behavior: Extract styles.
        if (styleTag.textContent.trim()) {
            cssNodes.push({
                id: `page-styles-${index + 1}`,
                type: 'css',
                description: 'CSS styles extracted from the document.',
                code: styleTag.textContent.trim()
            });
        }
        styleTag.remove(); // Remove from DOM
    });

    // 2. Extract Script Tags
    const scriptTags = Array.from(doc.querySelectorAll('script'));
    scriptTags.forEach((scriptTag, index) => {
        // Ignore the injected vibe proxy script
        if (scriptTag.textContent.includes('Vibe Database Connector') || scriptTag.textContent.includes('__vibe-inspect-highlight-hover')) {
            scriptTag.remove();
            return;
        }

        // FIX: Only extract script tags that are direct children of body or head.
        // This preserves logic for scripts embedded deeply inside components.
        const isTopLevel = (scriptTag.parentNode === doc.body || scriptTag.parentNode === doc.head);
        
        // Also respect attributes like type="module" or src. 
        // If it has attributes but no src, and it's top level, we might want to extract it but keep attributes?
        // Current Vibe JS nodes are just text. 
        // Strategy: Only extract "simple" inline scripts at top level.
        const isSimpleInline = !scriptTag.src && scriptTag.attributes.length === 0;

        if (isTopLevel && isSimpleInline && scriptTag.textContent.trim()) {
            jsNodes.push({
                id: `script-${index + 1}`,
                type: 'javascript',
                description: 'JavaScript extracted from the document.',
                code: scriptTag.textContent.trim()
            });
            scriptTag.remove();
        } 
        // Else: leave it in the DOM. It will be captured by the HTML node.
    });

    // 3. Extract Head content
    const headContent = [];
    
    // Preserve html/body attributes
    if (doc.documentElement.attributes.length > 0) {
        const htmlAttrsObj = {};
        Array.from(doc.documentElement.attributes).forEach(attr => {
            htmlAttrsObj[attr.name] = attr.value;
        });
        headContent.push(`<script>
            document.addEventListener('DOMContentLoaded', () => {
                const attrs = ${JSON.stringify(htmlAttrsObj)};
                for (const [key, value] of Object.entries(attrs)) {
                    document.documentElement.setAttribute(key, value);
                }
            });
        <\/script>`);
    }

    if (doc.body.attributes.length > 0) {
        const bodyAttrsObj = {};
        Array.from(doc.body.attributes).forEach(attr => {
            bodyAttrsObj[attr.name] = attr.value;
        });
        headContent.push(`<script>
            document.addEventListener('DOMContentLoaded', () => {
                const attrs = ${JSON.stringify(bodyAttrsObj)};
                for (const [key, value] of Object.entries(attrs)) {
                    document.body.setAttribute(key, value);
                }
            });
        <\/script>`);
    }

    doc.head.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            headContent.push(child.outerHTML);
        }
    });

    headNode = {
        id: 'head-content',
        type: 'head',
        description: 'Contains metadata for the page like title, meta, and link tags.',
        code: headContent.join('\n')
    };

    // 4. Extract Body children (Handling Text Nodes now)
    // FIX: Use childNodes to capture loose text that isn't wrapped in elements.
    const bodyChildren = Array.from(doc.body.childNodes);
    let lastElementId = null;

    bodyChildren.forEach((node, index) => {
        // Handle Elements
        if (node.nodeType === Node.ELEMENT_NODE) {
            let elementId = node.id;
            if (!elementId) {
                elementId = `${node.tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-section-${index}`;
                node.id = elementId;
            }

            const htmlNode = {
                id: `html-${elementId}`,
                type: 'html',
                description: `The <${node.tagName.toLowerCase()}> element with ID #${elementId}.`,
                code: node.outerHTML,
                selector: lastElementId ? `#${lastElementId}` : '#whole-page',
                position: lastElementId ? 'afterend' : 'beforeend'
            };
            htmlNodes.push(htmlNode);
            lastElementId = elementId;
        } 
        // Handle Loose Text (e.g. "Copyright 2023" floating in body)
        else if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent.trim();
            if (textContent) {
                const textId = `text-content-${index}`;
                htmlNodes.push({
                    id: textId,
                    type: 'html',
                    description: 'Text content.',
                    code: node.textContent, // Preserve whitespace if needed, or trimmed? usually raw text.
                    selector: lastElementId ? `#${lastElementId}` : '#whole-page',
                    position: lastElementId ? 'afterend' : 'beforeend'
                });
                lastElementId = textId; // It's not a DOM ID, but we track position logically
            }
        }
    });

    vibeTree.children = [headNode, ...htmlNodes, ...cssNodes, ...jsNodes];
    
    console.log("Client-side parsing complete. Generated Vibe Tree:", vibeTree);
    return vibeTree;
}

async function decomposeCodeIntoVibeTree(fullCode, forceClientSide = false) {
    console.log("Starting code decomposition process...");
    
    // Fallback to client side parsing immediately if it's a raw upload, forced, or very large
    if (forceClientSide || fullCode.length > 30000) {
        console.warn("Using reliable client-side parser (forced or large file size).");
        return parseHtmlToVibeTree(fullCode);
    }
    
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
        // Mark as `true` to force deterministic client-side extraction to guarantee HTML retention.
        const newVibeTree = await decomposeCodeIntoVibeTree(fullCode, true);
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

async function handleUpdateTreeFromCode(codeOverride = null) {
    // Determine source: Override (from merger) or Editor (manual)
    const fullCode = (typeof codeOverride === 'string') ? codeOverride : fullCodeEditor.value;

    if (!fullCode.trim()) {
        alert("The code is empty. There is nothing to process.");
        return;
    }

    // Handle Raw HTML Container case
    if (vibeTree && vibeTree.type === 'raw-html-container') {
        vibeTree.code = fullCode;
        recordHistory("Update raw HTML code");
        applyVibes(); 
        autoSaveProject();
        if (!codeOverride) {
            alert("Raw HTML preview has been updated. To enable the Vibe Editor, click 'Process into Vibe Tree'.");
        } else {
            console.log("Raw HTML updated via Merger tool.");
        }
        return; 
    }

    // Standard Vibe Tree Processing
    const button = updateTreeFromCodeButton;
    const originalButtonHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = 'Processing... <div class="loading-spinner"></div>';
    
    try {
        recordHistory('Process full code (replace tree)');
        // Safely force client-side parsing to retain explicit file formats without AI intervention errors
        const newVibeTree = await decomposeCodeIntoVibeTree(fullCode, true);
        vibeTree = newVibeTree;
        refreshAllUI();
        console.log("Update from code complete. UI refreshed.");
        switchToTab('preview');
        historyState.lastSnapshotSerialized = serializeTree(vibeTree);
        autoSaveProject();
        if (codeOverride) {
            alert("Code merged and project updated successfully!");
        }
    } catch (error) {
        console.error("Failed to update vibes from full code:", error);
        alert(`An error occurred during processing: ${error.message}. Check the console for details.`);
    } finally {
        button.disabled = false;
        button.innerHTML = originalButtonHtml;
    }
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
            updateProjectActionButtonStates();

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
        let serialized;
        if (err instanceof Error) {
            serialized = { message: err.message, stack: err.stack, name: err.name, __isError: true };
        } else if (err && typeof err === 'object') {
            serialized = { message: err.message || String(err), stack: err.stack, name: err.name || 'Error', __isError: true };
        } else {
            serialized = { message: String(err), name: 'Error', __isError: true };
        }
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


// AbortController for editorContainer delegated listeners — replaced on every addEventListeners() call
// to prevent duplicate handlers accumulating across refreshAllUI() cycles.
let editorListenerController = null;

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
    document.querySelectorAll('.run-node-button').forEach(button => {
        button.addEventListener('click', handleRunNodeCode);
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
        // Abort (remove) any previously registered editorContainer listeners before adding new ones.
        // Without this, every refreshAllUI() call stacks an extra copy of handleControlChange,
        // causing node edits to fire multiple times with stale/conflicting values.
        if (editorListenerController) {
            editorListenerController.abort();
        }
        editorListenerController = new AbortController();
        const { signal } = editorListenerController;

        editorContainer.addEventListener('input', handleControlChange, { signal });
        editorContainer.addEventListener('change', handleControlChange, { signal });
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
1.  **Designer:** Create visually stunning, modern designs (Flexbox/Grid, responsive, ample whitespace).
2.  **Implementer:** Convert natural language into specific JSON updates.

**CRITICAL RULES FOR EDITING:**
1.  **CSS Consistency:** If you change HTML IDs or Classes, you MUST update the corresponding CSS.
2.  **Formatting:** When providing code, ensure it is properly indented and formatted.
3.  **Completeness:** When updating a node (actionType: "update"), you MUST return the **FULL, COMPLETE CODE** for that node. Do not return diffs or partial snippets.
4.  **Separation:** ALWAYS create dedicated 'css' nodes for styling — never inline styles, never CSS bundled inside html nodes. Each logical section gets its own css node (e.g., 'hero-styles', 'nav-styles').
5.  **Preserve Logic:** Do not remove existing JavaScript functions or logic unless explicitly asked. If updating JS, return the full code.
6.  **Segmentation:** When CREATING new nodes, always split them by concern. A new UI section = one html node + one css node (+ one js-function node if interactive). Never bundle multiple sections into one node.
7.  **Meaningful descriptions:** Every node MUST have a clear 2–3 sentence description explaining its purpose, appearance, and any interactions. These power the Code Wiki and AI context.

**OUTPUT FORMAT:**
Return ONLY a single, valid JSON object:
{
  "plan": "Briefly explain exactly what you are changing (e.g., 'Updating hero HTML and adding new CSS for the gradient background').",
  "actions": [
    {
      "actionType": "create" | "update",
      "nodeId": "id-of-node-to-act-on",
      "parentId": "parent-id-if-create",
      "newNode": {
         "id": "unique-kebab-id",
         "type": "html" | "css" | "javascript" | "js-function",
         "description": "2-3 sentence description of what this node does and looks like.",
         "code": "FULL VALID CODE HERE",
         "selector": "#prev-id", 
         "position": "afterend"
      },
      "newDescription": "Updated description if updating",
      "newCode": "FULL VALID CODE HERE if updating"
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
        // Handle both legacy string tasks and new {prompt, images} objects
        const taskText  = typeof task === 'string' ? task : task.prompt;
        const taskImgs  = typeof task === 'object' ? (task.images || []) : [];
        const imgBadge  = taskImgs.length ? `<span style="font-size:0.7rem;background:rgba(65,105,225,0.25);border:1px solid rgba(65,105,225,0.4);border-radius:3px;padding:1px 5px;margin-left:6px;color:#87CEEB;">📷 ×${taskImgs.length}</span>` : '';
        li.innerHTML = `
            <span>${taskText}${imgBadge}</span>
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
                // Log to Jarvis change log for learning
                if (window.jrvLogChange && currentProjectId && currentAgentTaskContext) {
                    window.jrvLogChange(currentProjectId, 'agent-task', (currentAgentTaskContext.task || '').slice(0, 200));
                }
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

    // Drain any attached images and bundle with the task
    const images = consumePendingImages('agent');
    taskQueue.push({ prompt: userPrompt, images });
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

    const currentTaskEntry = taskQueue[0];
    // Support both legacy string tasks and new {prompt, images} objects
    const currentTask   = typeof currentTaskEntry === 'string' ? currentTaskEntry : currentTaskEntry.prompt;
    const currentImages = typeof currentTaskEntry === 'object' ? (currentTaskEntry.images || []) : [];
    
    if (!currentAgentTaskContext || !currentAgentTaskContext.includes(currentTask)) {
        currentAgentTaskContext = currentTask;
    }

    const progressText = `Task ${taskQueue.length - taskQueue.length + 1} of ${taskQueue.length}`;
    showGlobalAgentLoader('Agent is processing queue...', progressText);
    const imageNote = currentImages.length ? ` <em>(+${currentImages.length} image${currentImages.length > 1 ? 's' : ''})</em>` : '';
    logToAgent(`---<br><strong>Starting Task (${taskQueue.length} remaining):</strong> ${currentTask}${imageNote}`, 'plan');

    try {
        await executeSingleTask(currentAgentTaskContext, currentImages);
        
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

async function executeSingleTask(promptContext, images = []) {
    showAgentSpinner();
    try {
        const systemPrompt = getAgentSystemPrompt();
        const fullTreeString = JSON.stringify(vibeTree, null, 2);
        const fullCurrentCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);
        
        const imageNote = images.length
            ? `\n\nThe user has also provided ${images.length} image(s) showing the current visual state of the project. Use these visuals to inform your edits.`
            : '';
        const userPrompt = `User Request History:\n"${promptContext}"${imageNote}\n\nFull Vibe Tree:\n\`\`\`json\n${fullTreeString}\n\`\`\`\n\nFull Generated Code:\n\`\`\`html\n${fullCurrentCode}\n\`\`\``;

        const rawResponse = await callAI(systemPrompt, userPrompt, true, null, images);
        
        // Robustly clean and parse the JSON response
        let agentDecision;
        try {
            agentDecision = JSON.parse(rawResponse);
        } catch(parseErr) {
            // Strip markdown fences then retry
            let cleaned = rawResponse.trim()
                .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
                .replace(/\s*```$/, '').trim();
            // Find the first { and last } to extract just the JSON object
            const start = cleaned.indexOf('{');
            const end   = cleaned.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                cleaned = cleaned.slice(start, end + 1);
            }
            try {
                agentDecision = JSON.parse(cleaned);
            } catch(e2) {
                // Last resort: ask model what it meant
                console.error('JSON parse failed even after cleaning. Raw:', rawResponse.slice(0, 300));
                throw new Error('Agent returned invalid JSON. Try again or simplify your request.');
            }
        }
        
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
                if (newCode !== undefined && newCode !== null) {
                    nodeToUpdate.code = String(newCode); 
                }
            } else {
                agentLogger(`Warning: Agent wanted to update non-existent node \`${nodeId}\`, skipping.`, 'warn');
            }
        } else if (action.actionType === 'create') {
            const { parentId, newNode } = action;
            const parentNode = findNodeById(parentId);
            if (parentNode && (parentNode.type === 'container' || parentNode.type === 'html')) {
                if (!newNode || !newNode.id || findNodeById(newNode.id)) {
                     // Auto-fix ID collision
                     if(newNode && newNode.id) newNode.id = newNode.id + '-' + Date.now();
                     else {
                        agentLogger(`Warning: Invalid node creation skipped.`, 'warn');
                        continue;
                     }
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

    // Push changed nodes to APUI so its canvas reflects the agent's edits instantly.
    // We send apui-node-updates (partial) so APUI doesn't rebuild the whole canvas.
    const apuiFrame = document.getElementById('apui-frame');
    if (apuiFrame?.contentWindow) {
        // Collect all nodes that the agent touched
        const updates = [];
        for (const action of agentDecision.actions) {
            if (action.actionType === 'update') {
                const n = findNodeById(action.nodeId);
                if (n) updates.push({ nodeId: n.id, newCode: n.code });
            } else if (action.actionType === 'create') {
                updates.push({ nodeId: action.newNode?.id, newCode: action.newNode?.code, isNew: true, newNode: action.newNode });
            }
        }
        if (updates.length) {
            apuiFrame.contentWindow.postMessage({ type: 'apui-init', vibeTree: JSON.parse(JSON.stringify(vibeTree)), projectId: currentProjectId, pinnedNodes: [..._apuiPinnedNodes] }, '*');
        }
    }
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

    // Collect any pending images
    const images = consumePendingImages('chat');

    sendChatButton.disabled = true;
    chatPromptInput.disabled = true;
    sendChatButton.innerHTML = '<div class="loading-spinner"></div>';
    chatPromptInput.value = '';

    const displayPrompt = images.length ? `${userPrompt} [+${images.length} image(s)]` : userPrompt;
    logToChat(displayPrompt, 'user');
    chatConversationHistory.push({ role: 'user', content: userPrompt });
    
    const aiMessageElement = logToChat('...', 'model');
    aiMessageElement.innerHTML = '';
    
    try {
        const streamCallback = (chunk) => {
            const textNode = document.createTextNode(chunk);
            aiMessageElement.appendChild(textNode);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };

        const fullResponse = await callAI(systemPrompt, userPrompt, false, streamCallback, images);
        
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
    aiStructurePromptInput.value = '';
    if (vibeTree && vibeTree.type === 'raw-html-container') {
        aiStructurePromptInput.placeholder = "e.g., Convert this uploaded HTML into an editable Vibe Tree with separate head, HTML, CSS, and JavaScript nodes.";
    } else {
        aiStructurePromptInput.placeholder = "e.g., Move the login-button node inside the user-profile-card node. Create a new CSS node called card-styles and link it.";
    }
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
        const systemPrompt = `You are an expert system that modifies a website's "vibe tree" JSON structure.
    
**RULES:**
1. **CSS Integrity:** If you add new HTML components, you MUST also add or update 'css' nodes to style them. Do not leave new elements unstyled.
2. **Valid JSON:** Return ONLY the raw JSON object for the complete, modified vibe tree.
3. **Structure:** HTML nodes need 'selector' and 'position' calculated relative to siblings.
4. **Modern Design:** Ensure any new structures follow modern design principles (Flexbox, Grid, Responsive).

Analyze the user's request and return the NEW, COMPLETE vibe tree JSON.

If the current tree is a raw-html-container, treat its code property as the source HTML and convert/refactor it into a normal editable Vibe Tree when requested. The returned root should be a valid project container with child nodes, not a partial patch.`;

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
        if (event.data && event.data.type === 'apply-merged-code') {
            console.log("Received merged code from Merger tool.");
            const newCode = event.data.code;
            
            // Update the hidden full code editor
            if(fullCodeEditor) fullCodeEditor.value = newCode;
            
            // Update the tree and UI
            handleUpdateTreeFromCode(newCode);
        }

        // --- ADDED: Listen for iframe console and error logs ---
        if (event.data && event.data.type === 'iframe-console') {
            const { level, payload } = event.data;
            if (typeof handleConsoleCommand === 'function') {
                handleConsoleCommand(level, payload);
            }
        }

        if (event.data && event.data.type === 'iframe-error') {
            const errPayload = event.data.payload;
            const errorObj = new Error(errPayload.message || 'Unknown runtime error in preview');
            errorObj.name = errPayload.name || 'Error';
            if (errPayload.stack) {
                errorObj.stack = errPayload.stack;
            }
            // Passing it to console.error routes it through the Vibe proxy automatically
            console.error(errorObj);
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

    // Save state to IndexedDB
    idbKV.set(SESSION_KEYS.TAB, tabId).catch(err => console.error("Failed to save tab state", err));

    const newContent = tabContents.querySelector(`#${tabId}`);
    if (!newContent) return;

    const alreadyActive = newContent.classList.contains('active');

    if (!alreadyActive) {
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
    }

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

    if (tabId === 'wiki') {
        renderWiki();
    }

    if (tabId === 'flow-trace') {
        // Auto-scan on first open if no triggers shown yet
        var ftList = document.getElementById('ft-trigger-list');
        if (ftList && ftList.querySelector('.ft-trigger-placeholder')) {
            renderFlowTriggerList();
        }
        // On mobile, auto-open the config panel so it's visible
        var isMobileLayout = window.innerWidth <= 640 ||
            (window.innerHeight <= 500 && window.innerWidth > window.innerHeight);
        if (isMobileLayout) {
            var leftPanel = document.getElementById('ft-left-panel');
            var configToggle = document.getElementById('ft-config-toggle');
            if (leftPanel && !leftPanel.classList.contains('ft-config-open')) {
                leftPanel.classList.add('ft-config-open');
                if (configToggle) {
                    configToggle.classList.add('ft-open');
                    var arrow = configToggle.querySelector('.ft-mobile-config-arrow');
                    if (arrow) arrow.textContent = '▲';
                    var label = configToggle.querySelector('.ft-mobile-config-label');
                    if (label) label.textContent = '⚙ Hide Config';
                }
            }
        }
    }
    
    // --- MERGE TAB LOGIC ---
    if (tabId === 'merge') {
        showFullCode(); 
        const currentCode = fullCodeEditor.value;
        const mergeFrame = newContent.querySelector('iframe');
        
        if (mergeFrame && mergeFrame.contentWindow) {
            // Post the current code to the iframe
            mergeFrame.contentWindow.postMessage({
                type: 'load-source-code',
                code: currentCode
            }, '*');
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

    if (tabId === 'nervous-system') {
        initOrRefreshNervousSystem();
    }

    if (tabId === 'apui') {
        injectBridgeIntoApui();
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
const DB_VERSION = 3;
const STORE_NAME = 'projects';
const KV_STORE_NAME = 'appState'; // FIXED: Defined this missing variable
const CHECKPOINT_STORE_NAME = 'checkpoints';
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

                // Checkpoints store — auto-increment id, indexed by projectId
                if (!db.objectStoreNames.contains(CHECKPOINT_STORE_NAME)) {
                    const cpStore = db.createObjectStore(CHECKPOINT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    cpStore.createIndex('projectId', 'projectId', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                // Close gracefully if another tab opens a newer DB version
                db.onversionchange = () => { db.close(); dbPromise = null; };
                resolve(db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                dbPromise = null;
                reject(event.target.error);
            };
        // Clear cache on rejection so the next call can retry
        }).catch(err => { dbPromise = null; return Promise.reject(err); });
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

        updateProjectActionButtonStates();
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
        case 'slider': {
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
        }
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
        case 'checkbox': {
            controlWrapper.innerHTML = ''; // Clear default label
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
        }
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
    // Some buttons/inputs have inline handlers in index.html for the enhanced
    // multi-file import/download flow. Do not double-bind them here.
    if (uploadHtmlButton && !uploadHtmlButton.hasAttribute('onclick')) uploadHtmlButton.addEventListener('click', () => htmlFileInput.click());
    if (htmlFileInput && !htmlFileInput.hasAttribute('onchange')) htmlFileInput.addEventListener('change', handleFileUpload);
    if (uploadZipButton && !uploadZipButton.hasAttribute('onclick')) uploadZipButton.addEventListener('click', () => zipFileInput.click());
    if (zipFileInput && !zipFileInput.hasAttribute('onchange')) zipFileInput.addEventListener('change', handleZipUpload);
    if (downloadZipButton && !downloadZipButton.hasAttribute('onclick')) downloadZipButton.addEventListener('click', handleDownloadProjectZip);
    if (filesUploadButton) filesUploadButton.addEventListener('click', () => filesUploadInput.click());
    if (filesUploadInput) filesUploadInput.addEventListener('change', handleFilesUpload);
    if (filesNewFolderButton) filesNewFolderButton.addEventListener('click', handleFilesNewFolder);
    if (filesNewFileButton) filesNewFileButton.addEventListener('click', handleFilesNewFile);
    if (filesDownloadButton) filesDownloadButton.addEventListener('click', handleFilesDownload);
    if (filesCopyButton) filesCopyButton.addEventListener('click', handleFilesCopy);
    if (filesPasteButton) filesPasteButton.addEventListener('click', handleFilesPaste);
    if (filesRenameButton) filesRenameButton.addEventListener('click', handleFilesRename);
    if (filesDeleteButton) filesDeleteButton.addEventListener('click', handleFilesDelete);
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);
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
    const refreshWikiButton = document.getElementById('refresh-wiki-button');
    if (refreshWikiButton) refreshWikiButton.addEventListener('click', renderWiki);
    const wikiSearchInput = document.getElementById('wiki-search-input');
    if (wikiSearchInput) wikiSearchInput.addEventListener('input', filterWiki);
    bindFlowTracerEvents();
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
    if (geminiModelSelect) geminiModelSelect.addEventListener('change', function() {
        var customContainer = document.getElementById('gemini-custom-model-container');
        if (geminiModelSelect.value === '__custom__') {
            if (customContainer) customContainer.style.display = 'block';
            // Focus the input so the user can type right away
            var customInput = document.getElementById('gemini-custom-model-input');
            if (customInput) setTimeout(function() { customInput.focus(); }, 50);
        } else {
            if (customContainer) customContainer.style.display = 'none';
            localStorage.setItem('geminiModel', geminiModelSelect.value);
            localStorage.removeItem('geminiCustomModel');
        }
    });
    // Save custom model name as user types
    var geminiCustomModelInput = document.getElementById('gemini-custom-model-input');
    if (geminiCustomModelInput) geminiCustomModelInput.addEventListener('input', function() {
        localStorage.setItem('geminiCustomModel', geminiCustomModelInput.value.trim());
    });
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
                handleSaveToGithub();
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
    const wikiContentEl = document.getElementById('wiki-content');
    if (wikiContentEl) wikiContentEl.innerHTML = '<div class="wiki-placeholder">Load a project to generate the Code Wiki.</div>';
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


// ══════════════════════════════════════════════════════════════════
// CODE WIKI — auto-generated documentation from node descriptions
// ══════════════════════════════════════════════════════════════════

function flattenTreeForWiki(node, depth, parentId) {
    if (node === undefined) node = vibeTree;
    if (depth === undefined) depth = 0;
    if (parentId === undefined) parentId = null;
    if (!node || !node.id) return [];
    const list = [];
    list.push({
        id: node.id,
        type: node.type || 'unknown',
        description: node.description || '',
        code: node.code || '',
        depth: depth,
        parentId: parentId
    });
    if (node.children) {
        node.children.forEach(function(child) {
            var sub = flattenTreeForWiki(child, depth + 1, node.id);
            sub.forEach(function(n) { list.push(n); });
        });
    }
    return list;
}

function groupWikiNodesByType(nodes) {
    var ORDER = ['head', 'container', 'html', 'css', 'javascript', 'js-function', 'declaration'];
    var groups = {};
    nodes.forEach(function(n) {
        var key = n.type;
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    });
    return Object.entries(groups).sort(function(a, b) {
        var ai = ORDER.indexOf(a[0]), bi = ORDER.indexOf(b[0]);
        if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

var WIKI_TYPE_META = {
    container:    { icon: '📦', label: 'Containers',    cssClass: 'wiki-type-container' },
    html:         { icon: '🏗️',  label: 'HTML Nodes',    cssClass: 'wiki-type-html' },
    css:          { icon: '🎨',  label: 'CSS Nodes',     cssClass: 'wiki-type-css' },
    javascript:   { icon: '⚙️',  label: 'JavaScript',    cssClass: 'wiki-type-javascript' },
    'js-function':{ icon: '⚙️',  label: 'JS Functions',  cssClass: 'wiki-type-js-function' },
    declaration:  { icon: '📝',  label: 'Declarations',  cssClass: 'wiki-type-declaration' },
    head:         { icon: '🔖',  label: 'Head',          cssClass: 'wiki-type-head' },
};

function getWikiTypeMeta(type) {
    return WIKI_TYPE_META[type] || { icon: '🔹', label: type, cssClass: 'wiki-type-html' };
}

function findNodeCodeInFullCode(nodeId, fullCode) {
    if (!fullCode || !nodeId) return -1;
    var attrSearch = 'data-vibe-node-id="' + nodeId + '"';
    var idx = fullCode.indexOf(attrSearch);
    if (idx !== -1) {
        var tagStart = fullCode.lastIndexOf('<', idx);
        return tagStart !== -1 ? tagStart : idx;
    }
    return -1;
}

function renderWiki() {
    var wikiContent = document.getElementById('wiki-content');
    if (!wikiContent) return;

    if (!vibeTree || !vibeTree.id) {
        wikiContent.innerHTML = '<div class="wiki-placeholder">Load a project to generate the Code Wiki.</div>';
        return;
    }
    if (vibeTree.type === 'raw-html-container') {
        wikiContent.innerHTML = '<div class="wiki-placeholder">Code Wiki is not available for raw HTML projects. Use "Process into Vibe Tree" to enable it.</div>';
        return;
    }

    var allNodes = flattenTreeForWiki();
    if (allNodes.length === 0) {
        wikiContent.innerHTML = '<div class="wiki-placeholder">No nodes found in the current project.</div>';
        return;
    }

    var grouped = groupWikiNodesByType(allNodes);
    var searchTerm = (document.getElementById('wiki-search-input') ? document.getElementById('wiki-search-input').value : '').toLowerCase();

    var html = '';

    // Table of Contents
    html += '<div class="wiki-toc"><div class="wiki-toc-title">Quick Jump</div><div class="wiki-toc-links">';
    grouped.forEach(function(entry) {
        var type = entry[0], nodes = entry[1];
        var meta = getWikiTypeMeta(type);
        html += '<a href="#wiki-section-' + type + '" class="wiki-toc-link">' + meta.icon + ' ' + meta.label + ' (' + nodes.length + ')</a>';
    });
    html += '</div></div>';

    html += '<div class="wiki-no-results" id="wiki-no-results">No nodes match your search.</div>';

    grouped.forEach(function(entry) {
        var type = entry[0], nodes = entry[1];
        var meta = getWikiTypeMeta(type);
        html += '<div class="wiki-section" id="wiki-section-' + type + '">';
        html += '<div class="wiki-section-header">';
        html += '<span class="wiki-section-icon">' + meta.icon + '</span>';
        html += '<span class="wiki-section-title">' + meta.label + '</span>';
        html += '<span class="wiki-section-count">' + nodes.length + '</span>';
        html += '</div>';

        nodes.forEach(function(node) {
            var descText = node.description ? node.description : '<em style="color:#5c6370">No description provided.</em>';
            var isHidden = searchTerm && !node.id.toLowerCase().includes(searchTerm) && !node.description.toLowerCase().includes(searchTerm);
            var parentLabel = node.parentId ? ' <span style="color:#5c6370;font-weight:400"> \u2190 ' + node.parentId + '</span>' : '';
            html += '<div class="wiki-node-card' + (isHidden ? ' wiki-hidden' : '') + '" data-wiki-node-id="' + node.id + '" title="Click to view this section in code">';
            html += '<div class="wiki-node-card-body">';
            html += '<div class="wiki-node-id">' + node.id + parentLabel + '</div>';
            html += '<div class="wiki-node-desc">' + descText + '</div>';
            html += '</div>';
            html += '<span class="wiki-node-type-badge ' + meta.cssClass + '">' + type + '</span>';
            html += '<span class="wiki-go-link">Go to Code \u2192</span>';
            html += '</div>';
        });

        html += '</div>';
    });

    wikiContent.innerHTML = html;
    updateWikiNoResults();

    wikiContent.querySelectorAll('.wiki-node-card').forEach(function(card) {
        card.addEventListener('click', function() {
            jumpToNodeInCode(card.dataset.wikiNodeId);
        });
    });

    wikiContent.querySelectorAll('.wiki-toc-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = link.getAttribute('href').slice(1);
            var target = document.getElementById(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function updateWikiNoResults() {
    var wikiContent = document.getElementById('wiki-content');
    if (!wikiContent) return;
    var noResults = document.getElementById('wiki-no-results');
    if (!noResults) return;
    var visible = wikiContent.querySelectorAll('.wiki-node-card:not(.wiki-hidden)');
    noResults.style.display = visible.length === 0 ? 'block' : 'none';
}

function filterWiki() {
    var searchTerm = (document.getElementById('wiki-search-input') ? document.getElementById('wiki-search-input').value : '').toLowerCase();
    var wikiContent = document.getElementById('wiki-content');
    if (!wikiContent) return;
    wikiContent.querySelectorAll('.wiki-node-card').forEach(function(card) {
        var nodeId = card.dataset.wikiNodeId || '';
        var desc = (card.querySelector('.wiki-node-desc') ? card.querySelector('.wiki-node-desc').textContent : '') || '';
        var match = !searchTerm || nodeId.toLowerCase().includes(searchTerm) || desc.toLowerCase().includes(searchTerm);
        card.classList.toggle('wiki-hidden', !match);
    });
    updateWikiNoResults();
}

/* jumpToNodeInCode replaced below by improved version */



// ══════════════════════════════════════════════════════════════════
// WIKI FIX — improved jumpToNodeInCode with reliable scroll
// ══════════════════════════════════════════════════════════════════

function jumpToNodeInCode(nodeId) {
    // Ensure full code is populated first, then switch tab
    showFullCode();
    switchToTab('code');

    setTimeout(function() {
        if (!fullCodeEditor) return;
        var code = fullCodeEditor.value;
        if (!code) return;

        var idx = -1;

        // Strategy 1: data-vibe-node-id attribute (injected into HTML nodes)
        var attrSearch = 'data-vibe-node-id="' + nodeId + '"';
        idx = code.indexOf(attrSearch);
        if (idx !== -1) {
            // walk back to find the opening angle bracket of the tag
            var tagStart = code.lastIndexOf('<', idx);
            if (tagStart !== -1) idx = tagStart;
        }

        // Strategy 2: CSS rule for #nodeId
        if (idx === -1) {
            var cssSelector = '#' + nodeId;
            idx = code.indexOf(cssSelector + ' ');
            if (idx === -1) idx = code.indexOf(cssSelector + '{');
            if (idx === -1) idx = code.indexOf(cssSelector + '\n');
        }

        // Strategy 3: bare string occurrence
        if (idx === -1) {
            idx = code.indexOf(nodeId);
        }

        if (idx === -1) {
            console.warn('Wiki: Could not locate code for node "' + nodeId + '"');
            return;
        }

        // Calculate which line the match is on
        var beforeMatch = code.substring(0, idx);
        var lineNumber = beforeMatch.split('\n').length;
        var totalLines = code.split('\n').length;

        // Use a reliable scroll calculation
        // We need the textarea's line height
        var lineHeight = parseInt(window.getComputedStyle(fullCodeEditor).lineHeight) || 18;
        var targetScrollTop = (lineNumber - 3) * lineHeight; // -3 to show a bit of context above

        fullCodeEditor.scrollTop = Math.max(0, targetScrollTop);
        fullCodeEditor.focus();

        // Set selection to highlight the node id
        var selEnd = Math.min(idx + nodeId.length, code.length);
        fullCodeEditor.setSelectionRange(idx, selEnd);

        // Flash the sidebar Code tab icon
        var codeTabBtn = document.querySelector('.tab-button[data-tab="code"]');
        if (codeTabBtn) {
            codeTabBtn.classList.add('wiki-code-flash');
            setTimeout(function() { codeTabBtn.classList.remove('wiki-code-flash'); }, 1600);
        }

        console.log('Wiki: Jumped to node "' + nodeId + '" at line ' + lineNumber);
    }, 200);
}

// ══════════════════════════════════════════════════════════════════
// FLOW TRACER
// ══════════════════════════════════════════════════════════════════

var flowTracerState = {
    isRunning: false,
    lastTrace: null
};

/**
 * Scan the vibeTree for interactive elements and event handlers.
 * Returns an array of { selector, eventType, nodeId, snippet }
 */
function scanProjectForInteractions() {
    var interactions = [];
    if (!vibeTree) return interactions;

    function walkNode(node) {
        if (!node) return;

        var code = node.code || '';
        var nodeId = node.id;

        // HTML nodes: look for event attributes and form elements
        if (node.type === 'html' || node.type === 'container') {
            // onclick, onsubmit, onchange, etc.
            var evtAttrRe = /\bon(click|submit|change|input|keydown|keyup|focus|blur|mouseover|mouseout)\s*=/gi;
            var m;
            while ((m = evtAttrRe.exec(code)) !== null) {
                interactions.push({
                    eventType: m[1].toLowerCase(),
                    selector: extractIdFromCode(code) || '#' + nodeId,
                    nodeId: nodeId,
                    snippet: extractSnippetAround(code, m.index, 60)
                });
            }
            // <button>, <a>, <input type="submit"> elements
            var btnRe = /<(button|a)\b([^>]*)>/gi;
            while ((m = btnRe.exec(code)) !== null) {
                var attrs = m[2];
                var idMatch = attrs.match(/id="([^"]+)"/);
                var selector = idMatch ? '#' + idMatch[1] : m[1];
                interactions.push({
                    eventType: 'click',
                    selector: selector,
                    nodeId: nodeId,
                    snippet: m[0].length > 80 ? m[0].substring(0, 80) + '...' : m[0]
                });
            }
            // <form> submits
            var formRe = /<form\b([^>]*)>/gi;
            while ((m = formRe.exec(code)) !== null) {
                var attrs = m[1];
                var idMatch = attrs.match(/id="([^"]+)"/);
                interactions.push({
                    eventType: 'submit',
                    selector: idMatch ? '#' + idMatch[1] : 'form',
                    nodeId: nodeId,
                    snippet: m[0].length > 80 ? m[0].substring(0, 80) + '...' : m[0]
                });
            }
        }

        // JS nodes: look for addEventListener calls
        if (node.type === 'javascript' || node.type === 'js-function' || node.type === 'declaration') {
            var addEvtRe = /\.addEventListener\s*\(\s*['"](\w+)['"]\s*,/g;
            var m;
            while ((m = addEvtRe.exec(code)) !== null) {
                // Try to find what element this is attached to
                var beforeCall = code.substring(Math.max(0, m.index - 80), m.index);
                var elMatch = beforeCall.match(/(?:getElementById|querySelector)\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.\s*$/) ||
                              beforeCall.match(/([\w$]+)\s*\.\s*$/);
                var selector = elMatch ? (elMatch[1].startsWith('#') ? elMatch[1] : '#' + elMatch[1]) : '(element)';
                interactions.push({
                    eventType: m[1].toLowerCase(),
                    selector: selector,
                    nodeId: nodeId,
                    snippet: extractSnippetAround(code, m.index, 60)
                });
            }
        }

        if (node.children) node.children.forEach(walkNode);
    }

    walkNode(vibeTree);

    // Deduplicate by selector+eventType
    var seen = new Set();
    return interactions.filter(function(i) {
        var key = i.eventType + '::' + i.selector;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function extractIdFromCode(code) {
    var m = code.match(/id="([^"]+)"/);
    return m ? '#' + m[1] : null;
}

function extractSnippetAround(code, index, len) {
    var start = Math.max(0, index - 10);
    var end = Math.min(code.length, index + len);
    return code.substring(start, end).replace(/\s+/g, ' ').trim();
}

function renderFlowTriggerList() {
    var listEl = document.getElementById('ft-trigger-list');
    if (!listEl) return;
    if (!vibeTree || !vibeTree.id) {
        listEl.innerHTML = '<div class="ft-trigger-placeholder">Load a project first.</div>';
        return;
    }

    var interactions = scanProjectForInteractions();
    if (interactions.length === 0) {
        listEl.innerHTML = '<div class="ft-trigger-placeholder">No interactive elements detected.</div>';
        return;
    }

    var ICONS = { click: '🖱️', submit: '📨', input: '⌨️', change: '⌨️', keydown: '⌨️', focus: '👁️', load: '📄' };
    listEl.innerHTML = '';
    interactions.slice(0, 20).forEach(function(inter) {
        var chip = document.createElement('div');
        chip.className = 'ft-trigger-chip';
        chip.innerHTML =
            '<span class="ft-chip-icon">' + (ICONS[inter.eventType] || '⚡') + '</span>' +
            '<span class="ft-chip-label">' + escapeHtml(inter.selector) + '</span>' +
            '<span class="ft-chip-type">' + inter.eventType + '</span>';
        chip.addEventListener('click', function() {
            var triggerTypeEl = document.getElementById('ft-trigger-type');
            var targetSelectorEl = document.getElementById('ft-target-selector');
            if (triggerTypeEl) triggerTypeEl.value = inter.eventType;
            if (targetSelectorEl) targetSelectorEl.value = inter.selector;
        });
        listEl.appendChild(chip);
    });
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Build a flow trace by analysing the vibeTree for the given trigger.
 * This is a static analysis approach — we don't actually execute code,
 * we trace what WOULD happen based on the code structure.
 */
async function runFlowTrace() {
    if (flowTracerState.isRunning) return;

    var triggerType    = (document.getElementById('ft-trigger-type')    || {}).value || 'click';
    var targetSelector = ((document.getElementById('ft-target-selector') || {}).value || '').trim();
    var inputValue     = ((document.getElementById('ft-input-value')     || {}).value || '').trim();
    var depth          = (document.getElementById('ft-depth')           || {}).value || 'deep';

    // Canvas-based UI elements (no ft-flow-output — that was the old text layout)
    var placeholder = document.getElementById('ft-placeholder');
    var wrapper     = document.getElementById('ft-canvas-wrapper');
    var stepCountEl = document.getElementById('ft-step-count');
    var runBtn      = document.getElementById('ft-run-button');
    var replayBtn   = document.getElementById('ft-replay-button');

    if (!wrapper) { console.error('Flow Tracer: ft-canvas-wrapper not found'); return; }

    // Pre-flight: check an API key is configured
    var keyOk = (currentAIProvider === 'gemini' && !!geminiApiKey) ||
                (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (!keyOk) {
        if (placeholder) {
            placeholder.innerHTML =
                '<span style="color:#e5c07b;font-weight:700">⚠ No API key set</span><br>' +
                '<span style="font-size:0.78rem;color:#7f848e">Add your API key in Settings before running a trace.</span>';
            placeholder.style.display = '';
        }
        return;
    }

    if (!vibeTree || !vibeTree.id) {
        if (placeholder) {
            placeholder.innerHTML =
                '<span style="color:#e5c07b;font-weight:700">⚠ No project loaded</span><br>' +
                '<span style="font-size:0.78rem;color:#7f848e">Load or create a project first.</span>';
            placeholder.style.display = '';
        }
        return;
    }

    // ── Loading state ──────────────────────────────────────────────
    flowTracerState.isRunning = true;
    stopCanvasAnimation();
    clearCanvas();

    // Show a loading overlay on the canvas
    var loadOverlay = document.getElementById('ft-loading-overlay');
    if (!loadOverlay) {
        loadOverlay = document.createElement('div');
        loadOverlay.id        = 'ft-loading-overlay';
        loadOverlay.className = 'ft-loading-overlay';
        loadOverlay.innerHTML = '<div class="ft-loading-ring"></div><span>Analysing flow…</span>';
        wrapper.appendChild(loadOverlay);
    }
    loadOverlay.style.display = 'flex';
    if (placeholder) placeholder.style.display = 'none';
    if (stepCountEl) stepCountEl.textContent = '';
    if (replayBtn)   replayBtn.style.display  = 'none';
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Tracing…'; }

    // Close detail drawer while loading
    var drawer = document.getElementById('ft-detail-drawer');
    if (drawer) drawer.classList.remove('ft-drawer-open');

    try {
        var projectSummary = buildProjectSummaryForTrace();

        var systemPrompt = [
            'You are an expert JavaScript runtime analyser performing deep static analysis.',
            '',
            'Your job: trace the COMPLETE domino-effect execution of a user interaction — every',
            'function call, condition check, variable mutation, DOM change, and side effect.',
            '',
            'Return ONLY a raw JSON object — no markdown, no prose, no ```fences```.',
            '',
            'JSON SHAPE:',
            '{',
            '  "summary": "One sentence — what does this interaction accomplish end-to-end?",',
            '  "steps": [',
            '    {',
            '      "type": "trigger|handler|condition|mutation|dom|network|state|output|error",',
            '      "title": "Function or action name (max 8 words)",',
            '      "detail": "Precisely what happens here — which function runs, what it checks, what it returns",',
            '      "codeSnippet": "The actual relevant 1-4 lines of code from the project",',
            '      "nodeId": "The vibeTree JS/HTML node ID containing this code or null",',
            '      "variables": [',
            '        { "name": "variableName", "before": "value before", "after": "value after" }',
            '      ],',
            '      "condition": "If this is a branch — the exact condition checked e.g. if (data.length > 0)",',
            '      "conditionResult": true,',
            '      "sideEffects": ["DOM: #element.innerHTML changed", "localStorage.setItem called", etc],',
            '      "returns": "What this function/step returns or resolves to"',
            '    }',
            '  ]',
            '}',
            '',
            'STEP TYPE GUIDE:',
            '  trigger   = the raw user event (click, submit, keydown etc)',
            '  handler   = a function or event listener that fires',
            '  condition = an if/else/switch branch — show which path is taken and why',
            '  mutation  = a variable or state value being changed',
            '  dom       = a DOM read or write (querySelector, innerHTML, classList, setAttribute)',
            '  network   = a fetch/XHR/WebSocket call — show URL, method, payload',
            '  state     = application-level state change (not just a local var)',
            '  output    = the final visible result the user sees',
            '  error     = an exception, rejection, or failed validation',
            '',
            'RULES:',
            '- Produce 6-20 steps. Be exhaustive — trace EVERY branch, EVERY variable change.',
            '- For each condition step, show exactly which branch is taken and why.',
            '- For each mutation step, show the variable name, old value, new value.',
            '- For network steps, show the URL, method, and what the response triggers next.',
            '- codeSnippet must quote REAL code from the project source, not invented code.',
            '- variables, sideEffects, condition, conditionResult, returns are ALL optional fields.',
            '  Only include them when they apply to that specific step.',
            '- Start with type "trigger", end with "output" or "error".',
            '- Return RAW JSON only. Absolutely nothing outside the { } object.'
        ].join('\n');

        var userPrompt = 'Project:\n' + projectSummary + '\n\n' +
            'Trace: ' + triggerType + ' on "' + (targetSelector || 'most interactive element') + '"' +
            (inputValue ? ' with value "' + inputValue + '"' : '') +
            ' (depth: ' + depth + ')\n\nReturn the JSON trace.';

        var rawResponse = await callAI(systemPrompt, userPrompt, true);

        var traceData;
        try {
            var jsonText = rawResponse.trim();
            // Strip any accidental markdown fences
            var fence = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (fence && fence[1]) jsonText = fence[1].trim();
            // Find outermost { }
            var s = jsonText.indexOf('{');
            var e = jsonText.lastIndexOf('}');
            if (s !== -1 && e > s) jsonText = jsonText.substring(s, e + 1);
            traceData = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error('Flow Tracer parse error. Raw response:', rawResponse);
            throw new Error('AI returned invalid JSON. Check the console for the raw response.');
        }

        if (!Array.isArray(traceData.steps) || traceData.steps.length === 0) {
            throw new Error('AI returned no steps. Try being more specific about the selector or interaction.');
        }

        renderFlowTrace(traceData, triggerType, targetSelector);

    } catch (err) {
        console.error('Flow Tracer error:', err);
        // Show error on the canvas placeholder
        if (placeholder) {
            placeholder.innerHTML =
                '<span style="color:#e06c75;font-weight:700">✗ Trace failed</span><br>' +
                '<span style="font-size:0.78rem;color:#7f848e">' + escapeHtml(err.message) + '</span>';
            placeholder.style.display = '';
        }
    } finally {
        flowTracerState.isRunning = false;
        if (loadOverlay) loadOverlay.style.display = 'none';
        if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run Trace'; }
    }
}

function buildProjectSummaryForTrace() {
    // Send FULL code of JS/logic nodes so the AI can trace variable values precisely
    var sections = [];
    function walk(node) {
        if (!node) return;
        if (node.type === 'javascript' || node.type === 'js-function' || node.type === 'declaration') {
            sections.push('=== JS NODE: ' + node.id + ' ===');
            sections.push(node.description || '');
            sections.push(node.code || '');
            sections.push('');
        } else if (node.type === 'html') {
            // For HTML, send the full markup so the AI knows selector targets
            sections.push('=== HTML NODE: ' + node.id + ' ===');
            sections.push(node.description || '');
            sections.push((node.code || '').substring(0, 600));
            sections.push('');
        }
        if (node.children) node.children.forEach(walk);
    }
    walk(vibeTree);
    var full = sections.join('\n');
    // Cap at 8000 chars — generous for deep analysis
    if (full.length > 8000) full = full.substring(0, 8000) + '\n...(truncated for length)';
    return full;
}

function renderFlowTrace(traceData, triggerType, targetSelector) {
    var stepCountEl = document.getElementById('ft-step-count');
    var placeholder = document.getElementById('ft-placeholder');
    var replayBtn = document.getElementById('ft-replay-button');
    if (placeholder) placeholder.style.display = 'none';
    if (replayBtn) replayBtn.style.display = '';

    var steps = traceData.steps || [];
    if (stepCountEl) stepCountEl.textContent = steps.length + ' node' + (steps.length !== 1 ? 's' : '');

    flowTracerState.lastTrace = traceData;
    flowTracerState.summary = traceData.summary || '';

    buildAndAnimateGraph(steps);
}

function searchAndJumpToSnippet(snippet) {
    showFullCode();
    switchToTab('code');
    setTimeout(function() {
        if (!fullCodeEditor) return;
        var code = fullCodeEditor.value;
        var searchFor = snippet.replace(/\s+/g, ' ').trim().substring(0, 40);
        var idx = code.indexOf(searchFor);
        if (idx === -1) idx = code.indexOf(searchFor.substring(0, 20));
        if (idx !== -1) {
            var lineNum = code.substring(0, idx).split('\n').length;
            var lineHeight = parseInt(window.getComputedStyle(fullCodeEditor).lineHeight) || 18;
            fullCodeEditor.scrollTop = Math.max(0, (lineNum - 3) * lineHeight);
            fullCodeEditor.focus();
            fullCodeEditor.setSelectionRange(idx, Math.min(idx + searchFor.length, code.length));
        }
    }, 200);
}

function clearFlowTrace() {
    var placeholder = document.getElementById('ft-placeholder');
    var stepCountEl = document.getElementById('ft-step-count');
    var replayBtn = document.getElementById('ft-replay-button');
    var drawer = document.getElementById('ft-detail-drawer');
    if (placeholder) placeholder.style.display = '';
    if (stepCountEl) stepCountEl.textContent = '';
    if (replayBtn) replayBtn.style.display = 'none';
    if (drawer) drawer.classList.remove('ft-drawer-open');
    stopCanvasAnimation();
    clearCanvas();
    var targetSelectorEl = document.getElementById('ft-target-selector');
    var inputValueEl = document.getElementById('ft-input-value');
    if (targetSelectorEl) targetSelectorEl.value = '';
    if (inputValueEl) inputValueEl.value = '';
    flowTracerState.lastTrace = null;
}

// ─────────────────────────────────────────────────────────────────
// CANVAS ANIMATION ENGINE
// ─────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────
// CANVAS ANIMATION ENGINE — deep visual flow tracer
// ─────────────────────────────────────────────────────────────────

var ftCanvas = null;
var ftCtx    = null;
var ftAnimFrame   = null;
var ftGraphNodes  = [];
var ftGraphEdges  = [];
var ftParticles   = [];
var ftSpeedMultiplier = 1;
var ftHoveredNode = null;
var ftClickedNode = null;
var ftPulseTime   = 0;
var ftScrollY       = 0;          // vertical pan for tall graphs (current, interpolated)
var ftScrollYTarget = 0;          // smooth-scroll destination
var ftScrollYVel    = 0;          // spring velocity
var ftTtsEnabled    = false;      // TTS readout toggle
var ftPanX        = 0;          // horizontal pan (zoom-dependent)
var ftScale       = 1.0;        // zoom level
var ftDragStart   = null;
var ftPinchDist0  = null;       // initial pinch distance for touch zoom
var ftPinchScale0 = null;       // scale at start of pinch
var FT_SCALE_MIN  = 0.25;
var FT_SCALE_MAX  = 3.0;

var FT_COLORS = {
    trigger:   { node: '#c678dd', glow: 'rgba(198,120,221,0.55)', text: '#fff',    dim: 'rgba(198,120,221,0.08)' },
    handler:   { node: '#e5c07b', glow: 'rgba(229,192,123,0.45)', text: '#1a1c1f', dim: 'rgba(229,192,123,0.08)' },
    condition: { node: '#d19a66', glow: 'rgba(209,154,102,0.45)', text: '#1a1c1f', dim: 'rgba(209,154,102,0.08)' },
    mutation:  { node: '#e06c75', glow: 'rgba(224,108,117,0.45)', text: '#fff',    dim: 'rgba(224,108,117,0.08)' },
    dom:       { node: '#61afef', glow: 'rgba(97,175,239,0.45)',  text: '#fff',    dim: 'rgba(97,175,239,0.08)'  },
    network:   { node: '#56b6c2', glow: 'rgba(86,182,194,0.45)', text: '#fff',    dim: 'rgba(86,182,194,0.08)'  },
    state:     { node: '#98c379', glow: 'rgba(152,195,121,0.45)', text: '#1a1c1f', dim: 'rgba(152,195,121,0.08)' },
    output:    { node: '#98c379', glow: 'rgba(152,195,121,0.65)', text: '#1a1c1f', dim: 'rgba(152,195,121,0.1)'  },
    error:     { node: '#e06c75', glow: 'rgba(224,108,117,0.65)', text: '#fff',    dim: 'rgba(224,108,117,0.1)'  },
};
function getStepColor(type) {
    return FT_COLORS[type] || { node:'#7f848e', glow:'rgba(127,132,142,0.3)', text:'#fff', dim:'rgba(127,132,142,0.07)' };
}

var TYPE_ICONS  = { trigger:'⚡',handler:'ƒ',condition:'?',mutation:'✎',dom:'⬡',network:'⇅',state:'◈',output:'✓',error:'✗' };
var TYPE_LABELS = { trigger:'TRIGGER',handler:'HANDLER',condition:'CONDITION',mutation:'MUTATION',dom:'DOM',network:'NETWORK',state:'STATE',output:'OUTPUT',error:'ERROR' };

// ── Measure how tall a node needs to be given its step data ────────
function measureNodeHeight(step, W) {
    var BASE    = 62;   // header row
    var ROW_H   = 18;   // each sub-row
    var CODE_H  = 0;
    if (step.codeSnippet) {
        var lines = step.codeSnippet.split('\n').length;
        CODE_H = Math.max(36, lines * 15 + 12);
    }
    var VARS_H  = Array.isArray(step.variables)  ? step.variables.length  * ROW_H + 8 : 0;
    var SE_H    = Array.isArray(step.sideEffects) ? step.sideEffects.length * ROW_H + 8 : 0;
    var COND_H  = step.condition ? ROW_H + 8 : 0;
    var RET_H   = step.returns   ? ROW_H + 8 : 0;
    return BASE + CODE_H + VARS_H + SE_H + COND_H + RET_H;
}

function stopCanvasAnimation() {
    if (ftAnimFrame) { cancelAnimationFrame(ftAnimFrame); ftAnimFrame = null; }
}

function clearCanvas() {
    var c = document.getElementById('ft-canvas');
    if (!c) return;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    ftGraphNodes = []; ftGraphEdges = []; ftParticles = [];
    ftHoveredNode = null; ftClickedNode = null; ftScrollY = 0; ftScrollYTarget = 0; ftScrollYVel = 0; ftPanX = 0; ftScale = 1.0;
}

function buildAndAnimateGraph(steps) {
    stopCanvasAnimation();
    ftParticles = []; ftHoveredNode = null; ftClickedNode = null; ftScrollY = 0; ftScrollYTarget = 0; ftScrollYVel = 0; ftPanX = 0; ftScale = 1.0;

    var canvas  = document.getElementById('ft-canvas');
    var wrapper = document.getElementById('ft-canvas-wrapper');
    if (!canvas || !wrapper) return;

    var dpr = window.devicePixelRatio || 1;
    // Use a large virtual canvas for the graph — much wider/taller than the visible area
    var VIS_W = wrapper.clientWidth  || 800;
    var VIS_H = wrapper.clientHeight || 600;

    // Node layout constants
    var PAD    = 40;
    var NODE_W = Math.min(VIS_W - PAD * 2, 520);
    var GAP_Y  = 44;

    // Calculate each node's height
    var nodeHeights = steps.map(function(s) { return measureNodeHeight(s, NODE_W); });

    // Stack nodes vertically
    var yPositions = [];
    var cur = PAD;
    nodeHeights.forEach(function(h) { yPositions.push(cur + h / 2); cur += h + GAP_Y; });
    var totalGraphH = cur + PAD;

    // Virtual canvas size: at least the visible area, or the full graph height
    var CANVAS_W = Math.max(VIS_W, NODE_W + PAD * 2 + 40);
    var CANVAS_H = Math.max(VIS_H, totalGraphH + PAD);

    canvas.width  = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width  = CANVAS_W + 'px';
    canvas.style.height = CANVAS_H + 'px';
    ftCtx = canvas.getContext('2d');
    ftCtx.scale(dpr, dpr);
    ftCanvas = canvas;

    var col_c_arr = steps.map(function(s) { return getStepColor(s.type || 'handler'); });

    ftGraphNodes = steps.map(function(step, i) {
        return {
            id:         i,
            x:          CANVAS_W / 2,
            y:          yPositions[i],
            w:          NODE_W,
            h:          nodeHeights[i],
            label:      step.title || step.type || 'step',
            type:       step.type  || 'handler',
            step:       step,
            color:      col_c_arr[i].node,
            glowColor:  col_c_arr[i].glow,
            dimColor:   col_c_arr[i].dim,
            textColor:  col_c_arr[i].text,
            state:      'done',   // All nodes shown immediately — no animation
            pulsePhase: i * 0.35
        };
    });

    ftGraphEdges = [];
    for (var i = 0; i < ftGraphNodes.length - 1; i++) {
        ftGraphEdges.push({ from: i, to: i + 1, color: ftGraphNodes[i].color, progress: 1 });
    }

    // Draw once (static — no rAF loop needed, but keep loop for hover/tooltip updates)
    ftPulseTime = 0;
    ftAnimFrame = requestAnimationFrame(drawFrame);
}

function animateEdgeFill(idx, dur) {
    var edge = ftGraphEdges[idx]; if (!edge) return;
    var t0 = performance.now();
    function tick(now) { edge.progress = Math.min(1, (now - t0) / dur); if (edge.progress < 1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
}

function spawnParticles(edgeIdx) {
    var edge = ftGraphEdges[edgeIdx]; if (!edge) return;
    for (var k = 0; k < 5; k++) {
        (function(k) { setTimeout(function() {
            ftParticles.push({ edgeIdx: edgeIdx, progress: 0, speed: (0.014 + Math.random() * 0.007) / ftSpeedMultiplier, color: edge.color, size: 4 + Math.random() * 3, trail: [], done: false });
        }, k * 80 * ftSpeedMultiplier); })(k);
    }
}

// ── TTS helper ────────────────────────────────────────────────────
function ftSpeakNode(node) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var text = (TYPE_LABELS[node.type] || node.type) + ': ' + node.label;
    if (node.step && node.step.detail) text += '. ' + node.step.detail.substring(0, 120);
    var utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05; utt.pitch = 1;
    window.speechSynthesis.speak(utt);
}

function drawFrame(now) {
    if (!ftCtx || !ftCanvas) return;
    var dpr = window.devicePixelRatio || 1;
    var W = ftCanvas.width / dpr, H = ftCanvas.height / dpr;
    var ctx = ftCtx;
    ftPulseTime = now * 0.001;

    ctx.clearRect(0, 0, W, H);
    // No transform — nodes are placed at absolute canvas positions (large virtual canvas)
    drawGrid(ctx, W, H);
    drawEdges(ctx);
    drawNodes(ctx, W, H);

    ftAnimFrame = requestAnimationFrame(drawFrame);
}

function drawGrid(ctx, W, H) {
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
    for (var x = 0; x < W; x += 44) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (var y = 0; y < H+Math.abs(ftScrollY); y += 44) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
}

function drawEdges(ctx) {
    ftGraphEdges.forEach(function(edge) {
        var fn = ftGraphNodes[edge.from], tn = ftGraphNodes[edge.to]; if (!fn||!tn) return;
        var x  = fn.x;
        var y0 = fn.y + fn.h / 2;
        var y1 = tn.y - tn.h / 2;
        var cy = (y0 + y1) / 2;

        // Track
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1);
        ctx.strokeStyle = hexToRgba(edge.color, 0.1); ctx.lineWidth = 3;
        ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);

        // Filled progress
        if (edge.progress > 0) {
            var fillY = y0 + (y1 - y0) * edge.progress;
            ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, fillY);
            ctx.strokeStyle = hexToRgba(edge.color, 0.6); ctx.lineWidth = 2.5; ctx.stroke();
            // Arrow tip
            if (edge.progress > 0.8) {
                ctx.fillStyle = hexToRgba(edge.color, 0.8);
                ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x-6, y1-10); ctx.lineTo(x+6, y1-10); ctx.closePath(); ctx.fill();
            }
        }
    });
}

function drawNodes(ctx, W, H) {
    ftGraphNodes.forEach(function(n) {
        var x    = n.x - n.w / 2;
        var y    = n.y - n.h / 2;
        var r    = 10;
        var isA  = n.state === 'active';
        var isD  = n.state === 'done';
        var isH  = ftHoveredNode && ftHoveredNode.id === n.id;
        var isC  = ftClickedNode && ftClickedNode.id === n.id;
        var step = n.step;

        // Pulse ring (ambient glow for hovered/clicked nodes)
        if (isH || isC) {
            var pulse = (Math.sin(ftPulseTime * 2.8 + n.pulsePhase) + 1) / 2;
            ctx.beginPath(); ctx.arc(n.x, n.y, n.w/2 * 0.54 + pulse*12, 0, Math.PI*2);
            ctx.strokeStyle = hexToRgba(n.color, 0.05 + pulse*0.08); ctx.lineWidth = 2+pulse*3; ctx.stroke();
        }

        // Shadow/glow
        if (isA || isH || isC) { ctx.shadowBlur = isC?36:isA?22:14; ctx.shadowColor = n.glowColor; }

        // Background
        var bgA = n.state==='idle' ? 0.06 : isD ? 0.38 : 0.78;
        ctx.fillStyle = hexToRgba(n.color, bgA);
        roundRect(ctx, x, y, n.w, n.h, r); ctx.fill(); ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = hexToRgba(n.color, n.state==='idle'?0.18:isD?0.55:1);
        ctx.lineWidth   = isC?2.5:isA?2:1.5;
        roundRect(ctx, x, y, n.w, n.h, r); ctx.stroke();

        // Left accent stripe
        ctx.fillStyle = hexToRgba(n.color, n.state==='idle'?0.2:0.9);
        roundRect(ctx, x, y, 5, n.h, {tl:r,tr:0,br:0,bl:r}); ctx.fill();

        // ── Header row ──────────────────────────────────────────────
        var hdr   = 48;
        var iconX = x + 24, iconY = y + hdr / 2;
        // Icon circle
        ctx.beginPath(); ctx.arc(iconX, iconY, 14, 0, Math.PI*2);
        ctx.fillStyle = n.state==='idle' ? hexToRgba(n.color,0.15) : hexToRgba(n.color,0.9); ctx.fill();
        ctx.fillStyle = n.state==='idle' ? hexToRgba(n.color,0.7)  : n.textColor;
        ctx.font = 'bold 12px Inter,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(TYPE_ICONS[n.type]||'●', iconX, iconY);

        // Title
        var tx = x + 46, tmaxW = n.w - 60;
        ctx.fillStyle   = n.state==='idle' ? 'rgba(127,132,142,0.55)' : '#e8eaed';
        ctx.font        = (isA?'bold ':'') + '13px Inter,sans-serif';
        ctx.textAlign   = 'left'; ctx.textBaseline = 'middle';
        var lbl = n.label;
        if (ctx.measureText(lbl).width > tmaxW) { while(lbl.length>3 && ctx.measureText(lbl+'…').width>tmaxW) lbl=lbl.slice(0,-1); lbl+='…'; }
        ctx.fillText(lbl, tx, iconY - 6);

        // Type tag
        ctx.fillStyle = hexToRgba(n.color, n.state==='idle'?0.3:0.75);
        ctx.font      = '9px Inter,sans-serif';
        ctx.fillText(TYPE_LABELS[n.type]||n.type.toUpperCase(), tx, iconY+9);

        // Step badge (top right)
        ctx.fillStyle = hexToRgba(n.color, 0.45); ctx.font='bold 8px monospace';
        ctx.textAlign='right'; ctx.textBaseline='top';
        ctx.fillText(String(n.id+1), x+n.w-8, y+6); ctx.textBaseline='middle';

        // ── Rich detail rows (only when not idle) ────────────────────
        if (n.state !== 'idle') {
            var ry = y + hdr + 4;

            // Code snippet
            if (step.codeSnippet) {
                ry = drawCodeBlock(ctx, step.codeSnippet, x+8, ry, n.w-16, n.color);
            }

            // Condition
            if (step.condition) {
                ry = drawInfoRow(ctx, '?', step.condition + ' → ' + (step.conditionResult===false?'FALSE':'TRUE'),
                    step.conditionResult===false?'#e06c75':'#98c379', x+8, ry, n.w-16);
            }

            // Variable mutations
            if (Array.isArray(step.variables) && step.variables.length > 0) {
                step.variables.forEach(function(v) {
                    var val = v.name + ': ' + truncate(String(v.before||'?'), 18) + ' → ' + truncate(String(v.after||'?'), 18);
                    ry = drawInfoRow(ctx, '✎', val, '#e5c07b', x+8, ry, n.w-16);
                });
            }

            // Return value
            if (step.returns) {
                ry = drawInfoRow(ctx, '↩', 'returns: ' + truncate(String(step.returns), 40), '#98c379', x+8, ry, n.w-16);
            }

            // Side effects
            if (Array.isArray(step.sideEffects) && step.sideEffects.length > 0) {
                step.sideEffects.forEach(function(se) {
                    ry = drawInfoRow(ctx, '⇒', truncate(se, 52), '#56b6c2', x+8, ry, n.w-16);
                });
            }

            // Done tick
            if (isD) {
                ctx.fillStyle = hexToRgba(n.color, 0.5); ctx.font='bold 10px sans-serif';
                ctx.textAlign='right'; ctx.textBaseline='bottom';
                ctx.fillText('✓', x+n.w-8, y+n.h-6); ctx.textAlign='left'; ctx.textBaseline='middle';
            }
        }
    });
}

function drawCodeBlock(ctx, code, x, y, maxW, accentColor) {
    var lines   = code.split('\n');
    var lineH   = 15;
    var padX    = 8, padY = 6;
    var bh      = lines.length * lineH + padY * 2;
    // Background box
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, x, y, maxW, bh, 4); ctx.fill();
    ctx.strokeStyle = hexToRgba(accentColor, 0.25); ctx.lineWidth=1;
    roundRect(ctx, x, y, maxW, bh, 4); ctx.stroke();
    // Code text
    ctx.fillStyle = '#98c379'; ctx.font = '10px "Roboto Mono",monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    lines.forEach(function(line, li) {
        var trimmed = line.substring(0, 60);
        ctx.fillText(trimmed, x+padX, y+padY+li*lineH);
    });
    ctx.textBaseline = 'middle';
    return y + bh + 5;
}

function drawInfoRow(ctx, icon, text, color, x, y, maxW) {
    var ROW = 18;
    // Icon badge
    ctx.fillStyle = hexToRgba(color, 0.18); roundRect(ctx, x, y+1, 18, ROW-2, 3); ctx.fill();
    ctx.fillStyle = color; ctx.font='bold 9px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(icon, x+9, y+ROW/2);
    // Text
    ctx.fillStyle = 'rgba(200,210,220,0.85)'; ctx.font='10px Inter,sans-serif';
    ctx.textAlign='left'; ctx.textBaseline='middle';
    var safe = truncate(text, 70);
    ctx.fillText(safe, x+22, y+ROW/2);
    return y + ROW + 2;
}

function drawScrollHint(ctx, W, H) {
    // Show a subtle scroll indicator when content is taller than the canvas
    if (ftGraphNodes.length === 0) return;
    var lastN  = ftGraphNodes[ftGraphNodes.length-1];
    var bottom = lastN.y + lastN.h/2 + ftScrollY;
    if (bottom > H - 10) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.moveTo(W/2-16,H-18); ctx.lineTo(W/2+16,H-18); ctx.lineTo(W/2,H-6); ctx.closePath(); ctx.fill();
    }
    if (ftScrollY < 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.moveTo(W/2-16,14); ctx.lineTo(W/2+16,14); ctx.lineTo(W/2,2); ctx.closePath(); ctx.fill();
    }
}

function truncate(str, n) { return str.length > n ? str.substring(0,n)+'…' : str; }

function roundRect(ctx, x, y, w, h, r) {
    var tl,tr,br,bl;
    if (typeof r==='object') { tl=r.tl||0;tr=r.tr||0;br=r.br||0;bl=r.bl||0; } else { tl=tr=br=bl=r; }
    ctx.beginPath();
    ctx.moveTo(x+tl,y); ctx.lineTo(x+w-tr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+tr);
    ctx.lineTo(x+w,y+h-br); ctx.quadraticCurveTo(x+w,y+h,x+w-br,y+h);
    ctx.lineTo(x+bl,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-bl);
    ctx.lineTo(x,y+tl); ctx.quadraticCurveTo(x,y,x+tl,y); ctx.closePath();
}

function hexToRgba(hex, a) {
    if (!hex||hex[0]!=='#') return 'rgba(127,132,142,'+a+')';
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
}

function screenToWorld(sx, sy) {
    // Canvas is absolute-positioned inside a scrollable wrapper.
    // sx/sy are already relative to canvas top-left (from getBoundingClientRect),
    // so world coords == canvas coords (no transform applied in drawFrame).
    return { x: sx, y: sy };
}

function getNodeAtPoint(mx, my) {
    var w = screenToWorld(mx, my);
    for (var i = ftGraphNodes.length - 1; i >= 0; i--) {
        var n = ftGraphNodes[i];
        if (w.x >= n.x-n.w/2 && w.x <= n.x+n.w/2 && w.y >= n.y-n.h/2 && w.y <= n.y+n.h/2) return n;
    }
    return null;
}

function showNodeTooltip(node, mx, my) {
    var tt = document.getElementById('ft-tooltip'); if (!tt) return;
    var col = getStepColor(node.type);
    var h   = '<div class="tt-title">'+escapeHtml(node.label)+'</div>';
    h += '<span class="tt-type" style="background:'+hexToRgba(col.node,0.2)+';color:'+col.node+'">'+escapeHtml(node.type)+'</span>';
    if (node.step.detail) h += '<div class="tt-detail">'+escapeHtml(node.step.detail.substring(0,140))+'</div>';
    h += '<div style="font-size:0.66rem;color:#5c6370;margin-top:4px">Click for full details</div>';
    tt.innerHTML = h; tt.style.display = 'block';
    var wr = document.getElementById('ft-canvas-wrapper').getBoundingClientRect();
    var tw = tt.offsetWidth||200, th = tt.offsetHeight||80;
    var tx = mx+14, ty = my-10;
    if (tx+tw > wr.width-10)  tx = mx-tw-10;
    if (ty+th > wr.height-10) ty = wr.height-th-10;
    if (ty<4) ty=4;
    tt.style.left=tx+'px'; tt.style.top=ty+'px';
}

function hideTooltip() {
    var tt = document.getElementById('ft-tooltip'); if (tt) tt.style.display='none';
}

function openDetailDrawer(node) {
    var drawer = document.getElementById('ft-detail-drawer');
    var title  = document.getElementById('ft-detail-title');
    var body   = document.getElementById('ft-detail-body');
    if (!drawer||!title||!body) return;
    ftClickedNode = node;
    var step = node.step, col = getStepColor(node.type);

    title.innerHTML = '<span style="color:'+col.node+'">'+escapeHtml(node.label)+'</span>'+
        ' <span style="font-size:0.7rem;color:#5c6370">'+escapeHtml(node.type)+'</span>';

    var h = '';
    if (flowTracerState.summary && node.id===0) {
        h += '<p style="color:#abb2bf;font-style:italic;margin-bottom:8px">'+escapeHtml(flowTracerState.summary)+'</p>';
    }
    if (step.detail) h += '<p>'+escapeHtml(step.detail)+'</p>';

    if (step.codeSnippet) {
        h += '<div class="ft-drawer-section-label">Code</div>';
        h += '<code data-snippet="'+escapeHtml(step.codeSnippet)+'" data-node-id="'+escapeHtml(step.nodeId||'')+'" style="cursor:pointer">'+escapeHtml(step.codeSnippet)+'</code>';
    }
    if (step.condition) {
        h += '<div class="ft-drawer-section-label">Condition</div>';
        h += '<div class="ft-drawer-row" style="color:'+(step.conditionResult===false?'#e06c75':'#98c379')+'">'+
            escapeHtml(step.condition)+' → <strong>'+(step.conditionResult===false?'FALSE':'TRUE')+'</strong></div>';
    }
    if (Array.isArray(step.variables) && step.variables.length) {
        h += '<div class="ft-drawer-section-label">Variables</div>';
        step.variables.forEach(function(v) {
            h += '<div class="ft-drawer-row"><span class="ft-var-name">'+escapeHtml(v.name)+'</span>'+
                ' <span class="ft-var-before">'+escapeHtml(String(v.before||'?'))+'</span>'+
                ' <span class="ft-var-arrow">→</span>'+
                ' <span class="ft-var-after">'+escapeHtml(String(v.after||'?'))+'</span></div>';
        });
    }
    if (step.returns) {
        h += '<div class="ft-drawer-section-label">Returns</div>';
        h += '<div class="ft-drawer-row" style="color:#98c379">'+escapeHtml(String(step.returns))+'</div>';
    }
    if (Array.isArray(step.sideEffects) && step.sideEffects.length) {
        h += '<div class="ft-drawer-section-label">Side Effects</div>';
        step.sideEffects.forEach(function(se) {
            h += '<div class="ft-drawer-row">⇒ '+escapeHtml(se)+'</div>';
        });
    }
    if (step.nodeId) {
        h += '<span class="ft-detail-node-link" data-node-id="'+escapeHtml(step.nodeId)+'">→ Jump to '+escapeHtml(step.nodeId)+' in code</span>';
    }
    body.innerHTML = h;

    body.querySelectorAll('code').forEach(function(el) {
        el.addEventListener('click', function() {
            var nid = el.dataset.nodeId;
            if (nid && nid!=='null' && nid!=='') jumpToNodeInCode(nid);
            else searchAndJumpToSnippet(el.dataset.snippet||'');
        });
    });
    body.querySelectorAll('.ft-detail-node-link').forEach(function(el) {
        el.addEventListener('click', function() { jumpToNodeInCode(el.dataset.nodeId); });
    });
    drawer.classList.add('ft-drawer-open');
}


function bindFlowTracerEvents() {
    var runBtn      = document.getElementById('ft-run-button');
    var clearBtn    = document.getElementById('ft-clear-button');
    var scanBtn     = document.getElementById('ft-scan-button');
    var replayBtn   = document.getElementById('ft-replay-button');
    var detailClose = document.getElementById('ft-detail-close');

    if (runBtn)      runBtn.addEventListener('click', runFlowTrace);
    if (clearBtn)    clearBtn.addEventListener('click', clearFlowTrace);
    if (scanBtn)     scanBtn.addEventListener('click', renderFlowTriggerList);
    if (replayBtn)   replayBtn.addEventListener('click', function() {
        if (flowTracerState.lastTrace) buildAndAnimateGraph(flowTracerState.lastTrace.steps || []);
    });
    var ttsBtn = document.getElementById('ft-tts-button');
    if (ttsBtn) ttsBtn.addEventListener('click', function() {
        ftTtsEnabled = !ftTtsEnabled;
        ttsBtn.textContent = ftTtsEnabled ? '🔊 Read Out' : '🔇 Read Out';
        ttsBtn.classList.toggle('ft-tts-active', ftTtsEnabled);
        if (!ftTtsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
    });
    if (detailClose) detailClose.addEventListener('click', function() {
        var drawer = document.getElementById('ft-detail-drawer');
        if (drawer) drawer.classList.remove('ft-drawer-open');
        ftClickedNode = null;
    });

    var selectorInput = document.getElementById('ft-target-selector');
    if (selectorInput) selectorInput.addEventListener('keydown', function(e) { if (e.key==='Enter') runFlowTrace(); });

    var canvas = document.getElementById('ft-canvas');

    // Zoom helper — zooms towards a focal point (canvas-relative px coords)
    function applyZoom(newScale, focalX, focalY) {
        var dpr = window.devicePixelRatio || 1;
        var W   = canvas.width  / dpr;
        var H   = canvas.height / dpr;
        newScale = Math.max(FT_SCALE_MIN, Math.min(FT_SCALE_MAX, newScale));
        // Adjust pan so the focal point stays fixed under the cursor
        var oldScale = ftScale;
        var scaleDelta = newScale / oldScale;
        ftPanX  = focalX - scaleDelta * (focalX - ftPanX);
        ftScrollY = (focalY - H / 2) - scaleDelta * ((focalY - H / 2) - ftScrollY);
        ftScale = newScale;
        updateZoomLabel();
    }

    function updateZoomLabel() {
        var lbl = document.getElementById('ft-zoom-label');
        if (lbl) lbl.textContent = Math.round(ftScale * 100) + '%';
    }

    function fitToScreen() {
        if (!ftGraphNodes.length) { ftScale = 1; ftScrollY = 0; ftPanX = 0; updateZoomLabel(); return; }
        var dpr = window.devicePixelRatio || 1;
        var W   = canvas.width  / dpr;
        var H   = canvas.height / dpr;
        var lastN  = ftGraphNodes[ftGraphNodes.length - 1];
        var totalH = lastN.y + lastN.h / 2 + 20;
        var maxW   = ftGraphNodes.reduce(function(m,n){return Math.max(m,n.w);}, 0) + 40;
        var scaleH = (H - 40) / totalH;
        var scaleW = (W - 40) / maxW;
        ftScale   = Math.max(FT_SCALE_MIN, Math.min(FT_SCALE_MAX, Math.min(scaleH, scaleW)));
        ftScrollY = 0;
        ftPanX    = 0;
        updateZoomLabel();
    }

    // Wire zoom buttons (kept for compatibility — zoom via wrapper scroll)
    var zoomInBtn  = document.getElementById('ft-zoom-in');
    var zoomOutBtn = document.getElementById('ft-zoom-out');
    var fitBtn     = document.getElementById('ft-zoom-fit');
    if (zoomInBtn)  zoomInBtn.addEventListener('click',  function() { /* no-op: canvas is scroll-navigated */ });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { /* no-op */ });
    if (fitBtn)     fitBtn.addEventListener('click',     function() {
        var wr = document.getElementById('ft-canvas-wrapper');
        if (wr) { wr.scrollLeft = 0; wr.scrollTop = 0; }
    });

    if (canvas) {
        // Pointer events relative to the canvas element itself
        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            var mx = e.clientX - rect.left, my = e.clientY - rect.top;

            if (ftDragStart && ftDragStart.type === 'pan') {
                var wrapper2 = document.getElementById('ft-canvas-wrapper');
                if (wrapper2) {
                    wrapper2.scrollLeft = ftDragStart.scrollLeft0 - (e.clientX - ftDragStart.startX);
                    wrapper2.scrollTop  = ftDragStart.scrollTop0  - (e.clientY - ftDragStart.startY);
                }
                canvas.style.cursor = 'grabbing';
                return;
            }

            var node = getNodeAtPoint(mx, my);
            ftHoveredNode = node;
            if (node) { canvas.style.cursor = 'pointer'; showNodeTooltip(node, mx, my); }
            else       { canvas.style.cursor = 'grab';   hideTooltip(); }
        });

        canvas.addEventListener('mouseleave', function() {
            ftHoveredNode = null; hideTooltip(); ftDragStart = null;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mousedown', function(e) {
            if (e.button === 0) {
                e.preventDefault();
                var wrapper2 = document.getElementById('ft-canvas-wrapper');
                ftDragStart = {
                    type: 'pan',
                    startX: e.clientX,
                    startY: e.clientY,
                    scrollLeft0: wrapper2 ? wrapper2.scrollLeft : 0,
                    scrollTop0:  wrapper2 ? wrapper2.scrollTop  : 0
                };
                canvas.style.cursor = 'grabbing';
            }
        });

        canvas.addEventListener('mouseup', function(e) {
            if (ftDragStart && ftDragStart.type === 'pan') {
                var movedX = Math.abs(e.clientX - ftDragStart.startX);
                var movedY = Math.abs(e.clientY - ftDragStart.startY);
                ftDragStart = null;
                canvas.style.cursor = 'grab';
                if (movedX > 6 || movedY > 6) return; // was a drag, not a click
            }
            var rect = canvas.getBoundingClientRect();
            var node = getNodeAtPoint(e.clientX - rect.left, e.clientY - rect.top);
            if (node) openDetailDrawer(node);
        });

        // Touch: single finger pan, two finger pinch-to-zoom
        canvas.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                ftPinchDist0  = Math.sqrt(dx*dx + dy*dy);
                ftPinchScale0 = ftScale;
                ftDragStart   = null;
            } else if (e.touches.length === 1) {
                var wrapper2 = document.getElementById('ft-canvas-wrapper');
                ftDragStart = {
                    type: 'pan',
                    startX: e.touches[0].clientX,
                    startY: e.touches[0].clientY,
                    scrollLeft0: wrapper2 ? wrapper2.scrollLeft : 0,
                    scrollTop0:  wrapper2 ? wrapper2.scrollTop  : 0
                };
                ftPinchDist0 = null;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1 && ftDragStart) {
                var wrapper2 = document.getElementById('ft-canvas-wrapper');
                if (wrapper2) {
                    wrapper2.scrollLeft = ftDragStart.scrollLeft0 - (e.touches[0].clientX - ftDragStart.startX);
                    wrapper2.scrollTop  = ftDragStart.scrollTop0  - (e.touches[0].clientY - ftDragStart.startY);
                }
            }
        }, { passive: true });

        canvas.addEventListener('touchend', function(e) {
            if (e.touches.length === 0 && ftDragStart) {
                var movedX = Math.abs(e.changedTouches[0].clientX - ftDragStart.startX);
                var movedY = Math.abs(e.changedTouches[0].clientY - ftDragStart.startY);
                if (movedX < 8 && movedY < 8) {
                    var rect  = canvas.getBoundingClientRect();
                    var touch = e.changedTouches[0];
                    var node  = getNodeAtPoint(touch.clientX - rect.left, touch.clientY - rect.top);
                    if (node) openDetailDrawer(node);
                }
                ftDragStart = null;
            }
        }, { passive: true });
    }

    window.addEventListener('resize', function() {
        if (flowTracerState.lastTrace && flowTracerState.lastTrace.steps) {
            stopCanvasAnimation();
            setTimeout(function() {
                buildAndAnimateGraph(flowTracerState.lastTrace.steps);
            }, 120);
        }
    });

    // Natural language prompt flow generation
    var nlPromptBtn = document.getElementById('ft-nl-generate-button');
    var nlPromptInput = document.getElementById('ft-nl-prompt-input');
    if (nlPromptBtn && nlPromptInput) {
        nlPromptBtn.addEventListener('click', runNlFlowGenerate);
        nlPromptInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runNlFlowGenerate();
        });
    }

    var configToggle = document.getElementById('ft-config-toggle');
    var leftPanel    = document.getElementById('ft-left-panel');
    if (configToggle && leftPanel) {
        configToggle.addEventListener('click', function() {
            var isOpen = leftPanel.classList.toggle('ft-config-open');
            configToggle.classList.toggle('ft-open', isOpen);
            var arrow = configToggle.querySelector('.ft-mobile-config-arrow');
            var lbl   = configToggle.querySelector('.ft-mobile-config-label');
            if (arrow) arrow.textContent = isOpen ? '▲' : '▼';
            if (lbl)   lbl.textContent   = isOpen ? '⚙ Hide Config' : '⚙ Configure Trigger';
        });
    }
}

async function runNlFlowGenerate() {
    var inputEl = document.getElementById('ft-nl-prompt-input');
    var btn     = document.getElementById('ft-nl-generate-button');
    var statusEl = document.getElementById('ft-nl-status');
    if (!inputEl) return;
    var prompt = inputEl.value.trim();
    if (!prompt) { if (statusEl) { statusEl.textContent = 'Please describe your flow first.'; statusEl.style.color = '#e06c75'; } return; }

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
    if (statusEl) { statusEl.textContent = 'Calling AI…'; statusEl.style.color = '#c678dd'; }

    // Collect node names from vibeTree for context
    var nodeNames = [];
    if (typeof vibeTree !== 'undefined') {
        (function walk(n) {
            if (n && n.id) nodeNames.push(n.id);
            if (n && n.children) n.children.forEach(walk);
        })(vibeTree);
    }

    var systemPrompt = [
        'You are a flow trace generator for a web app called Vibe.',
        'Given a natural language description of a flow (including node names and logic), produce a JSON object with:',
        '  "summary": string — one sentence overview',
        '  "steps": array of step objects, each with:',
        '    "title": string (short, e.g. function or node name)',
        '    "type": one of trigger|handler|condition|mutation|dom|network|state|output|error',
        '    "detail": string (1-2 sentence explanation)',
        '    "codeSnippet": string|null (optional short code snippet)',
        '    "nodeId": string|null (matching node ID if known)',
        '    "condition": string|null,',
        '    "conditionResult": boolean|null,',
        '    "variables": array of {name,before,after}|null,',
        '    "returns": string|null,',
        '    "sideEffects": array of strings|null',
        'Available node IDs in this project: ' + (nodeNames.slice(0,40).join(', ') || '(none loaded)'),
        'Return ONLY valid JSON — no markdown fences, no preamble.'
    ].join('\n');

    try {
        var raw = await callAI(systemPrompt, prompt, true);
        var clean = raw.trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();
        var traceData = JSON.parse(clean);
        if (!traceData.steps || !Array.isArray(traceData.steps)) throw new Error('No steps array in response');

        if (statusEl) { statusEl.textContent = traceData.steps.length + ' steps generated'; statusEl.style.color = '#98c379'; }

        var placeholder = document.getElementById('ft-placeholder');
        var stepCountEl = document.getElementById('ft-step-count');
        var replayBtn   = document.getElementById('ft-replay-button');
        if (placeholder) placeholder.style.display = 'none';
        if (replayBtn)   replayBtn.style.display = '';
        if (stepCountEl) stepCountEl.textContent = traceData.steps.length + ' node' + (traceData.steps.length !== 1 ? 's' : '');

        flowTracerState.lastTrace = traceData;
        flowTracerState.summary   = traceData.summary || '';
        buildAndAnimateGraph(traceData.steps);

    } catch(e) {
        if (statusEl) { statusEl.textContent = 'Error: ' + e.message; statusEl.style.color = '#e06c75'; }
        console.error('NL Flow Generate error:', e);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '✦ Generate Flow'; }
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
    const storageType = document.querySelector('input[name="projectStorage"]:checked')?.value || 'cloud';
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

        // Collect reference images from the project creation form
        const refImages = (window._getProjectImages && window._getProjectImages()) || [];

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
        vibeTree.children = await generateCompleteSubtree(vibeTree, (statusMsg) => {
            if (generationStatusText) generationStatusText.textContent = statusMsg;
        }, refImages);

        currentProjectId = projectId;
        currentProjectStorageType = storageType;
        updateProjectActionButtonStates();
        updateSaveButtonStates();
        resetHistory();
        
        liveCodeOutput.textContent = generateFullCodeString(vibeTree, currentUser.userId, currentProjectId);
        generationStatusText.textContent = 'Project generated! Finalizing...';

        autoSaveProject();
        saveSessionMetadata();

        // Log creation to Jarvis change log
        if (window.jrvLogChange) window.jrvLogChange(projectId, 'project-created', prompt.slice(0, 150));
        if (window._clearProjectImages) window._clearProjectImages();

        await populateProjectList(storageType);
        
        storageToggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.storage === storageType));

        refreshAllUI();
        switchToTab('preview');
        console.log(`New project '${currentProjectId}' created in ${storageType} storage.`);
    } catch (e) {
        console.error('Project generation failed:', e);
        generationStatusText.textContent = 'Generation failed.';
        alert(`Failed to generate project: ${formatProjectCreationError(e, storageType)}`);
        newProjectContainer.style.display = 'block';
    }
}


/**
 * Builds a clearer alert message for project-creation failures. Specifically
 * calls out the common case where a Cloud-storage network error means the
 * user can unblock themselves right now by switching to Local storage,
 * instead of just surfacing the raw fetch error.
 */
function formatProjectCreationError(e, storageType) {
    const isNetworkError = /Network error/i.test(e.message || '');
    if (isNetworkError && storageType === 'cloud') {
        return `${e.message}\n\nQuick workaround: switch "Save Location" to Local and try again — this bypasses the cloud backend entirely. If you want cloud storage working, check your Apps Script deployment's "Who has access" setting (see console for details).`;
    }
    return e.message;
}

async function handleStartIterativeProjectBuild() {
    const storageType = document.querySelector('input[name="projectStorage"]:checked')?.value || 'cloud';
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

        const existing = storageType === 'cloud' 
            ? await api.listProjects(currentUser.userId)
            : await localApi.listProjects();
            
        let projectId = desiredId;
        let suffix = 2;
        while (existing.includes(projectId)) projectId = `${desiredId}-${suffix++}`;

        currentProjectId = projectId;
        currentProjectStorageType = storageType;
        updateProjectActionButtonStates();
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
        alert(`Failed to start iterative build: ${formatProjectCreationError(e, storageType)}`);
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

    // ── Fix: ensure toolbar dropdowns/menus sit above the preview iframe ──
    (function injectToolbarZIndexFix() {
        const style = document.createElement('style');
        style.id = 'vibe-toolbar-zindex-fix';
        style.textContent = `
            /* Ensure any dropdown/popup panel in the toolbar clears the preview iframe */
            .toolbar-dropdown,
            .more-options-panel,
            .more-options-menu,
            .overflow-menu,
            [class*="more-menu"],
            [class*="toolbar-menu"],
            [id*="more-menu"],
            [id*="more-options"],
            [id*="overflow-menu"] {
                z-index: 10000 !important;
                position: relative;
            }
            /* Bootstrap / generic dropdown menus inside the toolbar */
            .navbar .dropdown-menu,
            .main-toolbar .dropdown-menu,
            .dropdown-menu.show,
            .toolbar .dropdown-menu,
            #main-toolbar .dropdown-menu,
            .app-header .dropdown-menu,
            .top-bar .dropdown-menu {
                z-index: 10000 !important;
            }
            /* Give the header a stacking context above the preview iframe */
            .app-header,
            .main-toolbar,
            #main-toolbar,
            .top-toolbar,
            .vibe-header,
            header.navbar {
                position: relative;
                z-index: 9500;
            }
        `;
        document.head.appendChild(style);

        // Dynamic fallback: whenever a child of the toolbar becomes visible ensure
        // its z-index is high enough to clear the game / preview iframe.
        const toolbar = document.querySelector(
            '.app-header, #main-toolbar, .top-toolbar, .vibe-header, header, .navbar'
        );
        if (toolbar) {
            const observer = new MutationObserver(() => {
                toolbar.querySelectorAll('[class*="menu"],[class*="dropdown"],[class*="popup"],[class*="panel"]').forEach(el => {
                    const computed = window.getComputedStyle(el);
                    if (computed.display !== 'none' && computed.visibility !== 'hidden') {
                        const z = parseInt(computed.zIndex, 10);
                        if (isNaN(z) || z < 9000) el.style.zIndex = '10000';
                    }
                });
            });
            observer.observe(toolbar, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        }
    })();
    
    bindEventListeners();
    
    SuggestionEngine.attachToInputs();
    
    checkLoggedInState();
    checkGithubLoginState(); 

    // Wait slightly for auth states to settle before restoring the project session
    setTimeout(restoreSession, 100);
}


function exposeVibeGlobals() {
    const exposeValue = (name, value) => {
        try {
            Object.defineProperty(window, name, {
                value,
                writable: true,
                configurable: true
            });
        } catch (e) {
            window[name] = value;
        }
    };
    const exposeState = (name, getter, setter) => {
        try {
            Object.defineProperty(window, name, {
                get: getter,
                set: setter,
                configurable: true
            });
        } catch (e) {
            // If a non-configurable property already exists, leave the API object below as the source of truth.
        }
    };

    exposeState('currentUser', () => currentUser, value => { currentUser = value; });
    exposeState('_currentUser', () => currentUser, value => { currentUser = value; });
    exposeState('githubUser', () => githubUser, value => { githubUser = value; });
    exposeState('currentProjectId', () => currentProjectId, value => { currentProjectId = value; });
    exposeState('currentProjectStorageType', () => currentProjectStorageType, value => { currentProjectStorageType = value; });
    exposeState('currentProjectGithubSource', () => currentProjectGithubSource, value => { currentProjectGithubSource = value; });
    exposeState('vibeTree', () => vibeTree, value => { vibeTree = value; });
    exposeState('taskQueue', () => taskQueue, value => { taskQueue = Array.isArray(value) ? value : taskQueue; });
    exposeState('isTaskQueueRunning', () => isTaskQueueRunning, value => { isTaskQueueRunning = !!value; });
    exposeState('waitingForAgentConfirmation', () => waitingForAgentConfirmation, value => { waitingForAgentConfirmation = !!value; });
    exposeState('currentAgentTaskContext', () => currentAgentTaskContext, value => { currentAgentTaskContext = value; });

    exposeValue('api', api);
    exposeValue('localApi', localApi);
    exposeValue('vibeEventBus', vibeEventBus);
    exposeValue('AUTO_PILOT_EVENTS', AUTO_PILOT_EVENTS);
    exposeValue('switchToTab', switchToTab);
    exposeValue('showFullCode', showFullCode);
    exposeValue('refreshAllUI', refreshAllUI);
    exposeValue('applyVibes', applyVibes);
    exposeValue('populateProjectList', populateProjectList);
    exposeValue('handleLoadProject', handleLoadProject);
    exposeValue('handleDeleteProject', handleDeleteProject);
    exposeValue('handleFileUpload', handleFileUpload);
    exposeValue('handleZipUpload', handleZipUpload);
    exposeValue('buildCombinedHtmlFromZip', buildCombinedHtmlFromZip);
    exposeValue('handleShareProject', handleShareProject);
    exposeValue('openAiStructureModal', openAiStructureModal);
    exposeValue('autoSaveProject', autoSaveProject);
    exposeValue('saveSessionMetadata', saveSessionMetadata);
    exposeValue('compressProjectData', compressProjectData);
    exposeValue('decompressProjectData', decompressProjectData);
    exposeValue('renderComponentList', renderComponentList);
    exposeValue('callAI', callAI);

    window.vibeAPI = {
        callAI,
        switchToTab,
        getCurrentProject: () => ({ id: currentProjectId, storageType: currentProjectStorageType, tree: vibeTree }),
        setCurrentProject: ({ id, storageType, tree }) => {
            if (id !== undefined) currentProjectId = id;
            if (storageType !== undefined) currentProjectStorageType = storageType;
            if (tree !== undefined) vibeTree = tree;
            updateSaveButtonStates();
            updateProjectActionButtonStates();
        },
        refreshUI: refreshAllUI,
        applyVibes,
        handleQuickReply,
        handleFileUpload,
        handleZipUpload,
        shareProject: handleShareProject,
        openAiStructureModal
    };
}

exposeVibeGlobals();

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


// Refresh the global API after startup in case browser extensions or inline helpers touched it.
exposeVibeGlobals();

// Expose vision/image functions globally so inline onclick handlers work
window.screenshotAndEdit = screenshotAndEdit;
window.handleImageFileInput = handleImageFileInput;
window.screenshotAndEditWorkshop = screenshotAndEditWorkshop;
window.captureWorkshopPreviewScreenshot = captureWorkshopPreviewScreenshot;
window.addPendingImage = addPendingImage;
window.capturePreviewScreenshot = capturePreviewScreenshot;
window._pendingImages = _pendingImages;
window._refreshImagePreviews = _refreshImagePreviews;

console.log("Vibe Automation API exposed as window.vibeAPI");

/* ═══════════════════════════════════════════════════════════════
   CHECKPOINT SYSTEM
   All functions exposed on window.* so index.html onclick works
   ═══════════════════════════════════════════════════════════════ */

const _checkpointApi = {
    async save(projectId, label, treeData) {
        const db = await getDb();
        const compressed = compressProjectData(treeData);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(CHECKPOINT_STORE_NAME, 'readwrite');
            const store = tx.objectStore(CHECKPOINT_STORE_NAME);
            const req = store.add({ projectId, label: label || `Checkpoint ${new Date().toLocaleString()}`, data: compressed, time: Date.now() });
            req.onsuccess = () => resolve(req.result);
            req.onerror  = (e) => reject(e.target.error);
        });
    },
    async list(projectId) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(CHECKPOINT_STORE_NAME, 'readonly');
            const req = tx.objectStore(CHECKPOINT_STORE_NAME).index('projectId').getAll(IDBKeyRange.only(projectId));
            req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.time - a.time));
            req.onerror  = (e) => reject(e.target.error);
        });
    },
    async load(id) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const req = db.transaction(CHECKPOINT_STORE_NAME, 'readonly').objectStore(CHECKPOINT_STORE_NAME).get(id);
            req.onsuccess = () => req.result ? resolve(req.result) : reject(new Error(`Checkpoint ${id} not found`));
            req.onerror  = (e) => reject(e.target.error);
        });
    },
    async delete(id) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const req = db.transaction(CHECKPOINT_STORE_NAME, 'readwrite').objectStore(CHECKPOINT_STORE_NAME).delete(id);
            req.onsuccess = () => resolve();
            req.onerror  = (e) => reject(e.target.error);
        });
    },
    async deleteAll(projectId) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(CHECKPOINT_STORE_NAME, 'readwrite');
            const idx = tx.objectStore(CHECKPOINT_STORE_NAME).index('projectId');
            const req = idx.openKeyCursor(IDBKeyRange.only(projectId));
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) { tx.objectStore(CHECKPOINT_STORE_NAME).delete(cursor.primaryKey); cursor.continue(); }
                else resolve();
            };
            req.onerror = (e) => reject(e.target.error);
        });
    }
};

// Simple toast (used internally; app may already have one)
function _vibeToast(msg) {
    let t = document.getElementById('_vibe-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_vibe-toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;background:rgba(10,14,28,0.95);border:1px solid #4169e1;border-radius:6px;padding:10px 16px;font-family:"Fira Code",monospace;font-size:0.75rem;color:#87ceeb;pointer-events:none;opacity:0;transition:opacity 0.25s;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._tmr);
    t._tmr = setTimeout(() => { t.style.opacity = '0'; }, 2800);
}

async function _renderCheckpointPanel() {
    const list = document.getElementById('checkpoint-list');
    if (!list) return;
    if (!currentProjectId) { list.innerHTML = '<div class="cp-empty">No project loaded.</div>'; return; }
    list.innerHTML = '<div class="cp-loading">Loading…</div>';
    try {
        const cps = await _checkpointApi.list(currentProjectId);
        if (!cps.length) { list.innerHTML = '<div class="cp-empty">No checkpoints yet.<br><small>Use <strong>+ Save Now</strong> to create one.</small></div>'; return; }
        list.innerHTML = '';
        cps.forEach(cp => {
            const ts = new Date(cp.time).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
            const el = document.createElement('div');
            el.className = 'cp-item';
            const safeLabel = cp.label.replace(/'/g, "\\'").replace(/</g, '&lt;');
            el.innerHTML = `
                <div class="cp-item-info">
                    <span class="cp-label" title="${cp.label}">${cp.label}</span>
                    <span class="cp-time">${ts}</span>
                </div>
                <div class="cp-item-actions">
                    <button class="cp-btn cp-restore" onclick="window._restoreCheckpoint(${cp.id})">⏪ Restore</button>
                    <button class="cp-btn cp-delete"  onclick="window._deleteCheckpoint(${cp.id},'${safeLabel}')">🗑</button>
                </div>`;
            list.appendChild(el);
        });
        const lbl = document.getElementById('cp-project-label');
        if (lbl) lbl.textContent = `Project: ${currentProjectId}`;
    } catch(e) {
        list.innerHTML = '<div class="cp-empty">Error loading checkpoints.</div>';
        console.error('Checkpoint list error:', e);
    }
}

// Expose everything on window so index.html onclick attributes can reach them
window._checkpointApi     = _checkpointApi;
window._renderCheckpointPanel = _renderCheckpointPanel;
window._currentProjectIdForCP = () => currentProjectId;
window._vibeToastPublic = _vibeToast;

window.createCheckpoint = async function(label) {
    if (!currentProjectId) { alert('Save your project first.'); return; }
    const name = label || prompt('Checkpoint name:', `CP ${new Date().toLocaleTimeString()}`);
    if (!name) return;
    try {
        await _checkpointApi.save(currentProjectId, name, vibeTree);
        _vibeToast(`✅ Checkpoint saved: "${name}"`);
        _renderCheckpointPanel();
    } catch(e) { console.error(e); alert('Failed to save checkpoint: ' + e.message); }
};

window._restoreCheckpoint = async function(id) {
    try {
        const cp = await _checkpointApi.load(id);
        if (!confirm(`Restore checkpoint "${cp.label}"?\n\nYour current state will be saved first.`)) return;
        await _checkpointApi.save(currentProjectId, `⟳ Before restore: ${cp.label}`, vibeTree);
        vibeTree = decompressProjectData(cp.data);
        historyState.lastSnapshotSerialized = JSON.stringify(vibeTree);
        refreshAllUI();
        autoSaveProject();
        _vibeToast(`⏪ Restored: "${cp.label}"`);
        _renderCheckpointPanel();
    } catch(e) { console.error(e); alert('Restore failed: ' + e.message); }
};

window._deleteCheckpoint = async function(id, label) {
    if (!confirm(`Delete checkpoint "${label}"?`)) return;
    try { await _checkpointApi.delete(id); _renderCheckpointPanel(); _vibeToast('Checkpoint deleted'); }
    catch(e) { console.error(e); }
};

window.toggleCheckpointPanel = function() {
    const panel = document.getElementById('checkpoint-panel');
    if (!panel) return;
    const open = panel.classList.toggle('open');
    if (open) _renderCheckpointPanel();
};

window.vibeCheckAndFixErrors = async function() {
    switchToTab('console');
    await new Promise(r => setTimeout(r, 300));
    const btns = Array.from(document.querySelectorAll('.fix-error-button:not([disabled])'));
    if (!btns.length) {
        _vibeToast('✅ No console errors found');
        setTimeout(() => switchToTab('preview'), 800);
        return;
    }
    _vibeToast(`🔧 ${btns.length} error(s) found — fixing…`);
    if (currentProjectId) {
        try { await _checkpointApi.save(currentProjectId, `⚡ Before auto-fix (${btns.length} error${btns.length>1?'s':''})`, vibeTree); _renderCheckpointPanel(); }
        catch(e) { console.warn('Pre-fix checkpoint failed:', e); }
    }
    for (const btn of btns) {
        if (btn.disabled) continue;
        const errMsg = btn._errorMessage
            || btn.closest('.console-message')?.textContent?.replace('Fix with AI','').trim()
            || 'Unknown error';
        await handleFixError(errMsg, btn);
        await new Promise(resolve => {
            const t = setTimeout(resolve, 90000);
            const iv = setInterval(() => { if (!isTaskQueueRunning) { clearInterval(iv); clearTimeout(t); resolve(); } }, 600);
        });
        await new Promise(r => setTimeout(r, 500));
    }
    _vibeToast('✅ Done — showing Preview');
    if (currentProjectId) {
        try { await _checkpointApi.save(currentProjectId, `✅ After auto-fix`, vibeTree); _renderCheckpointPanel(); }
        catch(e) {}
    }
    setTimeout(() => switchToTab('preview'), 800);
};




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
            updateProjectActionButtonStates();
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
        // Only clear metadata when project is definitively gone — not on transient IDB/network errors
        const msg = (e && e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('does not exist')) {
            await clearSessionMetadata();
        }
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
        updateProjectActionButtonStates();

        // Create Tree
        vibeTree = {
            id: `raw-${currentProjectId}`,
            type: 'raw-html-container',
            description: `Raw project uploaded from ZIP file: ${file.name}`,
            code: combinedHtml,
            children: []
        };
        updateProjectActionButtonStates();

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

                                                                    

// ══════════════════════════════════════════════════════════════════
// APUI VIBE BRIDGE — exposes vibe tree to the APUI editor panel
// ══════════════════════════════════════════════════════════════════

// ── Pinned-node state shared between app3.js and the APUI iframe ──
const _apuiPinnedNodes = new Set();

function _broadcastPinnedNodes() {
    const frame = document.getElementById('apui-frame');
    if (frame?.contentWindow) {
        frame.contentWindow.postMessage({
            type: 'apui-pinned-nodes',
            pinnedNodes: [..._apuiPinnedNodes]
        }, '*');
    }
}

window.__vibeBridge = {
    // Read the current tree
    getTree: () => vibeTree,

    // Read a flat list of all leaf nodes (editable code nodes)
    getNodes: () => {
        const nodes = [];
        function walk(node) {
            if (!node) return;
            if (node.type !== 'container' && node.code !== undefined) nodes.push(node);
            if (node.children) node.children.forEach(walk);
        }
        walk(vibeTree);
        return nodes;
    },

    // Write new code to a node by id and refresh the UI
    updateNode: (nodeId, newCode, newDescription) => {
        const node = findNodeById(nodeId);
        if (!node) return false;
        recordHistory(`APUI edit: ${nodeId}`);
        if (newCode !== undefined) node.code = String(newCode);
        if (newDescription !== undefined) node.description = newDescription;
        refreshAllUI();
        return true;
    },

    // Run a full AI agent plan (same as the agent panel)
    runAgentPlan: (plan, actions) => {
        executeAgentPlan({ plan, actions }, (msg) => console.log('[APUI]', msg));
    },

    // Call the AI (returns promise of string)
    callAI: (system, user, forJson) => callAI(system, user, forJson),

    // ── Pin / Unpin nodes on the APUI canvas ──
    // Pinned nodes stay visually fixed while the canvas pans; unpinned nodes
    // are rearranged into the free space that surrounds them.
    pinnedNodes: _apuiPinnedNodes,

    pinNode(nodeId) {
        _apuiPinnedNodes.add(nodeId);
        _broadcastPinnedNodes();
    },

    unpinNode(nodeId) {
        _apuiPinnedNodes.delete(nodeId);
        _broadcastPinnedNodes();
    },

    togglePinNode(nodeId) {
        if (_apuiPinnedNodes.has(nodeId)) {
            this.unpinNode(nodeId);
        } else {
            this.pinNode(nodeId);
        }
    },

    isPinned(nodeId) {
        return _apuiPinnedNodes.has(nodeId);
    },

    getPinnedNodes() {
        return [..._apuiPinnedNodes];
    },

    // Subscribe to tree changes — callback is fired after every refreshAllUI
    onRefresh: (callback) => {
        const orig = window.__vibeBridge._refreshCallbacks;
        if (!orig.includes(callback)) orig.push(callback);
    },
    _refreshCallbacks: [],
};

// ── Inject bridge into the APUI iframe so it can talk directly to this window ──
// ══════════════════════════════════════════════════════════════════
// APUI BRIDGE — postMessage-based bidirectional sync
// ══════════════════════════════════════════════════════════════════

let _apuiBridgeListenerAttached = false;

// Register APUI message listener immediately so agent/editor edits
// always sync to APUI regardless of which tab is active
window.addEventListener('message', handleApuiMessage);
_apuiBridgeListenerAttached = true;

function injectBridgeIntoApui() {
    const frame = document.getElementById('apui-frame');
    if (!frame) return;

    const sendTree = () => {
        try {
            frame.contentWindow.postMessage({
                type: 'apui-init',
                vibeTree: JSON.parse(JSON.stringify(vibeTree)),
                projectId: currentProjectId,
                pinnedNodes: [..._apuiPinnedNodes]
            }, '*');
        } catch(e) { /* iframe not ready */ }
    };

    if (frame.contentDocument?.readyState === 'complete') {
        sendTree();
    } else {
        frame.addEventListener('load', sendTree, { once: true });
    }
}

function handleApuiMessage(e) {
    const d = e.data;
    if (!d || d.source !== 'apui-vibe') return;

    switch (d.type) {
        // APUI is asking for the current tree (e.g. on its own init)
        case 'apui-request-tree': {
            const frame = document.getElementById('apui-frame');
            if (frame) {
                frame.contentWindow.postMessage({
                    type: 'apui-init',
                    vibeTree: JSON.parse(JSON.stringify(vibeTree)),
                    projectId: currentProjectId,
                    pinnedNodes: [..._apuiPinnedNodes]
                }, '*');
            }
            break;
        }

        // APUI saved a single node
        case 'apui-node-update': {
            const { nodeId, newCode } = d;
            const node = findNodeById(nodeId);
            if (node && newCode !== undefined) {
                recordHistory('APUI edit: ' + nodeId);
                node.code = String(newCode);
                refreshAllUI();
            }
            break;
        }

        // APUI pushed all dirty nodes at once
        case 'apui-bulk-update': {
            if (!Array.isArray(d.updates)) break;
            recordHistory('APUI bulk update');
            let changed = false;
            for (const { nodeId, newCode, isNew, newNode: nn } of d.updates) {
                if (isNew && nn) {
                    const parent = findNodeById(nn.parentId || vibeTree.id) || vibeTree;
                    if (!parent.children) parent.children = [];
                    if (!findNodeById(nn.id)) { parent.children.push(nn); changed = true; }
                } else {
                    const node = findNodeById(nodeId);
                    if (node && newCode !== undefined) { node.code = String(newCode); changed = true; }
                }
            }
            if (changed) {
                refreshAllUI();
                autoSaveProject();
            }
            break;
        }

        // APUI created a new node
        case 'apui-create-node': {
            const { parentId, newNode: nn } = d;
            if (!nn || findNodeById(nn.id)) break;
            const parent = findNodeById(parentId) || vibeTree;
            if (!parent.children) parent.children = [];
            recordHistory('APUI create: ' + nn.id);
            parent.children.push(nn);
            refreshAllUI();
            break;
        }

        // APUI deleted a node
        case 'apui-delete-node': {
            const { nodeId } = d;
            const deleteFromTree = (node, id) => {
                if (!node.children) return;
                node.children = node.children.filter(c => c.id !== id);
                node.children.forEach(c => deleteFromTree(c, id));
            };
            recordHistory('APUI delete: ' + nodeId);
            deleteFromTree(vibeTree, nodeId);
            refreshAllUI();
            break;
        }

        // APUI pinned / unpinned a node
        case 'apui-pin-node': {
            const { nodeId: pinId, pinned } = d;
            if (!pinId) break;
            if (pinned) {
                _apuiPinnedNodes.add(pinId);
            } else {
                _apuiPinnedNodes.delete(pinId);
            }
            // Echo the current pin set back so all APUI instances stay in sync
            _broadcastPinnedNodes();
            break;
        }

        // APUI toggled a single node's pin state
        case 'apui-toggle-pin': {
            const { nodeId: toggleId } = d;
            if (!toggleId) break;
            if (_apuiPinnedNodes.has(toggleId)) {
                _apuiPinnedNodes.delete(toggleId);
            } else {
                _apuiPinnedNodes.add(toggleId);
            }
            _broadcastPinnedNodes();
            break;
        }

        // APUI requests that Vibe saves to its storage source and sends back updated tree
        case 'apui-request-save': {
            autoSaveProject();
            // Send the freshly-saved tree back so APUI always has the canonical version
            const frame = document.getElementById('apui-frame');
            if (frame?.contentWindow) {
                frame.contentWindow.postMessage({
                    type: 'apui-init',
                    vibeTree: JSON.parse(JSON.stringify(vibeTree)),
                    projectId: currentProjectId,
                    pinnedNodes: [..._apuiPinnedNodes]
                }, '*');
            }
            break;
        }

        case 'apui-navigate': {
            if (d.tabId) switchToTab(d.tabId);
            break;
        }

        case 'apui-check-and-fix-errors': {
            window.vibeCheckAndFixErrors();
            break;
        }

        case 'apui-save-checkpoint': {
            if (currentProjectId) {
                _checkpointApi.save(currentProjectId, d.label || 'Jarvis checkpoint', vibeTree)
                    .then(_renderCheckpointPanel)
                    .catch(e => console.warn('APUI checkpoint failed:', e));
            }
            break;
        }

        // APUI sends a prompt to be run through the native Vibe agent
        case 'apui-run-agent': {
            const { prompt: agentPromptText, attemptId, nodeId: focusNodeId, sessionIntent } = d;
            if (!agentPromptText) break;

            const apuiFrame = document.getElementById('apui-frame');

            // Build a context-rich prompt that includes the node focus and session intent
            let enrichedPrompt = agentPromptText;
            if (focusNodeId) enrichedPrompt = `[Focused node: ${focusNodeId}] ${enrichedPrompt}`;
            if (sessionIntent) enrichedPrompt = `[Session goal: ${sessionIntent}]\n${enrichedPrompt}`;

            // Notify APUI that the agent has started
            if (apuiFrame?.contentWindow) {
                apuiFrame.contentWindow.postMessage({
                    type: 'apui-agent-status',
                    attemptId,
                    status: 'running',
                    message: 'Agent is processing your request…'
                }, '*');
            }

            // Run through the full native Vibe agent pipeline
            (async () => {
                try {
                    const systemPrompt = getAgentSystemPrompt();
                    const fullTreeString = JSON.stringify(vibeTree, null, 2);
                    const fullCurrentCode = generateFullCodeString(vibeTree, currentUser?.userId, currentProjectId);

                    const userPrompt = `User Request: "${enrichedPrompt}"\n\nFull Vibe Tree:\n\`\`\`json\n${fullTreeString}\n\`\`\`\n\nFull Generated Code:\n\`\`\`html\n${fullCurrentCode}\n\`\`\``;

                    const rawResponse = await callAI(systemPrompt, userPrompt, true);
                    const agentDecision = JSON.parse(rawResponse);

                    if (agentDecision.question) {
                        // Agent needs clarification — send question back to APUI
                        if (apuiFrame?.contentWindow) {
                            apuiFrame.contentWindow.postMessage({
                                type: 'apui-agent-status',
                                attemptId,
                                status: 'question',
                                message: agentDecision.question
                            }, '*');
                        }
                        return;
                    }

                    // Collect which nodes were changed
                    const changedNodes = [];
                    executeAgentPlan(agentDecision, (msg, type) => {
                        // Extract node IDs from action log messages
                        const nodeMatch = msg.match(/`([^`]+)`/);
                        if (nodeMatch && type === 'action') changedNodes.push(nodeMatch[1]);
                    });

                    // Save to storage
                    autoSaveProject();

                    // Send success + updated tree back to APUI
                    if (apuiFrame?.contentWindow) {
                        apuiFrame.contentWindow.postMessage({
                            type: 'apui-agent-status',
                            attemptId,
                            status: 'done',
                            plan: agentDecision.plan,
                            changedNodes,
                            message: agentDecision.plan || 'Changes applied.',
                            vibeTree: JSON.parse(JSON.stringify(vibeTree)),
                            projectId: currentProjectId
                        }, '*');
                    }
                } catch (err) {
                    if (apuiFrame?.contentWindow) {
                        apuiFrame.contentWindow.postMessage({
                            type: 'apui-agent-status',
                            attemptId,
                            status: 'error',
                            message: err.message || 'Agent failed.'
                        }, '*');
                    }
                }
            })();
            break;
        }
    }
}




// ══════════════════════════════════════════════════════════════════
// JARVIS IDLE AUTO-TASK
// When the user has been idle for 30 s and a project is loaded,
// Jarvis picks one small improvement task, sends it to the APUI
// PR queue, and waits at least 90 s before doing it again.
// ══════════════════════════════════════════════════════════════════

(function _jarvisIdleLoop() {
    let _lastActivity    = Date.now();
    let _loopRunning     = false;
    let _lastTaskAt      = 0;
    const IDLE_MS        = 30_000;   // idle threshold
    const COOLDOWN_MS    = 90_000;   // minimum gap between tasks
    const POLL_MS        = 5_000;    // how often to check

    // Track user activity
    ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(evt => {
        window.addEventListener(evt, () => { _lastActivity = Date.now(); }, { passive: true });
    });

    function _isIdle() {
        return Date.now() - _lastActivity >= IDLE_MS;
    }

    function _hasProject() {
        return vibeTree && (vibeTree.type === 'raw-html-container' || (vibeTree.children && vibeTree.children.length > 0));
    }

    function _apiKey() {
        try { return localStorage.getItem('apui_gemini_key') || localStorage.getItem('gemini_api_key') || (typeof AppState !== 'undefined' && AppState?.settings?.apiKey) || ''; }
        catch(e) { return ''; }
    }

    async function _pickTask() {
        const key = _apiKey();
        if (!key) return null;

        const nodes = [];
        (function walk(n) {
            if (!n) return;
            nodes.push(n.type + ':' + n.id + (n.description ? ' (' + n.description + ')' : ''));
            (n.children || []).forEach(walk);
        })(vibeTree);

        const projectName = vibeTree.description || currentProjectId || 'current project';
        const prompt = `You are Jarvis. Suggest ONE small improvement for this project.
Project: "${projectName}"
Nodes: ${nodes.slice(0, 20).join(', ')}

Reply with exactly:
TASK: <one sentence describing a specific small improvement to make>

Rules: must improve the existing project, not create a new one. Be concrete and small.`;

        try {
            const raw = await callAI(
                'You are Jarvis, a concise AI coding assistant. Reply only with the TASK line, nothing else.',
                prompt,
                false
            );
            const m = raw && raw.match(/TASK:\s*(.+)/i);
            return m ? m[1].trim() : null;
        } catch(e) {
            console.warn('[Jarvis idle] AI call failed:', e.message);
            return null;
        }
    }

    async function _runOnce() {
        if (_loopRunning) return;
        if (!_isIdle()) return;
        if (!_hasProject()) return;
        if (Date.now() - _lastTaskAt < COOLDOWN_MS) return;
        if (!_apiKey()) return;

        _loopRunning = true;
        try {
            const task = await _pickTask();
            if (!task) return;

            // Send to APUI's Jarvis PR queue via postMessage
            const frame = document.getElementById('apui-frame');
            if (frame?.contentWindow) {
                const key = _apiKey();
                frame.contentWindow.postMessage({
                    type:   'apui-jarvis-start',
                    goal:   task,
                    apiKey: key,
                }, '*');
                _lastTaskAt = Date.now();
                console.log('[Jarvis idle] Task queued:', task);
            }
        } catch(e) {
            console.warn('[Jarvis idle] error:', e.message);
        } finally {
            _loopRunning = false;
        }
    }

    // Poll loop
    setInterval(_runOnce, POLL_MS);

    // Expose for debugging
    window._jarvisIdle = { getLastActivity: () => _lastActivity, isIdle: _isIdle, forceRun: _runOnce };
})();

// ══════════════════════════════════════════════════════════════════
// NERVOUS SYSTEM — Glue Code
// ══════════════════════════════════════════════════════════════════

let nsInitialized = false;

function initOrRefreshNervousSystem() {
    const getTree = () => vibeTree;

    // Wrapper for callAI so nervous-system.js can call it
    const callAIWrapper = (system, user, forJson) => callAI(system, user, forJson);

    // Wrapper for applyActions so nervous-system.js can fix nodes
    const applyActionsWrapper = async (actions) => {
        const mockDecision = { plan: 'Neural repair from Nervous System', actions };
        executeAgentPlan(mockDecision, (msg) => console.log('[NervousSystem]', msg));
    };

    if (!nsInitialized) {
        initNervousSystem(getTree, callAIWrapper, applyActionsWrapper);
        nsInitialized = true;
    } else {
        refreshNervousSystem(vibeTree, {});
    }
  }
