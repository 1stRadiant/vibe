import { DataBase } from './database.js';

const db = new DataBase();

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

// --- On-page Console Logging ---
const consoleOutput = document.getElementById('console-output');

function logToConsole(message, type = 'log') {
    if (!consoleOutput) return;

    const msgEl = document.createElement('div');
    msgEl.className = `console-message log-type-${type}`;

    if (type === 'error') {
        consoleErrorIndicator.classList.add('active');

        let errorMessageText;
        if (message instanceof Error) {
            errorMessageText = `${message.name || 'Error'}: ${message.message}\n${message.stack || ''}`;
        } else if (typeof message === 'object' && message !== null) {
             try {
                errorMessageText = JSON.stringify(message, Object.getOwnPropertyNames(message), 2);
             } catch(e) {
                errorMessageText = String(message);
             }
        } else {
            errorMessageText = String(message);
        }

        const timestamp = `[${new Date().toLocaleTimeString()}] `;
        
        const pre = document.createElement('pre');
        pre.textContent = `${timestamp}${errorMessageText}`;
        msgEl.appendChild(pre);
        
        if (geminiApiKey) {
            const fixButton = document.createElement('button');
            fixButton.textContent = 'Fix with AI';
            fixButton.className = 'fix-error-button action-button';
            fixButton.onclick = () => handleFixError(errorMessageText, fixButton);
            msgEl.appendChild(fixButton);
        }

    } else { 
        let displayMessage;
        if (message instanceof Error) {
            displayMessage = `${message.name || 'Error'}: ${message.message}\n${message.stack || ''}`;
        } else if (typeof message === 'object' && message !== null) {
            try {
                const replacer = (key, value) => {
                     if (typeof value === 'object' && value !== null) {
                        if (Object.keys(value).length === 0) {
                            if (value.toString() !== '[object Object]') {
                                return value.toString();
                            }
                        }
                    }
                    return value;
                };
                displayMessage = JSON.stringify(message, replacer, 2);
                if (displayMessage === '{}') {
                    displayMessage = '[Object (no properties)] ' + message.toString();
                }
            } catch (e) {
                displayMessage = "[Unserializable object]";
            }
        } else {
            displayMessage = String(message);
        }

        const timestamp = `[${new Date().toLocaleTimeString()}] `;
        msgEl.innerHTML = `<pre>${timestamp}${displayMessage}</pre>`;
    }
    
    consoleOutput.appendChild(msgEl);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

/**
 * Logs a detailed, collapsible message to the on-page console, ideal for large data like AI prompts.
 * @param {string} title - The summary text for the collapsible section.
 * @param {string} content - The detailed content to show inside.
 */
function logDetailed(title, content) {
    if (!consoleOutput) return;

    const msgEl = document.createElement('div');
    msgEl.className = `console-message log-type-info`;

    const timestamp = `[${new Date().toLocaleTimeString()}] `;
    const detail = document.createElement('details');
    detail.className = 'console-ai-log';
    
    const summary = document.createElement('summary');
    summary.textContent = ` ${title}`;
    
    const pre = document.createElement('pre');
    pre.textContent = content;

    detail.appendChild(summary);
    detail.appendChild(pre);

    const timestampNode = document.createTextNode(timestamp);
    msgEl.appendChild(timestampNode);
    msgEl.appendChild(detail);

    consoleOutput.appendChild(msgEl);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

const originalConsole = { ...console };
console.log = function(...args) {
    originalConsole.log(...args);
    logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '), 'log');
};
console.error = function(...args) {
    originalConsole.error(...args);
    args.forEach(arg => {
        logToConsole(arg, 'error');
    });
};
console.warn = function(...args) {
    originalConsole.warn(...args);
    logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '), 'warn');
};
console.info = function(...args) {
    originalConsole.info(...args);
    logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '), 'info');
};

window.addEventListener('error', function (e) {
    console.error(e.error || e.message);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// --- End On-page Console Logging ---

let currentProjectId = null;
let agentConversationHistory = [];
let chatConversationHistory = [];

// NEW: State for iterative agent sessions
let iterativeSessionState = {
    isActive: false,
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
    if (label) console.info(`History recorded: ${label}`);
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
    if (geminiApiKey) {
        apiKeyInput.value = geminiApiKey;
        apiKeyStatus.textContent = 'Gemini API Key loaded from storage.';
        apiKeyStatus.style.color = '#98c379';
    } else {
        apiKeyStatus.textContent = 'No Gemini API Key found.';
        apiKeyStatus.style.color = '#e5c07b';
    }
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
    let keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);

    document.querySelectorAll('.update-button').forEach(button => button.disabled = !keyIsAvailable);
    runAgentSingleTaskButton.disabled = !keyIsAvailable;
    startIterativeSessionButton.disabled = !keyIsAvailable;
    sendChatButton.disabled = !keyIsAvailable;
    updateTreeFromCodeButton.disabled = !keyIsAvailable;
    uploadHtmlButton.disabled = !keyIsAvailable;
    generateFlowchartButton.disabled = !keyIsAvailable;
    generateProjectButton.disabled = !keyIsAvailable;
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
    
    console.info(`AI Provider set to: ${currentAIProvider}`);
    console.info(`Gemini model set to: ${geminiModelSelect.value}`);
}

function handleProviderChange() {
    currentAIProvider = aiProviderSelect.value;
    localStorage.setItem('aiProvider', currentAIProvider);
    logToConsole(`AI Provider switched to: ${currentAIProvider}`, 'info');
    updateApiKeyVisibility();
    updateFeatureAvailability();
}

function saveGeminiApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('geminiApiKey', key);
        geminiApiKey = key;
        console.info('Gemini API Key saved!');
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
        console.info('nscale API Key saved!');
    } else {
        localStorage.removeItem('nscaleApiKey');
        nscaleApiKey = '';
        console.warn('nscale API Key cleared.');
    }
    updateApiStatusDisplays();
    updateFeatureAvailability();
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

    if (!node || !codeTextarea) return;

    const newCode = codeTextarea.value;
    if (node.code === newCode) {
        const toggleButton = button.parentElement.querySelector('.toggle-code-button');
        if (toggleButton) toggleButton.click();
        return;
    }

    recordHistory(`Save code for ${nodeId}`);
    node.code = newCode;
    logToConsole(`Code for node '${nodeId}' was manually saved.`, 'info');
    
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

    if (!node) return;
    if (node.description === newDescription && node.type !== 'container' && node.type !== 'head') return;

    recordHistory(`Update description for ${nodeId}`);

    button.disabled = true;
    button.innerHTML = 'Updating... <div class="loading-spinner"></div>';
    logToConsole(`Updating node '${nodeId}' with new description...`, 'info');
    
    node.description = newDescription;

    try {
        if (node.type === 'container') {
            const newChildren = await generateCompleteSubtree(node);
            node.children = newChildren;
            refreshAllUI();
        } else {
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
        logToConsole(`An error occurred during the update: ${error.message}. Check the console for details.`, 'error');
        alert(`An error occurred during the update: ${error.message}.`);
    } finally {
        button.disabled = false;
        button.innerHTML = 'Update Vibe';
    }
}

function refreshAllUI() {
    logToConsole('Refreshing entire UI: Vibe Editor, Website Preview, and Full Code.', 'info');

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

    if (expandedNodeStates.size > 0) {
        expandedNodeStates.forEach((state, nodeId) => {
            const nodeEl = editorContainer.querySelector(`.vibe-node[data-node-id="${nodeId}"]`);
            if (nodeEl) {
                if (state.content) {
                    nodeEl.classList.remove('collapsed');
                }
                const childrenEl = nodeEl.querySelector(':scope > .children');
                const toggleBtn = nodeEl.querySelector(':scope > .vibe-node-header .collapse-toggle');
                if (childrenEl && toggleBtn && state.children) {
                    childrenEl.classList.remove('collapsed');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    toggleBtn.textContent = '▼';
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

    renderFileTree();
    updateUndoRedoUI();
    autoSaveProject();
}

function getComponentContextForAI() {
    const components = db.listComponents();
    if (components.length === 0) return '';

    let contextString = "\n\n--- AVAILABLE CUSTOM COMPONENTS ---\n";
    contextString += "Here is a library of pre-defined components. When a user's request matches the description of one of these, you should use its code as a starting point or insert it directly.\n\n";

    components.forEach(comp => {
        contextString += `### Component: ${comp.name} (ID: ${comp.id})\n`;
        contextString += `**Description:** ${comp.description}\n`;
        if (comp.html) contextString += "**HTML:**\n```html\n" + comp.html + "\n```\n";
        if (comp.css) contextString += "**CSS:**\n```css\n" + comp.css + "\n```\n";
        if (comp.javascript) contextString += "**JavaScript:**\n```javascript\n" + comp.javascript + "\n```\n";
        contextString += "---\n";
    });

    return contextString;
}

async function callAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    console.info('--- Calling AI ---');
    
    let fileContext = '';
    if (currentProjectId) {
        try {
            const files = db.listFiles(currentProjectId);
            if (files.length > 0) {
                const textFiles = [];
                for (const path of files) {
                    const meta = db.getFileMeta(currentProjectId, path);
                    if (meta && !meta.isBinary) {
                        const content = await db.readTextFile(currentProjectId, path);
                        textFiles.push(`--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``);
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

    logToConsole('Sending request to AI model...', 'info');
    logDetailed('System Prompt Sent to AI', augmentedSystemPrompt);
    logDetailed('User Prompt Sent to AI', augmentedUserPrompt);

    if (currentAIProvider === 'nscale') {
        if (streamCallback) console.warn("Streaming is not supported for nscale provider.");
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
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        // --- START OF FIX ---
        // Added maxOutputTokens to prevent the AI from truncating long responses like plans.
        generationConfig: {
            maxOutputTokens: 8192
        }
        // --- END OF FIX ---
    };

    if (forJson && !useStreaming) {
        requestBody.generationConfig.responseMimeType = "application/json";
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
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
                    } catch (e) {}
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
            logDetailed('Full Raw Gemini Response (Streamed)', fullResponseText);
            return fullResponseText;
        }

        const data = await response.json();
        logDetailed('Raw Gemini Response', JSON.stringify(data, null, 2));

        if (!data.candidates || data.candidates.length === 0) {
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                const reason = data.promptFeedback.blockReason;
                const details = data.promptFeedback.safetyRatings ? data.promptFeedback.safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ') : 'No details.';
                throw new Error(`Gemini API request was blocked. Reason: ${reason}. Details: ${details}`);
            }
             throw new Error('Invalid response from Gemini API: No candidates returned.');
        }

        const candidate = data.candidates;

        if (candidate.finishReason && candidate.finishReason !== "STOP") {
            throw new Error(`Gemini API stopped generating prematurely. Reason: ${candidate.finishReason}`);
        }

        if (!candidate.content?.parts?.?.text) {
             throw new Error('Invalid response structure from Gemini API: Missing text content.');
        }

        return candidate.content.parts.text;

    } catch(e) {
        console.error("Error calling Gemini AI:", e);
        logToConsole(`Gemini AI communication failed: ${e.message}`, 'error');
        throw new Error(`Gemini AI communication failed: ${e.message}`);
    }
}

async function generateCompleteSubtree(parentNode, streamCallback = null) {
    logToConsole(`Generating components for "${parentNode.id}"...`, 'info');

    const systemPrompt = `You are an expert system that designs a complete website component hierarchy based on a high-level description. Your task is to generate a valid JSON array of "vibe nodes" that represent the children of a given container.

**OUTPUT:** A single, valid JSON array of vibe node objects. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON array itself. The output MUST be a JSON array [] and nothing else.

**JSON SCHEMA & RULES for each node in the array:**
1.  **id**: A unique, descriptive, kebab-case identifier (e.g., "main-header").
2.  **type**: "head", "html", "css", "javascript", or "js-function".
3.  **description**: A concise, one-sentence summary of what this component does.
4.  **code**: The raw code for the component.
5.  **children**: (Optional) For container html nodes, a nested array of child nodes.
6.  **selector & position**: For html nodes, define their placement. The first HTML node in a children array should use its parent's ID as the selector (e.g., "#${parentNode.id}") and position: "beforeend". Every subsequent HTML node in that same array must use the ID of the *immediately preceding* HTML sibling as its selector and position: "afterend". You MUST assign a unique id attribute to every HTML element that is used as a container or as a selector target.
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
        if (jsonMatch && jsonMatch) {
            jsonResponse = jsonMatch.trim();
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
        logToConsole(`Successfully generated ${childrenArray.length} new components.`, 'info');
        return childrenArray;
    } catch (e) {
        console.error("Failed to parse subtree JSON from AI:", rawResponse);
        throw new Error(`AI returned invalid JSON for the component structure. Original response logged in console. Error: ${e.message}`);
    }
}

async function callNscaleAI(systemPrompt, userPrompt, forJson = false) {
    if (!nscaleApiKey) throw new Error("nscale API key is not set.");
    
    const messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];

    try {
        const response = await fetch(NSCALE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nscaleApiKey}`
            },
            body: JSON.stringify({ model: NSCALE_MODEL, messages: messages })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`nscale API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.choices?.?.message) {
            throw new Error('Invalid response structure from nscale API.');
        }

        let content = data.choices.message.content;
        logDetailed('Raw nscale Response', content);
        
        if (forJson) {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch) {
                content = jsonMatch;
            }
        }
        return content;
    } catch (e) {
        console.error("Error calling nscale AI:", e);
        logToConsole(`nscale AI communication failed: ${e.message}`, 'error');
        throw new Error(`nscale AI communication failed: ${e.message}`);
    }
}

function parseHtmlToVibeTree(fullCode) {
    logToConsole("Parsing HTML to Vibe Tree using client-side logic.", 'info');
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullCode, 'text/html');

    const vibeTree = {
        id: "whole-page",
        type: "container",
        description: `A website with the title: "${doc.title || 'Untitled'}".`,
        children: []
    };

    const htmlNodes = [], cssNodes = [], jsNodes = [];
    
    const headContent = [];
    doc.head.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE && !['STYLE', 'SCRIPT'].includes(child.tagName)) {
            headContent.push(child.outerHTML);
        }
    });
    const headNode = { id: 'head-content', type: 'head', description: 'Page metadata.', code: headContent.join('\n') };

    Array.from(doc.head.querySelectorAll('style')).forEach((styleTag, index) => {
        if (styleTag.textContent.trim()) {
            cssNodes.push({ id: `page-styles-${index + 1}`, type: 'css', description: 'CSS from <style> tag.', code: styleTag.textContent.trim() });
        }
    });

    let lastElementId = null;
    Array.from(doc.body.children).forEach((element, index) => {
        if (element.tagName.toLowerCase() === 'script') return;
        let elementId = element.id || `${element.tagName.toLowerCase()}-section-${index}`;
        element.id = elementId;
        htmlNodes.push({
            id: `html-${elementId}`, type: 'html', description: `<${element.tagName.toLowerCase()}> with ID #${elementId}.`,
            code: element.outerHTML, selector: index === 0 ? '#website-preview' : `#${lastElementId}`,
            position: index === 0 ? 'beforeend' : 'afterend'
        });
        lastElementId = elementId;
    });

    Array.from(doc.querySelectorAll('script')).forEach((scriptTag, index) => {
        if (!scriptTag.src && scriptTag.textContent.trim()) {
            let remainingCode = scriptTag.textContent;
            const functionRegex = /((async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\([\s\S]*?\)\s*\{[\s\S]*?\})/g;
            let match;
            while ((match = functionRegex.exec(scriptTag.textContent)) !== null) {
                const [functionCode, , , functionName] = match;
                const kebabCaseName = functionName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
                jsNodes.push({ id: `function-${kebabCaseName}-${index}`, type: 'js-function', description: `${functionName} function.`, code: functionCode });
                remainingCode = remainingCode.replace(functionCode, '');
            }
            if (remainingCode.trim()) {
                jsNodes.push({ id: `global-script-${index + 1}`, type: 'javascript', description: 'Global JS logic.', code: remainingCode.trim() });
            }
        }
    });
    
    vibeTree.children = [headNode, ...htmlNodes, ...cssNodes, ...jsNodes];
    return vibeTree;
}

async function decomposeCodeIntoVibeTree(fullCode) {
    console.log("Starting code decomposition process...");
    const systemPrompt = `You are an expert system that deconstructs a complete HTML file into a specific hierarchical JSON structure called a "vibe tree". 

**OUTPUT:** A single, valid JSON object representing the vibe tree. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON structure itself.

**JSON SCHEMA & RULES:**
1.  **Root Object**: \`{ "id": "whole-page", "type": "container", "description": "...", "children": [...] }\`
2.  **Component Nodes**: Each object in a children array must have \`id\`, \`type\`, \`description\`, and \`code\`.
3.  **HTML Decomposition**: Identify logical containers (header, main, section) and represent them as parent html nodes with a nested children array. The code for a container should be the element itself (e.g., \`<header id="main-header"></header>\`). The content goes in its children array.
4.  **Selector & Position Logic**: Correctly define \`selector\` and \`position\` for all HTML nodes to ensure proper placement.
5.  **JS Decomposition**: Extract each JavaScript function into its own separate node with \`type: "js-function"\`. Global scope code goes into a \`type: "javascript"\` node.
6.  **Head Decomposition**: Create a single node with \`type: "head"\` and \`id: "head-content"\` containing all meta, title, and link tags.`;

    const userPrompt = `Decompose the following code into the vibe tree JSON structure:\n\n\`\`\`html\n${fullCode}\n\`\`\``;

    const rawResponse = await callAI(systemPrompt, userPrompt, true);

    function tryParseVarious(text) {
        try { return JSON.parse(text.trim()); } catch {}
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fence && fence) { try { return JSON.parse(fence); } catch {} }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) { try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch {} }
        return null;
    }

    try {
        const parsed = tryParseVarious(rawResponse);
        if (!parsed || parsed.type !== 'container' || !Array.isArray(parsed.children)) {
            throw new Error("Invalid root structure.");
        }
        return parsed;
    } catch (e) {
        logToConsole(`AI JSON parse failed (${e.message}); using client-side parser.`, 'warn');
        return parseHtmlToVibeTree(fullCode);
    }
}

async function processCodeAndRefreshUI(fullCode) {
    if (!fullCode.trim()) {
        logToConsole("Processing aborted: code is empty.", 'warn');
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
        vibeTree = await decomposeCodeIntoVibeTree(fullCode);
        refreshAllUI();
        logToConsole("Update from code complete. UI refreshed.", 'info');
        switchToTab('preview');
        autoSaveProject();
    } catch (error) {
        console.error("Failed to update vibes from full code:", error);
        logToConsole(`Failed to process code: ${error.message}`, 'error');
    } finally {
        buttonsToDisable.forEach(b => {
            if (!b) return;
            b.disabled = false;
            b.innerHTML = originalButtonTexts.get(b);
        });
    }
}

async function handleUpdateTreeFromCode() {
    await processCodeAndRefreshUI(fullCodeEditor.value);
}

async function handleFileUpload() {
    const file = htmlFileInput.files;
    if (!file) return;

    const baseId = file.name.replace(/\.(html|htm)$/i, '').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    let projectId = baseId || `project-${Date.now()}`;
    const existing = db.listProjects();
    let suffix = 1;
    while (existing.includes(projectId)) {
        projectId = `${baseId}-${suffix++}`;
    }
    currentProjectId = projectId;

    const reader = new FileReader();
    reader.onload = async (event) => {
        await processCodeAndRefreshUI(event.target.result);
        logToConsole(`Project '${currentProjectId}' imported from file.`, 'info');
    };
    reader.onerror = (e) => console.error("Error reading file:", e);
    reader.readAsText(file);
}

function guessMimeType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
        'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript', 'json': 'application/json',
        'svg': 'image/svg+xml', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif',
        'webp': 'image/webp', 'ico': 'image/x-icon', 'mp4': 'video/mp4', 'webm': 'video/webm'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

async function handleZipUpload() {
    const file = zipFileInput.files && zipFileInput.files;
    if (!file) return;

    const originalText = uploadZipButton.innerHTML;
    uploadZipButton.disabled = true;
    uploadZipButton.innerHTML = 'Processing ZIP... <div class="loading-spinner"></div>';

    try {
        if (!window.JSZip) throw new Error('JSZip library failed to load.');
        const jszip = await JSZip.loadAsync(file);
        const htmlCandidates = Object.keys(jszip.files).filter(n => !jszip.files[n].dir && n.toLowerCase().endsWith('index.html'));
        if (htmlCandidates.length === 0) throw new Error('No index.html found in ZIP.');
        htmlCandidates.sort((a, b) => a.split('/').length - b.split('/').length);
        const indexPath = htmlCandidates;

        const { combinedHtml } = await buildCombinedHtmlFromZip(jszip, indexPath);
        
        const derivedId = file.name.replace(/\.zip$/i, '').toLowerCase().replace(/[^a-z0-9\-]/g, '');
        let projectId = derivedId || `zip-project-${Date.now()}`;
        const existing = db.listProjects();
        let suffix = 1;
        while (existing.includes(projectId)) {
            projectId = `${derivedId}-${suffix++}`;
        }
        currentProjectId = projectId;

        vibeTree = await decomposeCodeIntoVibeTree(combinedHtml);
        db.saveProject(currentProjectId, vibeTree);

        resetHistory();
        refreshAllUI();
        switchToTab('preview');
        logToConsole(`ZIP project '${currentProjectId}' imported successfully.`, 'info');

    } catch (e) {
        console.error('ZIP import failed:', e);
        logToConsole(`ZIP import failed: ${e.message}`, 'error');
    } finally {
        uploadZipButton.disabled = false;
        uploadZipButton.innerHTML = originalText;
    }
}

function generateFullCodeString(tree = vibeTree) {
    let cssContent = '', jsContent = '', htmlContent = '';
    let headContent = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;

    const buildHtmlRecursive = (nodes) => {
        let currentHtml = '';
        if (!nodes) return currentHtml;
        nodes.filter(n => n.type === 'html').forEach(node => {
            let finalCode = (node.code || '').replace(/<([a-zA-Z0-9\-]+)/, `<$1 data-vibe-node-id="${node.id}"`);
            if (node.children?.length > 0) {
                 const innerHtml = buildHtmlRecursive(node.children);
                 const wrapper = document.createElement('div');
                 wrapper.innerHTML = finalCode;
                 if(wrapper.firstElementChild) {
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
        if (node.type === 'head' && node.code) headContent = node.code;
        if (node.type === 'css') cssContent += (node.code || '') + '\n\n';
        if (node.type === 'javascript' || node.type === 'js-function') jsContent += (node.code || '') + '\n\n';
        if (node.children) node.children.forEach(traverse);
    }
    traverse(tree);
    
    htmlContent = buildHtmlRecursive(tree.children);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${headContent.trim()}
    <style>${cssContent.trim()}</style>
</head>
<body>
${htmlContent.trim()}
    <script>(function() {${jsContent.trim()}})();<\/script>
</body>
</html>`;
}

function buildHtmlBodyFromTree(tree = vibeTree) {
    const buildHtmlRecursive = (nodes) => {
        let currentHtml = '';
        if (!nodes) return currentHtml;
        nodes.filter(n => n.type === 'html').forEach(node => {
            if (node.children?.length > 0) {
                const innerHtml = buildHtmlRecursive(node.children);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = node.code || '';
                if (wrapper.firstElementChild) {
                    wrapper.firstElementChild.innerHTML = innerHtml;
                    currentHtml += wrapper.innerHTML + '\n';
                } else {
                    currentHtml += node.code + '\n';
                }
            } else {
                currentHtml += (node.code || '') + '\n';
            }
        });
        return currentHtml;
    };
    return buildHtmlRecursive(tree.children).trim();
}

function getHeadContentFromTree(tree = vibeTree) {
    const stack = [tree];
    while (stack.length) {
        const node = stack.pop();
        if (node.type === 'head' && node.code) return node.code;
        if (node.children) stack.push(...node.children);
    }
    return `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>`;
}

function collectCssJsNodes(tree = vibeTree) {
    const cssNodes = [], jsNodes = [];
    const traverse = (node) => {
        if (node.type === 'css' && node.code) cssNodes.push(node);
        if ((node.type === 'javascript' || node.type === 'js-function') && node.code) jsNodes.push(node);
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
    cssNodes.forEach(n => files.set(`assets/css/${nodeIdToFileName(n.id, 'css')}`, (n.code || '').trim() + '\n'));
    jsNodes.forEach(n => files.set(`assets/js/${nodeIdToFileName(n.id, 'js')}`, `(function(){\n${(n.code || '').trim()}\n})();\n`));

    try {
        db.listFiles(currentProjectId).forEach(p => {
            if (!files.has(p)) files.set(p, db.readFileForExport(currentProjectId, p));
        });
    } catch (e) { console.warn('Failed adding assets to ZIP:', e); }

    return { files, indexHtml };
}

function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 0);
}

async function handleDownloadProjectZip() {
    try {
        if (!window.JSZip) throw new Error('JSZip library failed to load.');
        
        const { files } = assembleMultiFileBundle(vibeTree);
        const zip = new JSZip();

        for (const [path, content] of files.entries()) {
            zip.file(path, content);
        }

        zip.file("bundle.html", generateFullCodeString(vibeTree));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const fnameBase = currentProjectId || 'vibe-project';
        triggerBlobDownload(zipBlob, `${fnameBase}.zip`);
        logToConsole(`Project "${fnameBase}" packaged and downloaded as ZIP.`, 'info');
    } catch (e) {
        console.error('ZIP download failed:', e);
        logToConsole(`ZIP download failed: ${e.message}`, 'error');
    }
}

function applyVibes() {
    try {
        const doc = previewContainer.contentWindow.document;
        let html = generateFullCodeString();

        const inspectorScript = `
<script>
(function(){
    let inspectEnabled = false, hoverEl = null;
    const styles = \`.__vibe-inspect-highlight-hover{outline:2px solid #e5c07b!important;outline-offset:2px!important;box-shadow:0 0 8px rgba(229,192,123,.8)!important;cursor:pointer}__vibe-inspect-highlight-clicked{outline:3px solid #61afef!important;outline-offset:2px!important;box-shadow:0 0 12px rgba(97,175,239,.9)!important;transition:all .5s ease-out!important}\`;
    function getNodeId(el){ const c=el.closest('[data-vibe-node-id]'); return c ? {nodeId:c.dataset.vibeNodeId,element:c} : null; }
    function ensureStyles(){ if(document.getElementById('vibe-inspector-styles'))return;const s=document.createElement('style');s.id='vibe-inspector-styles';s.textContent=styles;document.head.appendChild(s);}
    function onMouseOver(e){if(!inspectEnabled)return;const t=getNodeId(e.target);if(t){if(hoverEl&&hoverEl!==t.element)hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=t.element;hoverEl.classList.add('__vibe-inspect-highlight-hover')}else if(hoverEl){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}}
    function onMouseOut(e){if(hoverEl&&!hoverEl.contains(e.relatedTarget)){hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}}
    function onClick(e){if(!inspectEnabled)return;const t=getNodeId(e.target);if(t){e.preventDefault();e.stopPropagation();window.parent.postMessage({type:'vibe-node-click',nodeId:t.nodeId},'*');if(hoverEl)hoverEl.classList.remove('__vibe-inspect-highlight-hover');t.element.classList.add('__vibe-inspect-highlight-clicked');setTimeout(()=>t.element.classList.remove('__vibe-inspect-highlight-clicked'),500)}}
    function enable(){if(inspectEnabled)return;inspectEnabled=true;ensureStyles();document.addEventListener('mouseover',onMouseOver);document.addEventListener('mouseout',onMouseOut);document.addEventListener('click',onClick,true)}
    function disable(){if(!inspectEnabled)return;inspectEnabled=false;document.removeEventListener('mouseover',onMouseOver);document.removeEventListener('mouseout',onMouseOut);document.removeEventListener('click',onClick,true);if(hoverEl)hoverEl.classList.remove('__vibe-inspect-highlight-hover');hoverEl=null}
    window.addEventListener('message',e=>e.data.type==='toggle-inspect'&&(e.data.enabled?enable():disable()));
})();
<\/script>`;

        html = html.replace('</body>', `${inspectorScript}\n</body>`);

        doc.open();
        doc.write(html);
        doc.close();

    } catch (e) {
        logToConsole(`applyVibes failed: ${e.message}`, 'error');
    }
}


function showFullCode() {
    fullCodeEditor.value = generateFullCodeString();
}

let draggedNodeId = null;

function handleDragStart(event) {
    const targetNode = event.target.closest('.vibe-node');
    if (!targetNode) { event.preventDefault(); return; }
    draggedNodeId = targetNode.dataset.nodeId;
    event.dataTransfer.setData('text/plain', draggedNodeId);
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => targetNode.classList.add('dragging'), 0);
}

function handleDragOver(event) {
    event.preventDefault(); 
    const targetNode = event.target.closest('.vibe-node');
    document.querySelectorAll('.drop-indicator-before, .drop-indicator-after').forEach(el => el.classList.remove('drop-indicator-before', 'drop-indicator-after'));
    if (!targetNode || targetNode.dataset.nodeId === draggedNodeId) return;
    const rect = targetNode.getBoundingClientRect();
    targetNode.classList.add(event.clientY > rect.top + rect.height / 2 ? 'drop-indicator-after' : 'drop-indicator-before');
}

function handleDragLeave(event) {
    event.target.closest('.vibe-node')?.classList.remove('drop-indicator-before', 'drop-indicator-after');
}

function handleDrop(event) {
    event.preventDefault();
    const targetNodeEl = event.target.closest('.vibe-node');
    document.querySelectorAll('.drop-indicator-before, .drop-indicator-after').forEach(el => el.classList.remove('drop-indicator-before', 'drop-indicator-after'));
    if (!targetNodeEl || !draggedNodeId || targetNodeEl.dataset.nodeId === draggedNodeId) return;
    const rect = targetNodeEl.getBoundingClientRect();
    moveNode(draggedNodeId, targetNodeEl.dataset.nodeId, event.clientY > rect.top + rect.height / 2 ? 'after' : 'before');
}

function handleDragEnd() {
    document.querySelector('.vibe-node.dragging')?.classList.remove('dragging');
    draggedNodeId = null;
}

function addEventListeners() {
    document.querySelectorAll('.update-button').forEach(b => b.addEventListener('click', handleUpdate));
    document.querySelectorAll('.toggle-code-button').forEach(b => b.addEventListener('click', toggleCodeEditor));
    document.querySelectorAll('.add-child-button').forEach(b => b.addEventListener('click', handleAddChildClick));
    document.querySelectorAll('.save-code-button').forEach(b => b.addEventListener('click', handleSaveCode));
    document.querySelectorAll('.save-as-component-button').forEach(b => b.addEventListener('click', handleSaveNodeAsComponentFromEditor));
    document.querySelectorAll('.collapse-toggle').forEach(b => b.addEventListener('click', handleCollapseToggle));
    document.querySelectorAll('.vibe-node-header').forEach(h => h.addEventListener('click', handleNodeContentToggle));

    if (editorContainer) {
        editorContainer.addEventListener('dragstart', handleDragStart);
        editorContainer.addEventListener('dragover', handleDragOver);
        editorContainer.addEventListener('dragleave', handleDragLeave);
        editorContainer.addEventListener('drop', handleDrop);
        editorContainer.addEventListener('dragend', handleDragEnd);
    }
}

function logToAgent(message, type = 'info') {
    agentOutput.querySelector('.agent-message-placeholder')?.remove();
    const msgEl = document.createElement('div');
    msgEl.className = `agent-message log-type-${type}`;
    msgEl.innerHTML = message;
    agentOutput.appendChild(msgEl);
    agentOutput.scrollTop = agentOutput.scrollHeight;
}

function getAgentSystemPrompt() {
    return `You are an expert AI developer agent. Your task is to analyze a user's request and a website's full component structure (Vibe Tree), then create a plan and generate a JSON object of actions to modify the website.

**OUTPUT:**
You must respond ONLY with a single, valid JSON object with the schema: \`{ "plan": "...", "actions": [...] }\`.
- \`plan\`: A concise summary of the changes.
- \`actions\`: An array of objects, each with:
  - \`"actionType": "update"\`, \`"nodeId"\`, \`"newDescription"\`, \`"newCode"\`
  - OR
  - \`"actionType": "create"\`, \`"parentId"\`, \`"newNode": { ... }\`

**RULES:**
- For 'update', provide the full new code, not a diff.
- For 'create', the newNode.id must be unique and in kebab-case. New HTML nodes need a correct selector and position.
- The response must be a single, valid JSON object and nothing else.`;
}

function getIterativePlannerSystemPrompt() {
    return `You are a senior project manager AI. Break down a user's website goal into a numbered, step-by-step plan. Each step must be a single, concrete, testable task.
    
**OUTPUT:** Respond ONLY with a single, valid JSON object: \`{ "plan": ["Step 1...", "Step 2...", ...] }\``;
}

function getIterativeExecutorSystemPrompt() {
    return `You are an expert AI developer executing one step of a larger plan. Generate actions to implement ONLY the current step.
    
**CONTEXT:** You will receive the overall goal, the full plan, the current step, and the website's Vibe Tree.
    
**OUTPUT:** Respond ONLY with a single, valid JSON object: \`{ "plan": "Summary of changes for THIS STEP ONLY.", "actions": [...] }\`. The actions schema is the same as the standard agent.
    
**RULES:** Focus ONLY on the current step. Do not implement future steps.`;
}

async function handleFixError(errorMessage, fixButton) {
    fixButton.disabled = true;
    fixButton.innerHTML = 'Fixing... <div class="loading-spinner"></div>';
    switchToTab('agent');
    
    agentPromptInput.value = `Fix this error:\n${errorMessage}`;
    runAgentSingleTaskButton.disabled = true;
    runAgentSingleTaskButton.innerHTML = 'Agent is fixing...';
    agentOutput.innerHTML = '';
    logToAgent(`<strong>Task:</strong> Fix runtime error: <pre>${errorMessage}</pre>`, 'plan');

    const systemPrompt = getAgentSystemPrompt();
    const userPrompt = `A runtime error was detected. Analyze the error and the code to fix it.
**Error Details:** \`${errorMessage}\`
**Full Vibe Tree (current code):** \`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

    try {
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        logToAgent('Fix applied. Website reloaded.', 'info');
        switchToTab('preview');
    } catch (error) {
        logToAgent(`AI fix failed: ${error.message}.`, 'error');
    } finally {
        runAgentSingleTaskButton.disabled = !(geminiApiKey || nscaleApiKey);
        runAgentSingleTaskButton.innerHTML = 'Execute as Single Task';
        agentPromptInput.value = '';
    }
}

function executeAgentPlan(agentDecision, agentLogger) {
    if (!agentDecision.plan || !Array.isArray(agentDecision.actions)) {
        throw new Error("AI returned a malformed plan object.");
    }

    recordHistory('Agent plan execution');
    agentLogger(`<strong>Plan:</strong> ${agentDecision.plan}`, 'plan');

    agentDecision.actions.forEach(action => {
        if (action.actionType === 'update') {
            const nodeToUpdate = findNodeById(action.nodeId);
            if (nodeToUpdate) {
                agentLogger(`<strong>Updating Node:</strong> \`${action.nodeId}\``, 'action');
                if (action.newDescription) nodeToUpdate.description = action.newDescription;
                if (typeof action.newCode === 'string') nodeToUpdate.code = action.newCode;
            } else {
                agentLogger(`Warning: Agent wanted to update non-existent node \`${action.nodeId}\`, skipping.`, 'warn');
            }
        } else if (action.actionType === 'create') {
            const parentNode = findNodeById(action.parentId);
            if (parentNode && (parentNode.type === 'container' || parentNode.type === 'html')) {
                if (!action.newNode?.id || findNodeById(action.newNode.id)) {
                     agentLogger(`Warning: AI tried to create an invalid or duplicate node \`${action.newNode?.id}\`. Skipping.`, 'warn');
                     return;
                }
                if (!parentNode.children) parentNode.children = [];
                agentLogger(`<strong>Creating Node:</strong> \`${action.newNode.id}\` inside \`${action.parentId}\``, 'action');
                parentNode.children.push(action.newNode);
            } else {
                agentLogger(`Warning: AI wanted to create node under invalid parent \`${action.parentId}\`. Skipping.`, 'warn');
            }
        }
    });
    
    refreshAllUI();
}

async function handleRunAgent() {
    const userPrompt = agentPromptInput.value.trim();
    if (!userPrompt) return;

    runAgentSingleTaskButton.disabled = true;
    runAgentSingleTaskButton.innerHTML = 'Thinking...';
    logToAgent(`<strong>You:</strong> ${userPrompt}`, 'user');

    const systemPrompt = getAgentSystemPrompt();
    const agentUserPrompt = `User Request: "${userPrompt}"\n\nFull Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

    try {
        const rawResponse = await callAI(systemPrompt, agentUserPrompt, true);
        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        logToAgent('Changes applied.', 'info');
        switchToTab('preview');
    } catch (error) {
        console.error("AI agent failed:", error);
        logToAgent(`AI agent failed: ${error.message}.`, 'error');
    } finally {
        runAgentSingleTaskButton.disabled = !(geminiApiKey || nscaleApiKey);
        runAgentSingleTaskButton.innerHTML = 'Execute as Single Task';
        agentPromptInput.value = '';
    }
}

function updateIterativeUI() {
    const isActive = iterativeSessionState.isActive;
    iterativeSessionUI.classList.toggle('hidden', !isActive);
    runAgentSingleTaskButton.style.display = isActive ? 'none' : 'inline-block';
    startIterativeSessionButton.style.display = isActive ? 'none' : 'inline-block';
    agentPromptInput.disabled = isActive;
    agentPromptInput.placeholder = isActive 
        ? "Review the preview. Provide feedback here if you select 'Request Changes'." 
        : "Describe the overall goal for your website...";

    if (isActive) {
        iterativePlanDisplay.innerHTML = '<ol>' + iterativeSessionState.plan.map((step, index) => 
            `<li class="${index === iterativeSessionState.currentStepIndex ? 'active-step' : ''}">${step}</li>`
        ).join('') + '</ol>';
    }
}

async function handleStartIterativeSession() {
    const goal = agentPromptInput.value.trim();
    if (!goal) return;

    iterativeSessionState = { isActive: true, overallGoal: goal, plan: [], currentStepIndex: 0, history: [] };
    agentOutput.innerHTML = '';
    logToAgent(`<strong>Starting Iterative Session.</strong> Goal: ${goal}`, 'plan');
    updateIterativeUI();

    try {
        const systemPrompt = getIterativePlannerSystemPrompt();
        const userPrompt = `My website goal is: "${goal}"`;
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const responseJson = JSON.parse(rawResponse);
        if (!responseJson.plan || !Array.isArray(responseJson.plan)) throw new Error("AI did not return a valid plan array.");
        iterativeSessionState.plan = responseJson.plan;
        updateIterativeUI();
        await executeNextIterativeStep();
    } catch (error) {
        logToAgent(`Error during planning: ${error.message}`, 'error');
        handleEndIterativeSession();
    }
}

async function executeNextIterativeStep() {
    if (iterativeSessionState.currentStepIndex >= iterativeSessionState.plan.length) {
        logToAgent('<strong>Project Complete!</strong> All steps executed.', 'plan');
        handleEndIterativeSession();
        return;
    }

    iterativeControls.classList.add('hidden');
    agentPromptInput.value = '';
    const currentStepDescription = iterativeSessionState.plan[iterativeSessionState.currentStepIndex];
    logToAgent(`<strong>Step ${iterativeSessionState.currentStepIndex + 1}/${iterativeSessionState.plan.length}:</strong> ${currentStepDescription}`, 'action');
    updateIterativeUI();

    try {
        const systemPrompt = getIterativeExecutorSystemPrompt();
        const userPrompt = `Overall Goal: "${iterativeSessionState.overallGoal}"\nFull Plan:\n${iterativeSessionState.plan.map((s, i) => `${i+1}. ${s}`).join('\n')}\nCurrent Step: "${currentStepDescription}"\nCurrent Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        logToAgent('Step complete. Review the preview.', 'info');
        switchToTab('preview');
        iterativeControls.classList.remove('hidden');
    } catch (error) {
        logToAgent(`Failed to execute step: ${error.message}`, 'error');
        iterativeControls.classList.remove('hidden');
    }
}

function handleAcceptAndContinue() {
    iterativeSessionState.currentStepIndex++;
    executeNextIterativeStep();
}

async function handleRequestChanges() {
    const changeRequest = agentPromptInput.value.trim();
    if (!changeRequest) return;

    logToAgent(`<strong>Feedback:</strong> ${changeRequest}`, 'user');
    iterativeControls.classList.add('hidden');

    try {
        const systemPrompt = getIterativeExecutorSystemPrompt();
        const currentStepDescription = iterativeSessionState.plan[iterativeSessionState.currentStepIndex];
        const userPrompt = `Overall Goal: "${iterativeSessionState.overallGoal}"\nCurrent Step: "${currentStepDescription}"\nYour last attempt was not right. Apply this correction: "${changeRequest}"\n\nCurrent Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        logToAgent('Changes applied. Please review again.', 'info');
        switchToTab('preview');
    } catch (error) {
        logToAgent(`Error applying changes: ${error.message}`, 'error');
    } finally {
        iterativeControls.classList.remove('hidden');
        agentPromptInput.value = '';
    }
}

function handleEndIterativeSession() {
    logToAgent('Iterative session ended.', 'info');
    iterativeSessionState = { isActive: false, overallGoal: '', plan: [], currentStepIndex: -1, history: [] };
    updateIterativeUI();
    iterativeControls.classList.add('hidden');
    agentPromptInput.value = '';
}

function logToChat(message, type = 'model') {
    chatOutput.querySelector('.chat-message-placeholder')?.remove();
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message log-type-${type}`;
    msgEl.textContent = message;
    chatOutput.appendChild(msgEl);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    return msgEl;
}

function processChatCodeBlocks(parentElement) {
    let htmlContent = parentElement.innerHTML.replace(/```(\S*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const sanitizedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang}">${sanitizedCode}</code></pre>`;
    });
    parentElement.innerHTML = htmlContent;
    parentElement.querySelectorAll('pre code').forEach(codeEl => {
        const pre = codeEl.parentElement;
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
            if (match && match) { targetFilePath = match; break; }
        }
        if (targetFilePath) {
            const button = document.createElement('button');
            button.className = 'insert-code-button';
            button.textContent = `Insert into ${targetFilePath}`;
            button.addEventListener('click', (e) => handleInsertCodeIntoFile(targetFilePath, codeContent, e.currentTarget));
            actionsContainer.appendChild(button);
        }
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', () => navigator.clipboard.writeText(codeContent).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => (copyButton.textContent = 'Copy'), 2000);
        }));
        pre.appendChild(copyButton);
    });
}

async function handleInsertCodeIntoFile(filePath, codeContent, buttonElement) {
    if (!ensureProjectForFiles()) return;
    let cleanPath = String(filePath || '').trim().split(':').pop().trim().replace(/^\/+/, '');
    if (!cleanPath || !confirm(`Overwrite '${cleanPath}'?`)) return;
    
    const originalText = buttonElement ? buttonElement.textContent : '';
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = 'Processing...';
    }
    try {
        await db.saveTextFile(currentProjectId, cleanPath, codeContent);
        await rebuildAndRefreshFromFiles();
    } catch (e) {
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
    const indexText = await db.readTextFile(projectId, 'index.html');
    const doc = new DOMParser().parseFromString(indexText, 'text/html');
    for (const link of Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))) {
        try {
            const style = doc.createElement('style');
            style.textContent = await db.readTextFile(projectId, link.getAttribute('href').trim());
            link.replaceWith(style);
        } catch (e) { console.warn(`Could not inline stylesheet: ${link.getAttribute('href')}`, e); }
    }
    for (const script of Array.from(doc.querySelectorAll('script[src]'))) {
        try {
            const inlineScript = doc.createElement('script');
            inlineScript.textContent = await db.readTextFile(projectId, script.getAttribute('src').trim());
            if (script.type) inlineScript.type = script.type;
            script.replaceWith(inlineScript);
        } catch (e) { console.warn(`Could not inline script: ${script.getAttribute('src')}`, e); }
    }
    return new XMLSerializer().serializeToString(doc);
}

async function rebuildAndRefreshFromFiles() {
    logToConsole("Rebuilding Vibe Tree from source files...", "info");
    try {
        const combinedHtml = await buildCombinedHtmlFromDb(currentProjectId);
        recordHistory('Rebuild from file change');
        vibeTree = await decomposeCodeIntoVibeTree(combinedHtml);
        refreshAllUI();
    } catch (error) {
        logToConsole(`Error rebuilding from files: ${error.message}`, 'error');
    }
}

function handleUseAgentToInsertSnippet(codeContent) {
    const lastUserMessage = chatConversationHistory.filter(m => m.role === 'user').pop();
    const context = lastUserMessage ? `Based on our last conversation about "${lastUserMessage.content}", please ` : 'Please ';
    agentPromptInput.value = `${context}insert the following code snippet into the project where it makes the most sense:\n\n\`\`\`\n${codeContent}\n\`\`\``;
    switchToTab('agent');
    handleRunAgent();
}

async function handleSendChatMessage() {
    const userPrompt = chatPromptInput.value.trim();
    if (!userPrompt) return;

    const systemPrompt = chatSystemPromptInput.value.trim() || `You are an expert pair programmer. Your task is to help the user modify their project files.
1.  Analyze the user's request and the provided file context.
2.  Identify which file(s) need modification.
3.  You MUST return the **complete, updated content** of the file(s). Do not provide snippets or diffs.
4.  Enclose the full file content in a markdown code block with a language fence that includes the file path (e.g., \`\`\`html:index.html ... \`\`\`).`;

    sendChatButton.disabled = true;
    chatPromptInput.disabled = true;
    chatPromptInput.value = '';

    logToChat(userPrompt, 'user');
    chatConversationHistory.push({ role: 'user', content: userPrompt });
    
    const aiMessageElement = logToChat('...', 'model');
    aiMessageElement.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        let fullResponse = '';
        const streamCallback = (chunk) => {
            fullResponse += chunk;
            aiMessageElement.textContent = fullResponse;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };
        await callAI(systemPrompt, userPrompt, false, streamCallback);
        processChatCodeBlocks(aiMessageElement);
        chatConversationHistory.push({ role: 'model', content: fullResponse });
    } catch (error) {
        aiMessageElement.textContent = `AI Error: ${error.message}`;
        aiMessageElement.classList.add('log-type-error');
    } finally {
        sendChatButton.disabled = false;
        chatPromptInput.disabled = false;
        sendChatButton.innerHTML = 'Send';
        chatPromptInput.focus();
    }
}

function handleAddChildClick(event) {
    addNodeParentIdInput.value = event.target.dataset.id;
    addNodeTargetIdInput.value = '';
    addNodePositionInput.value = '';
    newNodeIdInput.value = '';
    newNodeDescriptionInput.value = '';
    newNodeTypeInput.value = 'html';
    addNodeError.textContent = '';
    addNodeModal.style.display = 'block';
    newNodeIdInput.focus();
}

async function handleCreateNode() {
    const parentId = addNodeParentIdInput.value;
    const newNodeId = newNodeIdInput.value.trim();
    const newNodeType = newNodeTypeInput.value;
    const newDescription = newNodeDescriptionInput.value.trim() || `A new ${newNodeType} component.`;
    const targetId = addNodeTargetIdInput.value;
    const position = addNodePositionInput.value;

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newNodeId)) {
        addNodeError.textContent = 'Invalid ID. Use kebab-case.';
        return;
    }
    if (findNodeById(newNodeId)) {
        addNodeError.textContent = 'This ID is already in use.';
        return;
    }
    const parentNode = findNodeById(parentId);
    if (!parentNode) {
        addNodeError.textContent = 'Parent node not found.';
        return;
    }

    recordHistory(`Create node ${newNodeId}`);
    if (!parentNode.children) parentNode.children = [];
    const newNode = { id: newNodeId, type: newNodeType, description: newDescription, code: '' };
    
    let inserted = false;
    if (targetId && position) {
        const targetIndex = parentNode.children.findIndex(c => c.id === targetId);
        if (targetIndex !== -1) {
            parentNode.children.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, newNode);
            inserted = true;
        }
    }
    if (!inserted) parentNode.children.push(newNode);
    
    recalculateSelectors(parentNode);
    refreshAllUI();
    addNodeModal.style.display = 'none';
    autoSaveProject();
}

function openEditNodeModal(nodeId) {
    const node = findNodeById(nodeId);
    if (!node) return;
    editNodeIdInput.value = node.id;
    editNodeTypeInput.value = node.type;
    editNodeDescriptionInput.value = node.description || '';
    editNodeCodeInput.value = node.code || '';
    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (aiImproveDescriptionButton) aiImproveDescriptionButton.disabled = !keyIsAvailable;
    if (saveAsComponentButton) {
        const isSaveable = ['html', 'js-function', 'css'].includes(node.type);
        saveAsComponentButton.style.display = isSaveable ? 'inline-block' : 'none';
        saveAsComponentButton.disabled = !keyIsAvailable;
        saveAsComponentButton.dataset.nodeId = nodeId;
    }
    editNodeModal.style.display = 'block';
}

function closeEditNodeModal() {
    editNodeModal.style.display = 'none';
}

async function handleSaveEditedNode() {
    const nodeId = editNodeIdInput.value;
    const node = findNodeById(nodeId);
    if (!node) return;

    const newDescription = editNodeDescriptionInput.value;
    const newCode = editNodeCodeInput.value;
    const descChanged = newDescription !== (node.description || '');
    const codeChanged = newCode !== (node.code || '');

    if (!descChanged && !codeChanged) return closeEditNodeModal();

    try {
        if (codeChanged) {
            recordHistory(`Edit code for ${nodeId}`);
            node.code = newCode;
        }
        if (descChanged) {
            if (!codeChanged) recordHistory(`Edit description for ${nodeId}`);
            await updateNodeByDescription(nodeId, newDescription, saveEditNodeButton);
        } else {
            refreshAllUI();
        }
        closeEditNodeModal();
        autoSaveProject();
    } catch (e) {
        editNodeError.textContent = e.message || 'Failed to update node.';
    }
}

function toggleInspectMode() {
    inspectEnabled = !inspectEnabled;
    toggleInspectButton.classList.toggle('inspect-active', inspectEnabled);
    toggleInspectButton.textContent = inspectEnabled ? 'Disable Inspect' : 'Enable Inspect';
    previewContainer.contentWindow.postMessage({ type: 'toggle-inspect', enabled: inspectEnabled }, '*');
}

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
    if (!result || !result.parent) return;
    if (confirm(`Delete element "${nodeId}"?`)) {
        recordHistory(`Delete node ${nodeId}`);
        const { node, parent } = result;
        const index = parent.children.indexOf(node);
        if (index > -1) {
            parent.children.splice(index, 1);
            recalculateSelectors(parent);
            refreshAllUI();
        }
    }
}

function moveNode(sourceNodeId, targetNodeId, position) {
    const sourceResult = findNodeAndParentById(sourceNodeId);
    const targetResult = findNodeAndParentById(targetNodeId);
    if (!sourceResult || !targetResult) return;

    const { node: sourceNode, parent: sourceParent } = sourceResult;
    const { node: targetNode, parent: targetParent } = targetResult;
    
    let current = targetParent;
    while(current) {
        if (current.id === sourceNodeId) {
            logToConsole('Cannot move a parent into one of its own children.', 'error');
            return;
        }
        current = findNodeAndParentById(current.id)?.parent;
    }

    recordHistory(`Move node ${sourceNodeId}`);

    const sourceIndex = sourceParent.children.indexOf(sourceNode);
    if (sourceIndex > -1) sourceParent.children.splice(sourceIndex, 1);
    else return;

    if (position === 'inside') {
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(sourceNode);
        recalculateSelectors(targetNode);
    } else {
        const targetIndex = targetParent.children.indexOf(targetNode);
        targetParent.children.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, sourceNode);
        recalculateSelectors(targetParent);
    }
    if(sourceParent.id !== targetParent.id) recalculateSelectors(sourceParent);

    refreshAllUI();
}

function recalculateSelectors(parentNode) {
    if (!parentNode?.children) return;
    let lastHtmlSiblingId = null;
    parentNode.children.filter(c => c.type === 'html').forEach((child, index) => {
        child.selector = (index === 0) ? `#${parentNode.id}` : `#${lastHtmlSiblingId}`;
        child.position = (index === 0) ? 'beforeend' : 'afterend';
        const idMatch = (child.code || '').match(/id="([^"]+)"/);
        lastHtmlSiblingId = idMatch ? idMatch : child.id;
    });
}

function handleAddNodeFromInspect(targetNodeId, position) {
    const targetResult = findNodeAndParentById(targetNodeId);
    if (!targetResult) return;
    const { node: targetNode, parent: targetParent } = targetResult;
    let parentForNewNode, targetForPositioning, positionForNewNode;

    if (position === 'inside') {
        parentForNewNode = targetNode;
        positionForNewNode = 'beforeend';
    } else {
        parentForNewNode = targetParent;
        targetForPositioning = targetNode;
        positionForNewNode = position;
    }
    
    addNodeTargetIdInput.value = targetForPositioning?.id || '';
    addNodePositionInput.value = positionForNewNode || '';
    addNodeParentIdInput.value = parentForNewNode.id;
    newNodeIdInput.value = '';
    newNodeDescriptionInput.value = '';
    newNodeTypeInput.value = 'html';
    addNodeError.textContent = '';
    addNodeModal.style.display = 'block';
    newNodeIdInput.focus();
}

window.addEventListener('message', (event) => {
    const { type, nodeId, sourceNodeId, targetNodeId, position } = event.data || {};
    if (type === 'vibe-node-click' && nodeId) openEditNodeModal(nodeId);
    if (type === 'vibe-node-delete' && nodeId) deleteNode(nodeId);
    if (type === 'vibe-node-move' && sourceNodeId && targetNodeId && position) moveNode(sourceNodeId, targetNodeId, position);
    if (type === 'vibe-node-add-request' && targetNodeId && position) handleAddNodeFromInspect(targetNodeId, position);
});

let searchState = { term: '', matches: [], currentIndex: -1 };

function performSearch() {
    const searchTerm = searchInput.value;
    if (!searchTerm) {
        searchState = { term: '', matches: [], currentIndex: -1 };
        return;
    }
    if (searchState.term !== searchTerm) {
        searchState.term = searchTerm;
        const code = fullCodeEditor.value;
        const regex = new RegExp(searchTerm, 'gi');
        searchState.matches = [];
        let match;
        while ((match = regex.exec(code)) !== null) {
            searchState.matches.push(match.index);
        }
        searchState.currentIndex = -1;
    }
    if (searchState.matches.length > 0) findNextMatch();
    else searchResultsCount.textContent = '0 matches';
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

async function handleAiEditorSearch() {
    const query = aiEditorSearchInput.value.trim();
    clearEditorHighlights();
    if (!query) return;

    const originalButtonText = aiEditorSearchButton.innerHTML;
    aiEditorSearchButton.disabled = true;
    aiEditorSearchButton.innerHTML = 'Searching...';
    
    try {
        const systemPrompt = `You are a search engine for a JSON "Vibe Tree". Find relevant nodes based on a query.
**OUTPUT FORMAT:** A single, valid JSON array of strings, where each string is a relevant node \`id\`.`;
        const userPrompt = `Query: "${query}"\n\nVibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const resultIds = JSON.parse(rawResponse);
        if (!Array.isArray(resultIds)) throw new Error("AI did not return a valid array.");
        if (resultIds.length > 0) highlightSearchResults(resultIds);
        else alert(`AI search for "${query}" found no matches.`);
    } catch (error) {
        alert(`AI search error: ${error.message}`);
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
            if (!firstResultEl) firstResultEl = nodeEl;
            let parent = nodeEl.parentElement;
            while(parent && parent !== editorContainer) {
                if (parent.classList.contains('children') && parent.classList.contains('collapsed')) {
                    parent.closest('.vibe-node')?.querySelector('.collapse-toggle')?.click();
                }
                parent = parent.parentElement;
            }
        }
    });
    firstResultEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function switchToTab(tabId) {
    const tabs = document.querySelector('.tabs');
    const tabContents = document.querySelector('.tab-content-area');
    const button = tabs.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (!button || button.classList.contains('active')) return;

    if (tabId === 'console') consoleErrorIndicator.classList.remove('active');
    tabs.querySelector('.active')?.classList.remove('active');
    tabContents.querySelector('.active')?.classList.remove('active');
    button.classList.add('active');
    tabContents.querySelector(`#${tabId}`)?.classList.add('active');

    if (tabId === 'code') showFullCode();
    if (tabId === 'files') renderFileTree();
    if (tabId === 'context') renderComponentList();
}

function handleTabSwitching() {
    document.querySelector('.tabs').addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (button) switchToTab(button.dataset.tab);
    });
}

function initializeMermaid() {
    if (typeof window.mermaid !== 'undefined') {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    }
}

function populateProjectList() {
    const projects = db.listProjects();
    projectListContainer.innerHTML = ''; 
    noProjectsMessage.style.display = projects.length === 0 ? 'block' : 'none';
    projects.forEach(projectId => {
        const item = document.createElement('div');
        item.className = 'project-list-item';
        item.innerHTML = `<span class="project-id-text">${projectId}</span><div class="project-item-buttons"><button class="load-project-button action-button" data-id="${projectId}">Load</button><button class="delete-project-button" data-id="${projectId}">Delete</button></div>`;
        projectListContainer.appendChild(item);
    });
}

function handleLoadProject(event) {
    const projectId = event.target.dataset.id;
    const projectData = db.loadProject(projectId);
    if (projectData) {
        currentProjectId = projectId;
        vibeTree = projectData;
        refreshAllUI();
        resetHistory();
        switchToTab('preview');
    }
}

function handleDeleteProject(event) {
    const projectId = event.target.dataset.id;
    if (confirm(`Delete project '${projectId}'?`)) {
        db.deleteProject(projectId);
        populateProjectList();
    }
}

function autoSaveProject() {
    if (!currentProjectId) return;
    db.saveProject(currentProjectId, vibeTree);
    try {
        const { files } = assembleMultiFileBundle(vibeTree);
        for (const [path, content] of files.entries()) {
            if (content instanceof Uint8Array) db.saveBinaryFile(currentProjectId, path, content, guessMimeType(path));
            else db.saveTextFile(currentProjectId, path, String(content));
        }
    } catch (e) { console.warn('Failed to auto-save files:', e); }
    renderFileTree();
}

projectListContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('load-project-button')) handleLoadProject(event);
    if (event.target.classList.contains('delete-project-button')) handleDeleteProject(event);
});

function openComponentModal(componentId = null, componentData = null) {
    componentModalError.textContent = '';
    if (componentData) {
        componentModalTitle.textContent = 'Save New Component';
        Object.assign(componentIdInput, { value: componentData.id || '', readOnly: false });
        componentNameInput.value = componentData.name || '';
        componentDescriptionInput.value = componentData.description || '';
        componentHtmlInput.value = componentData.html || '';
        componentCssInput.value = componentData.css || '';
        componentJsInput.value = componentData.javascript || '';
        deleteComponentButton.style.display = 'none';
    } else if (componentId) {
        const comp = db.getComponent(componentId);
        if (!comp) return;
        componentModalTitle.textContent = 'Edit Component';
        Object.assign(componentIdInput, { value: comp.id, readOnly: true });
        componentNameInput.value = comp.name;
        componentDescriptionInput.value = comp.description || '';
        componentHtmlInput.value = comp.html || '';
        componentCssInput.value = comp.css || '';
        componentJsInput.value = comp.javascript || '';
        deleteComponentButton.style.display = 'inline-block';
        deleteComponentButton.dataset.id = comp.id;
    } else {
        componentModalTitle.textContent = 'Add New Component';
        ['component-id-input', 'component-name-input', 'component-description-input', 'component-html-input', 'component-css-input', 'component-js-input'].forEach(id => document.getElementById(id).value = '');
        componentIdInput.readOnly = false;
        deleteComponentButton.style.display = 'none';
    }
    if (componentAiPromptInput) componentAiPromptInput.value = '';
    contextComponentModal.style.display = 'block';
    (componentData || componentId ? componentNameInput : componentAiPromptInput).focus();
}

function closeComponentModal() {
    contextComponentModal.style.display = 'none';
}

async function handleAiGenerateComponent() {
    const prompt = componentAiPromptInput.value.trim();
    if (!prompt) {
        componentModalError.textContent = 'Please enter a description.';
        return;
    }
    const originalText = generateComponentButton.innerHTML;
    generateComponentButton.disabled = true;
    generateComponentButton.innerHTML = 'Generating...';
    try {
        const systemPrompt = `You are a frontend developer creating reusable web components. Generate a single, self-contained component from a prompt.
**OUTPUT:** A single, valid JSON object: \`{ "id": "...", "name": "...", "description": "...", "html": "...", "css": "...", "javascript": "..." }\``;
        const rawResponse = await callAI(systemPrompt, `Generate a component for: "${prompt}"`, true);
        const aiComponent = JSON.parse(rawResponse);
        if (!aiComponent.id || !aiComponent.name || !aiComponent.html) throw new Error("AI response missing required fields.");
        componentIdInput.value = aiComponent.id || '';
        componentNameInput.value = aiComponent.name || '';
        componentDescriptionInput.value = aiComponent.description || '';
        componentHtmlInput.value = aiComponent.html || '';
        componentCssInput.value = aiComponent.css || '';
        componentJsInput.value = aiComponent.javascript || '';
    } catch (error) {
        componentModalError.textContent = `AI generation failed: ${error.message}`;
    } finally {
        generateComponentButton.disabled = false;
        generateComponentButton.innerHTML = originalText;
    }
}

function handleSaveComponent() {
    const id = componentIdInput.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const name = componentNameInput.value.trim();
    if (!id || !name) {
        componentModalError.textContent = 'ID and Name are required.';
        return;
    }
    if (!componentIdInput.readOnly && db.getComponent(id)) {
        componentModalError.textContent = 'Component ID is already in use.';
        return;
    }
    const component = {
        id, name,
        description: componentDescriptionInput.value.trim(),
        html: componentHtmlInput.value.trim(),
        css: componentCssInput.value.trim(),
        javascript: componentJsInput.value.trim(),
    };
    db.saveComponent(component);
    closeComponentModal();
    renderComponentList();
    selectComponentForPreview(id);
}

function handleDeleteComponentFromModal() {
    const componentId = deleteComponentButton.dataset.id;
    if (componentId && confirm(`Delete component "${componentId}"?`)) {
        db.deleteComponent(componentId);
        closeComponentModal();
        renderComponentList();
        contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
    }
}

function renderComponentList() {
    if (!contextComponentList) return;
    const components = db.listComponents().sort((a, b) => a.name.localeCompare(b.name));
    contextComponentList.innerHTML = '';
    if (components.length === 0) {
        contextComponentList.innerHTML = '<p class="empty-list-message">No components yet.</p>';
        return;
    }
    components.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'component-list-item';
        item.dataset.id = comp.id;
        item.innerHTML = `<span class="component-name">${comp.name}</span><span class="component-id">(${comp.id})</span>`;
        item.addEventListener('click', () => selectComponentForPreview(comp.id));
        contextComponentList.appendChild(item);
    });
}

function selectComponentForPreview(componentId) {
    if (!contextComponentViewer) return;
    contextComponentList.querySelectorAll('.component-list-item').forEach(el => el.classList.toggle('selected', el.dataset.id === componentId));
    const comp = db.getComponent(componentId);
    if (!comp) {
        contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Component not found.</div>';
        return;
    }
    const previewHtml = `<!DOCTYPE html><html><head><style>body{margin:10px;font-family:sans-serif}${comp.css||''}</style></head><body>${comp.html||''}<script>(function(){try{${comp.javascript||''}}catch(e){console.error(e)}})();<\/script></body></html>`;
    contextComponentViewer.innerHTML = `<div class="component-viewer-header"><h3>${comp.name}</h3><p>${comp.description||'No description.'}</p><button class="action-button" id="edit-selected-component-button">Edit</button></div><div class="component-preview-container"><h4>Preview</h4><iframe id="context-preview-frame" sandbox="allow-scripts allow-same-origin"></iframe></div><div class="component-code-container"><h4>Code</h4><details open><summary>HTML</summary><textarea readonly>${comp.html||''}</textarea></details><details><summary>CSS</summary><textarea readonly>${comp.css||''}</textarea></details><details><summary>JavaScript</summary><textarea readonly>${comp.javascript||''}</textarea></details></div>`;
    contextComponentViewer.querySelector('#context-preview-frame').srcdoc = previewHtml;
    contextComponentViewer.querySelector('#edit-selected-component-button').addEventListener('click', () => openComponentModal(componentId));
}

function handleDownloadContext() {
    const library = db.getComponentLibrary();
    if (Object.keys(library).length === 0) return alert("Library is empty.");
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
    triggerBlobDownload(blob, 'vibe-component-library.json');
}

function handleUploadContextTrigger() {
    contextUploadInput.click();
}

async function processContextUpload(event) {
    const file = event.target.files?.;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newLibrary = JSON.parse(e.target.result);
            if (typeof newLibrary !== 'object' || newLibrary === null || Array.isArray(newLibrary)) {
                throw new Error("Invalid format: must be a JSON object.");
            }
            if (!confirm(`This will replace your current library. Continue?`)) return;
            db.saveComponentLibrary(newLibrary);
            renderComponentList();
            contextComponentViewer.innerHTML = '<div class="files-preview-placeholder">Select a component to view it.</div>';
        } catch (error) {
            alert(`Error importing library: ${error.message}`);
        } finally {
            contextUploadInput.value = '';
        }
    };
    reader.readAsText(file);
}

async function extractAndOpenComponentModal(nodeId, buttonElement = null) {
    const node = findNodeById(nodeId);
    if (!node) return;

    let originalHtml = '';
    if (buttonElement) {
        originalHtml = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = 'Analyzing...';
    }
    
    try {
        const systemPrompt = `You are a component extractor. Analyze a "vibe tree" and extract a node and its dependencies into a self-contained, reusable component.
**ANALYSIS:** Find the target node's HTML (including children). Find all CSS and JS in the tree that applies to that HTML.
**OUTPUT:** A single, valid JSON object: \`{ "id": "...", "name": "...", "description": "...", "html": "...", "css": "...", "javascript": "..." }\``;
        const userPrompt = `Extract node "${nodeId}" from this Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;
        const rawResponse = await callAI(systemPrompt, userPrompt, true);
        const extractedComponent = JSON.parse(rawResponse);
        if (!extractedComponent.id || !extractedComponent.name) throw new Error("AI failed to return a valid component structure.");
        
        closeEditNodeModal();
        switchToTab('context');
        openComponentModal(null, extractedComponent);
    } catch (e) {
        logToConsole(`AI analysis failed: ${e.message}`, 'error');
        buttonElement?.closest('.modal-content')?.querySelector('.modal-error')?.textContent = `AI analysis failed: ${e.message}`;
    } finally {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalHtml;
        }
    }
}

async function handleSaveNodeAsComponent(event) {
    await extractAndOpenComponentModal(event.target.dataset.nodeId, event.target);
}
async function handleSaveNodeAsComponentFromEditor(event) {
    await extractAndOpenComponentModal(event.target.dataset.id, event.target);
}

let filesState = { selectedPath: null, clipboard: null };

function renderFileTree() {
    if (!filesTreeEl) return;
    filesTreeEl.innerHTML = '';
    if (!currentProjectId) {
        filesTreeEl.innerHTML = '<div class="files-empty">No project loaded.</div>';
        return;
    }
    const paths = db.listFiles(currentProjectId);
    if (!paths || paths.length === 0) {
        filesTreeEl.innerHTML = '<div class="files-empty">No files in project.</div>';
        return;
    }

    const root = buildFolderTree(paths);
    const ul = document.createElement('ul');
    ul.className = 'files-ul';
    
    function renderNode(node, parentUl) {
        // This is a simplified render. A full implementation would handle nesting.
        [...node.children.values()].forEach(child => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${child.type === 'folder' ? '📁' : '📄'} ${child.name}</span>`;
            if (child.type === 'file') {
                li.addEventListener('click', (e) => { e.stopPropagation(); selectFile(child.path, li); });
            }
            parentUl.appendChild(li);
        });
    }
    renderNode(root, ul);
    filesTreeEl.appendChild(ul);
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
    try {
        const meta = db.getFileMeta(currentProjectId, path);
        if (!meta) throw new Error("File not found");

        const info = document.createElement('div');
        info.className = 'files-preview-info';
        info.innerHTML = `<strong>Path:</strong> <code>${path}</code>`;
        
        if (meta.isBinary) {
            const blob = await db.getFileBlob(currentProjectId, path);
            const url = URL.createObjectURL(blob);
            let previewEl;
            if (meta.mime.startsWith('image/')) previewEl = document.createElement('img');
            else if (meta.mime.startsWith('video/')) { previewEl = document.createElement('video'); previewEl.controls = true; }
            else if (meta.mime.startsWith('audio/')) { previewEl = document.createElement('audio'); previewEl.controls = true; }
            if (previewEl) { previewEl.src = url; filesPreviewEl.appendChild(previewEl); }
        } else {
            const text = await db.readTextFile(currentProjectId, path);
            const ta = document.createElement('textarea');
            ta.className = 'files-preview-text';
            ta.value = text;
            filesPreviewEl.appendChild(ta);
            const saveBtn = document.createElement('button');
            saveBtn.className = 'action-button';
            saveBtn.textContent = 'Save';
            saveBtn.addEventListener('click', () => db.saveTextFile(currentProjectId, path, ta.value).then(() => autoSaveProject()));
            filesPreviewEl.appendChild(saveBtn);
        }
        filesPreviewEl.appendChild(info);
    } catch (e) {
        filesPreviewEl.innerHTML = `<div class="files-preview-placeholder">Failed to preview: ${e.message}</div>`;
    }
}

function ensureProjectForFiles() {
    if (currentProjectId) return true;
    alert('Please create or load a project first.');
    return false;
}

async function handleFilesUpload() {
    if (!ensureProjectForFiles()) return;
    for (const f of Array.from(filesUploadInput.files || [])) {
        const path = `assets/${f.name}`;
        try {
            if (f.type.startsWith('text/')) {
                await db.saveTextFile(currentProjectId, path, await f.text());
            } else {
                await db.saveBinaryFile(currentProjectId, path, new Uint8Array(await f.arrayBuffer()), f.type);
            }
        } catch (e) { console.error('Upload error:', e); }
    }
    renderFileTree();
    autoSaveProject();
    filesUploadInput.value = '';
}

async function handleFilesNew(isFolder) {
    if (!ensureProjectForFiles()) return;
    const promptMsg = isFolder ? 'New folder path:' : 'New file path:';
    const defaultVal = isFolder ? 'assets/new-folder' : 'assets/new-file.txt';
    const path = prompt(promptMsg, defaultVal);
    if (!path) return;
    const finalPath = isFolder ? `${path.replace(/\/+$/, '')}/.keep` : path;
    await db.saveTextFile(currentProjectId, finalPath, '');
    renderFileTree();
    if (!isFolder) selectFile(path);
    autoSaveProject();
}

async function handleFilesDownload() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    try {
        const blob = await db.getFileBlob(currentProjectId, filesState.selectedPath);
        triggerBlobDownload(blob, filesState.selectedPath.split('/').pop());
    } catch (e) { alert(`Download failed: ${e.message}`); }
}

async function handleFilesRename() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    const newPath = prompt('New path/name:', filesState.selectedPath);
    if (!newPath || newPath === filesState.selectedPath) return;
    try {
        await db.renameFile(currentProjectId, filesState.selectedPath, newPath);
        renderFileTree();
        selectFile(newPath);
        autoSaveProject();
    } catch (e) { alert(`Rename failed: ${e.message}`); }
}

async function handleFilesDelete() {
    if (!ensureProjectForFiles() || !filesState.selectedPath) return;
    if (!confirm(`Delete "${filesState.selectedPath}"?`)) return;
    try {
        db.deleteFile(currentProjectId, filesState.selectedPath);
        filesState.selectedPath = null;
        renderFileTree();
        if (filesPreviewEl) filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file.</div>';
        autoSaveProject();
    } catch (e) { alert(`Delete failed: ${e.message}`); }
}

document.addEventListener('DOMContentLoaded', () => {
    function bindEventListeners() {
        handleTabSwitching();
        toggleInspectButton?.addEventListener('click', toggleInspectMode);
        undoButton?.addEventListener('click', doUndo);
        redoButton?.addEventListener('click', doRedo);
        updateTreeFromCodeButton?.addEventListener('click', handleUpdateTreeFromCode);
        uploadHtmlButton?.addEventListener('click', () => htmlFileInput.click());
        htmlFileInput?.addEventListener('change', handleFileUpload);
        uploadZipButton?.addEventListener('click', () => zipFileInput.click());
        zipFileInput?.addEventListener('change', handleZipUpload);
        downloadZipButton?.addEventListener('click', handleDownloadProjectZip);
        filesUploadButton?.addEventListener('click', () => filesUploadInput.click());
        filesUploadInput?.addEventListener('change', handleFilesUpload);
        filesNewFolderButton?.addEventListener('click', () => handleFilesNew(true));
        filesNewFileButton?.addEventListener('click', () => handleFilesNew(false));
        filesDownloadButton?.addEventListener('click', handleFilesDownload);
        filesRenameButton?.addEventListener('click', handleFilesRename);
        filesDeleteButton?.addEventListener('click', handleFilesDelete);
        searchInput?.addEventListener('input', performSearch);
        findNextButton?.addEventListener('click', findNextMatch);
        findPrevButton?.addEventListener('click', findPrevMatch);
        aiEditorSearchButton?.addEventListener('click', handleAiEditorSearch);
        aiEditorSearchInput?.addEventListener('keydown', (e) => e.key === 'Enter' && handleAiEditorSearch());
        runAgentSingleTaskButton?.addEventListener('click', handleRunAgent);
        startIterativeSessionButton?.addEventListener('click', handleStartIterativeSession);
        acceptContinueButton?.addEventListener('click', handleAcceptAndContinue);
        requestChangesButton?.addEventListener('click', handleRequestChanges);
        endSessionButton?.addEventListener('click', handleEndIterativeSession);
        generateFlowchartButton?.addEventListener('click', handleGenerateFlowchart);
        generateProjectButton?.addEventListener('click', handleGenerateProject);
        sendChatButton?.addEventListener('click', handleSendChatMessage);
        chatPromptInput?.addEventListener('keydown', (e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChatMessage()));
        addNewComponentButton?.addEventListener('click', () => openComponentModal(null));
        saveComponentButton?.addEventListener('click', handleSaveComponent);
        closeComponentModalButton?.addEventListener('click', closeComponentModal);
        deleteComponentButton?.addEventListener('click', handleDeleteComponentFromModal);
        generateComponentButton?.addEventListener('click', handleAiGenerateComponent);
        downloadContextButton?.addEventListener('click', handleDownloadContext);
        uploadContextButton?.addEventListener('click', handleUploadContextTrigger);
        contextUploadInput?.addEventListener('change', processContextUpload);
        openSettingsModalButton?.addEventListener('click', () => settingsModal.style.display = 'block');
        startPageSettingsButton?.addEventListener('click', () => settingsModal.style.display = 'block');
        closeSettingsModalButton?.addEventListener('click', () => settingsModal.style.display = 'none');
        createNodeButton?.addEventListener('click', handleCreateNode);
        addNodeModal?.querySelector('.close-button')?.addEventListener('click', () => addNodeModal.style.display = 'none');
        saveEditNodeButton?.addEventListener('click', handleSaveEditedNode);
        closeEditNodeModalButton?.addEventListener('click', closeEditNodeModal);
        aiImproveDescriptionButton?.addEventListener('click', handleAiImproveDescription);
        saveAsComponentButton?.addEventListener('click', handleSaveNodeAsComponent);
        aiProviderSelect?.addEventListener('change', handleProviderChange);
        geminiModelSelect?.addEventListener('change', () => localStorage.setItem('geminiModel', geminiModelSelect.value));
        saveApiKeyButton?.addEventListener('click', saveGeminiApiKey);
        saveNscaleApiKeyButton?.addEventListener('click', saveNscaleApiKey);
        newProjectButton?.addEventListener('click', resetToStartPage);
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) settingsModal.style.display = 'none';
            if (e.target === addNodeModal) addNodeModal.style.display = 'none';
            if (e.target === editNodeModal) editNodeModal.style.display = 'none';
            if (e.target === contextComponentModal) contextComponentModal.style.display = 'none';
        });
    }
    
    bindEventListeners();
    initializeApiSettings();
    initializeMermaid();
    populateProjectList();
    renderComponentList();
    resetHistory();
});

function resetToStartPage() {
    currentProjectId = null;
    vibeTree = JSON.parse(JSON.stringify(initialVibeTree));
    resetHistory();
    switchToTab('start');
    projectPromptInput.value = '';
    newProjectIdInput.value = '';
    startPageGenerationOutput.style.display = 'none';
    newProjectContainer.style.display = 'block';
    editorContainer.innerHTML = '';
    previewContainer.srcdoc = '';
    agentOutput.innerHTML = '<div class="agent-message-placeholder">...</div>';
    chatOutput.innerHTML = '<div class="chat-message-placeholder">...</div>';
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">...</div>';
    consoleOutput.innerHTML = '';
    fullCodeEditor.value = '';
    populateProjectList();
    logToConsole("Ready for new project.", "info");
}

async function updateNodeByDescription(nodeId, newDescription, buttonEl = null) {
    const node = findNodeById(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    node.description = newDescription;

    let originalHtml = '';
    if (buttonEl) {
        originalHtml = buttonEl.innerHTML;
        buttonEl.disabled = true;
        buttonEl.innerHTML = 'Updating...';
    }
    try {
        if (node.type === 'container') {
            node.children = await generateCompleteSubtree(node);
            refreshAllUI();
        } else {
            const systemPrompt = getAgentSystemPrompt();
            const userPrompt = `Update component "${node.id}" to: "${newDescription}".\n\nFull Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;
            const rawResponse = await callAI(systemPrompt, userPrompt, true);
            const agentDecision = JSON.parse(rawResponse);
            executeAgentPlan(agentDecision, (msg, t) => logToConsole(`[ModalUpdate] ${msg}`, t));
        }
        switchToTab('preview');
    } finally {
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.innerHTML = originalHtml;
        }
    }
}

async function renderMermaidInto(container, graphText) {
    container.innerHTML = `<div class="mermaid">${graphText}</div>`;
    try {
        await window.mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
    } catch (e) {
        container.innerHTML = `<div class="flowchart-placeholder">Render error: ${e.message}</div>`;
    }
}

async function handleGenerateFlowchart() {
    if (typeof window.mermaid === 'undefined') return;

    const originalText = generateFlowchartButton.innerHTML;
    generateFlowchartButton.disabled = true;
    generateFlowchartButton.innerHTML = 'Generating...';
    flowchartOutput.innerHTML = '<div class="loading-spinner"></div>';

    const systemPrompt = `You are a frontend architect. Given a "vibe tree", produce a Mermaid diagram explaining its structure and behavior. Return ONLY a Mermaid definition (prefer 'graph TD').`;
    const userPrompt = `Create a Mermaid diagram for this Vibe Tree:\n\`\`\`json\n${JSON.stringify(vibeTree, null, 2)}\n\`\`\``;

    try {
        const aiText = await callAI(systemPrompt, userPrompt, false);
        const mermaidText = extractMermaidFromText(aiText);
        if (!mermaidText) throw new Error('AI did not return a valid Mermaid graph.');
        await renderMermaidInto(flowchartOutput, mermaidText);
    } catch (e) {
        logToConsole(`AI flowchart failed (${e.message}). Falling back to basic graph.`, 'warn');
        await renderMermaidInto(flowchartOutput, buildBasicMermaidFromTree(vibeTree));
    } finally {
        generateFlowchartButton.disabled = false;
        generateFlowchartButton.innerHTML = originalText;
    }
}

async function handleGenerateProject() {
    try {
        const prompt = projectPromptInput.value.trim();
        if (!prompt) return;

        let desiredId = newProjectIdInput.value.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '') || `project-${Date.now()}`;
        let projectId = desiredId;
        let suffix = 2;
        while (db.listProjects().includes(projectId)) projectId = `${desiredId}-${suffix++}`;

        newProjectContainer.style.display = 'none';
        startPageGenerationOutput.style.display = 'block';
        generationStatusText.textContent = 'Generating project...';

        vibeTree = { id: 'whole-page', type: 'container', description: prompt, children: [] };
        vibeTree.children = await generateCompleteSubtree(vibeTree);
        currentProjectId = projectId;
        resetHistory();
        autoSaveProject();
        populateProjectList();
        refreshAllUI();
        switchToTab('preview');
    } catch (e) {
        alert(`Failed to generate project: ${e.message}`);
    } finally {
        newProjectContainer.style.display = 'block';
        startPageGenerationOutput.style.display = 'none';
    }
}

async function handleAiImproveDescription() {
    const nodeId = editNodeIdInput.value;
    const node = findNodeById(nodeId);
    if (!node) return;

    const originalHtml = aiImproveDescriptionButton.innerHTML;
    aiImproveDescriptionButton.disabled = true;
    aiImproveDescriptionButton.innerHTML = 'Analyzing...';
    
    try {
        const systemPrompt = `You are a technical writer. Given a component's context, write an improved, detailed description in 2-5 sentences. Focus on intent, structure, and behavior. Output plain text only.`;
        const context = {
            node: { id: node.id, type: node.type, currentDescription: node.description || '', code: node.code || '' },
            parent: findNodeAndParentById(node.id)?.parent
        };
        const userPrompt = `Improve description for:\n${JSON.stringify(context, null, 2)}`;
        let improved = (await callAI(systemPrompt, userPrompt, false)).trim();
        if (improved) editNodeDescriptionInput.value = improved;
    } catch (e) {
        editNodeError.textContent = e.message;
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
    btn.textContent = isCollapsed ? '▶' : '▼';
}

function handleNodeContentToggle(event) {
    if (event.target.classList.contains('drag-handle') || event.target.tagName === 'BUTTON' || event.target.tagName === 'TEXTAREA') return;
    event.currentTarget.closest('.vibe-node').classList.toggle('collapsed');
}
