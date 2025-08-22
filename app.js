import { DataBase } from './database.js';

const db = new DataBase();
window.db = db; // Make db globally accessible if needed for debugging

const previewContainer = document.getElementById('website-preview');
const editorContainer = document.getElementById('vibe-editor');
const toggleInspectButton = document.getElementById('toggle-inspect-button');

/* NEW: Undo/Redo buttons */
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// Start Page elements
const startPage = document.getElementById('start-page');
const mainContainer = document.querySelector('.container');
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
const runAgentButton = document.getElementById('run-agent-button');
const agentOutput = document.getElementById('agent-output');

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
        
        // Create the main error message element
        const pre = document.createElement('pre');
        pre.textContent = `${timestamp}${errorMessageText}`;
        msgEl.appendChild(pre);
        
        // Create the "Fix with AI" button if an API key is present
        if (geminiApiKey) {
            const fixButton = document.createElement('button');
            fixButton.textContent = 'Fix with AI';
            fixButton.className = 'fix-error-button action-button';
            fixButton.onclick = () => handleFixError(errorMessageText, fixButton);
            msgEl.appendChild(fixButton);
        }

    } else { // Handle other log types as before
        let displayMessage;
        // Special handling for Error objects to get more details like stack trace
        if (message instanceof Error) {
            displayMessage = `${message.name || 'Error'}: ${message.message}\n${message.stack || ''}`;
        } else if (typeof message === 'object' && message !== null) {
            try {
                // Attempt to pretty-print objects. The 'replacer' handles cases where an object might have lost its properties.
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
    consoleOutput.scrollTop = consoleOutput.scrollHeight; // Auto-scroll
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
    summary.textContent = ` ${title}`; // Add space for alignment
    
    const pre = document.createElement('pre');
    pre.textContent = content; // Using textContent is safer and pre preserves formatting

    detail.appendChild(summary);
    detail.appendChild(pre);

    const timestampNode = document.createTextNode(timestamp);
    msgEl.appendChild(timestampNode);
    msgEl.appendChild(detail);

    consoleOutput.appendChild(msgEl);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Override console methods to also log to our on-page console
const originalConsole = { ...console };
console.log = function(...args) {
    originalConsole.log(...args);
    logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '), 'log');
};
console.error = function(...args) {
    originalConsole.error(...args);
    // Log each argument separately to handle complex objects like Error instances better
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
    // This catches errors from the dynamically added scripts
    console.error(e.error || e.message);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// --- End On-page Console Logging ---

let currentProjectId = null;
let agentConversationHistory = [];

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
    if (label) console.info(`History recorded: ${label}`);
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
    runAgentButton.disabled = !keyIsAvailable;
    updateTreeFromCodeButton.disabled = !keyIsAvailable;
    uploadHtmlButton.disabled = !keyIsAvailable;
    generateFlowchartButton.disabled = !keyIsAvailable;
    generateProjectButton.disabled = !keyIsAvailable;
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
    
    console.info(`AI Provider set to: ${currentAIProvider}`);
    console.info(`Gemini model set to: ${geminiModelSelect.value}`);
}

function handleProviderChange() {
    currentAIProvider = aiProviderSelect.value;
    localStorage.setItem('aiProvider', currentAIProvider);
    console.info(`Switched AI Provider to: ${currentAIProvider}`);
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
    autoSaveProject();
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

function renderEditor(node) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `vibe-node type-${node.type}`;
    // Any HTML node can be a container for other nodes.
    const isContainer = node.type === 'container' || node.type === 'html';
    const showCodeButton = node.type !== 'container';

    // Special handling for the head node: it's not a container for other nodes in the UI
    // but it has editable code.
    const isHeadNode = node.type === 'head';

    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    nodeEl.innerHTML = `
        <div class="vibe-node-header">
            <span class="id">
                ${hasChildren ? `<button class="collapse-toggle" aria-expanded="false" title="Expand/Collapse">▶</button>` : ''}
                ${node.id}
            </span>
            <span class="type">${node.type}</span>
        </div>
        <textarea class="description-input" rows="3" placeholder="Describe the purpose of this component...">${node.description}</textarea>
        <div class="button-group">
            <button class="update-button" data-id="${node.id}">Update Vibe</button>
            ${isContainer ? `<button class="add-child-button" data-id="${node.id}">+ Add Child</button>` : ''}
            ${(showCodeButton || isHeadNode) ? `<button class="toggle-code-button" data-id="${node.id}">View Code</button>` : ''}
            ${(showCodeButton || isHeadNode) ? `<button class="save-code-button" data-id="${node.id}" style="display: none;">Save Code</button>` : ''}
        </div>
        ${(showCodeButton || isHeadNode) ? `<textarea class="code-editor-display" id="editor-${node.id}" style="display: none;"></textarea>` : ''}
    `;

    // Render children (collapsed by default if any)
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
    logToConsole(`Updating node '${nodeId}' with new description...`, 'info');
    
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

            // Log the plan to the main console for visibility
            const consoleLogger = (message, type) => {
                const cleanMessage = message.replace(/<strong>|<\/strong>/g, '');
                const logFunc = console[type] || console.log;
                logFunc(`[UpdateEngine] ${cleanMessage}`);
            };
            
            executeAgentPlan(agentDecision, consoleLogger);
        }
    } catch (error) {
        console.error("Failed to update vibes:", error);
        logToConsole(`An error occurred during the update: ${error.message}. Check the console for details.`, 'error');
        alert(`An error occurred during the update: ${error.message}. Check the console for details.`);
    } finally {
        button.disabled = false;
        button.innerHTML = 'Update Vibe';
    }
}

function refreshAllUI() {
    logToConsole('Refreshing entire UI: Vibe Editor, Website Preview, and Full Code.', 'info');
    renderVibeEditorUI(); 
    applyVibes();
    // Invalidate flowchart since code has changed
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Code has changed. Click "Generate Flowchart" to create an updated diagram.</div>';

    // Update the full code view if it's the active tab
    if (document.getElementById('code').classList.contains('active')) {
        showFullCode(); 
    }

    // NEW: keep the Files tab in sync with the currently loaded project
    // This ensures the file system reflects the active project's files immediately.
    renderFileTree();

    updateUndoRedoUI(); 
    autoSaveProject();
}

async function callAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    console.info('--- Calling AI ---');
    let assetsNote = '';
    try {
        const files = currentProjectId ? db.listFiles(currentProjectId) : [];
        if (files.length) {
            assetsNote = `

Available project assets (use these paths when referencing assets in HTML/CSS/JS):
${files.slice(0, 50).map(p => `- ${p}`).join('\n')}${files.length > 50 ? `\n...and ${files.length - 50} more` : ''}

When you need to embed an image/video/font/etc., reference it directly by its path (e.g., src="assets/images/logo.png").`;
        }
    } catch {}
    const augmentedUserPrompt = userPrompt + assetsNote;

    logToConsole('Sending request to AI model...', 'info');
    logDetailed('System Prompt Sent to AI', systemPrompt);
    logDetailed('User Prompt Sent to AI', augmentedUserPrompt);

    if (currentAIProvider === 'nscale') {
        if (streamCallback) {
            console.warn("Streaming is not supported for nscale provider in this implementation.");
        }
        return callNscaleAI(systemPrompt, augmentedUserPrompt, forJson);
    }
    return callGeminiAI(systemPrompt, augmentedUserPrompt, forJson, streamCallback);
}

async function callGeminiAI(systemPrompt, userPrompt, forJson = false, streamCallback = null) {
    if (!geminiApiKey) {
        throw new Error("Gemini API key is not set.");
    }

    const model = geminiModelSelect.value;
    // Use the streaming endpoint if a callback is provided
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

    if (forJson && !useStreaming) { // Streaming with JSON response type is not standard
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

            // This function processes a complete or partial chunk of streamed data
            const processChunk = (chunk) => {
                if (chunk.trim().startsWith('"text":')) {
                    try {
                        const jsonChunk = `{${chunk}}`; // Make it valid JSON
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
                    // Process any remaining data in the buffer when the stream is finished
                    processChunk(buffer);
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                
                // Process buffer line by line, as streaming responses are chunked
                let boundary = buffer.indexOf('\n');
                while (boundary !== -1) {
                    const line = buffer.substring(0, boundary).trim();
                    buffer = buffer.substring(boundary + 1);
                    processChunk(line);
                    boundary = buffer.indexOf('\n');
                }
            }
            
            logToConsole('Successfully received streaming response from Gemini.', 'info');
            logDetailed('Full Raw Gemini Response (Streamed)', fullResponseText);
            return fullResponseText;
        }

        // Non-streaming path
        const data = await response.json();
        console.info('--- Gemini Response Received ---');

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
             throw new Error('Invalid response structure from Gemini API.');
        }

        const content = data.candidates[0].content.parts[0].text;
        
        logToConsole('Successfully received response from Gemini.', 'info');
        logDetailed('Raw Gemini Response', content);

        // On successful call, maybe repopulate the full code view if it's active
        if (document.getElementById('code').classList.contains('active')) {
            showFullCode();
        }
        return content;
    } catch(e) {
        console.error("Error calling Gemini AI:", e);
        // The AI might return a valid JSON but with an error message inside.
        // Let's try to parse it to provide more context.
        try {
            const errorJson = JSON.parse(e.message);
            if(errorJson.error && errorJson.error.message) {
                 throw new Error(`Gemini AI communication failed: ${errorJson.error.message}`);
            }
        } catch (parseError) {
             // Not a JSON error, re-throw original.
        }
        logToConsole(`Gemini AI communication failed: ${e.message}`, 'error');
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
    logToConsole(`Generating components for "${parentNode.id}"...`, 'info');

    const systemPrompt = `You are an expert system that designs a complete website component hierarchy based on a high-level description. Your task is to generate a valid JSON array of "vibe nodes" that represent the children of a given container.

**INPUT:** A JSON object containing the parent container's ID and description.

**OUTPUT:** A single, valid JSON array of vibe node objects. DO NOT include any explanatory text, comments, or markdown formatting outside of the JSON array itself. The output MUST be a JSON array [] and nothing else.

**JSON SCHEMA & RULES for each node in the array:**

1.  **Component Node Object:** Each object in the array must have:
    *   id: A unique, descriptive, kebab-case identifier (e.g., "main-header", "feature-section-styles").
    *   type: "head", "html", "css", or "javascript". Only the root "whole-page" container should have a "head" child.
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

4.  **GLOBAL SCOPE:** CSS and JavaScript nodes should generally be children of the "whole-page" container to apply globally, unless they are extremely specific to a deeply nested component.

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
        // The AI might wrap the response in markdown. Let's strip it.
        const fence = jsonResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fence && fence[1]) {
            jsonResponse = fence[1];
        }

        const childrenArray = JSON.parse(jsonResponse);
        if (!Array.isArray(childrenArray)) {
            throw new Error("AI did not return a valid JSON array.");
        }
        console.log("Successfully parsed generated subtree from AI.");
        logToConsole(`Successfully generated ${childrenArray.length} new components.`, 'info');
        
        // --- Live code update on start page (now handled by streaming) ---
        // if (startPage.classList.contains('active')) {
        //     let tempTree = JSON.parse(JSON.stringify(vibeTree));
        //     tempTree.children = childrenArray;
        //     liveCodeOutput.textContent = generateFullCodeString(tempTree);
        // }
        // --- End live code update ---

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
                // nscale API might not have a dedicated JSON mode, so we request it in the prompt.
                // The parsing logic will handle the response.
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`nscale API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.info('--- nscale Response Received ---');

        if (!data.choices ||!Array.isArray(data.choices) || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error('Invalid response structure from nscale API.');
        }

        let content = data.choices[0].message.content;
        logToConsole('Successfully received response from nscale.', 'info');
        logDetailed('Raw nscale Response', content);
        
        // If JSON is expected, attempt to clean and parse it.
        if (forJson) {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                content = jsonMatch[1];
            }
        }

        return content;

    } catch (e) {
        console.error("Error calling nscale AI:", e);
        logToConsole(`nscale AI communication failed: ${e.message}`, 'error');
        throw new Error(`nscale AI communication failed: ${e.message}`);
    }
}

/**
 * Parses a full HTML string into a vibeTree structure using the DOMParser API.
 * This is a non-AI, client-side alternative to decomposeCodeIntoVibeTree.
 * @param {string} fullCode The full HTML content as a string.
 * @returns {object} A vibeTree object.
 */
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

    const htmlNodes = [];
    const cssNodes = [];
    const jsNodes = [];
    let headNode = null;

    // 1. Process <head> content
    const headContent = [];
    doc.head.childNodes.forEach(child => {
        // We capture meta, title, link but exclude style (handled separately) and script (handled separately)
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

    // 2. Process CSS from <style> tags in the <head>
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
        // Skip script tags when creating HTML nodes
        if (element.tagName.toLowerCase() === 'script') {
            return;
        }
      
        let elementId = element.id;
        if (!elementId) {
            // Generate a descriptive ID if one doesn't exist.
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

    // 4. Process JS from <script> tags inside the body (and head)
    const scriptTags = Array.from(doc.querySelectorAll('script'));
    scriptTags.forEach((scriptTag, index) => {
        if (!scriptTag.src && scriptTag.textContent.trim()) {
            let code = scriptTag.textContent.trim();
            // The system sometimes wraps user JS in an IIFE. Let's unwrap it if it exists.
            const iifeMatch = code.match(/^\s*\(\s*function\s*\(\s*\)\s*\{([\s\S]*?)\s*\}\s*\(\s*\);?\s*$/);
            if (iifeMatch) {
                code = iifeMatch[1];
            }

            jsNodes.push({
                id: `page-script-${index + 1}`,
                type: 'javascript',
                description: 'JavaScript logic from an inline <script> tag.',
                code: code
            });
        }
    });
    
    // Assemble the children array in the correct order: head -> HTML -> CSS -> JS
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
    *   type: "head", "html", "css", or "javascript".
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

4.  **CSS & JS DECOMPOSITION:**
    *   Extract content of <style> and <script> tags into css and javascript nodes. These should typically be children of the "whole-page" root container, not nested deep inside HTML nodes, unless they are extremely specific to one component.

5 **HEAD DECOMPOSITION:**
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
    }
  ]
}
`;

    const userPrompt = `Decompose the following code into the vibe tree JSON structure:\n\n\`\`\`html\n${fullCode}\n\`\`\``;

    const rawResponse = await callAI(systemPrompt, userPrompt, true);

    // Helper: try progressively more aggressive JSON extraction strategies
    function tryParseVarious(text) {
        // 1) Trim and try direct JSON
        try {
            const direct = JSON.parse(text.trim());
            return direct;
        } catch {}

        // 2) Strip fenced blocks like ```json ... ```
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fence && fence[1]) {
            try {
                return JSON.parse(fence[1]);
            } catch {}
        }

        // 3) Find first '{' and last '}' and attempt to parse that slice
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const slice = text.slice(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(slice);
            } catch {}
        }

        // 4) Attempt to collect a balanced JSON object by scanning braces
        let start = text.indexOf('{');
        while (start !== -1) {
            let depth = 0;
            for (let i = start; i < text.length; i++) {
                const ch = text[i];
                if (ch === '{') depth++;
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) {
                        const candidate = text.slice(start, i + 1);
                        try {
                            return JSON.parse(candidate);
                        } catch (parseError) {
                            break; // try next start
                        }
                    }
                }
            }
            start = text.indexOf('{', start + 1);
        }

        return null;
    }

    try {
        const parsed = tryParseVarious(rawResponse);

        if (!parsed) {
            // Fallback: client-side parser to keep processing from failing
            console.warn("AI did not return valid JSON. Falling back to client-side HTML parser.");
            logToConsole('AI returned invalid JSON; using client-side HTML parser instead.', 'warn');
            return parseHtmlToVibeTree(fullCode);
        }

        if (!parsed.id || parsed.type !== 'container' || !Array.isArray(parsed.children)) {
            console.warn("AI JSON missing required root container fields. Falling back to client-side parser.");
            logToConsole('AI JSON missing required fields; using client-side parser instead.', 'warn');
            return parseHtmlToVibeTree(fullCode);
        }

        console.log("Successfully parsed decomposed vibe tree from AI.");
        return parsed;
    } catch (e) {
        // Final safety net: fallback to client-side parsing
        console.warn("Failed to parse vibe tree JSON from AI, using client-side parser. Raw response logged.", e);
        logToConsole(`AI JSON parse failed (${e.message}); using client-side parser.`, 'warn');
        return parseHtmlToVibeTree(fullCode);
    }
}

async function processCodeAndRefreshUI(fullCode) {
    if (!fullCode.trim()) {
        alert("The code is empty. There is nothing to process.");
        logToConsole("Processing aborted: code is empty.", 'warn');
        return;
    }

    const buttonsToDisable = [updateTreeFromCodeButton, uploadHtmlButton];
    const originalButtonTexts = new Map();
    buttonsToDisable.forEach(b => {
        originalButtonTexts.set(b, b.innerHTML);
        b.disabled = true;
        b.innerHTML = 'Processing... <div class="loading-spinner"></div>';
    });

    logToConsole(`Processing full code to update vibe tree.`, 'info');
    
    try {
        // Record before replacement
        recordHistory('Process full code (replace tree)');

        const newVibeTree = await decomposeCodeIntoVibeTree(fullCode);
        vibeTree = newVibeTree;

        renderVibeEditorUI(); 
        applyVibes();
        showFullCode(); 
        logToConsole("Update from code complete. UI refreshed.", 'info');
        document.querySelector('.tab-button[data-tab="preview"]').click();
        // Update last snapshot since vibeTree changed significantly
        historyState.lastSnapshotSerialized = serializeTree(vibeTree);
        autoSaveProject();

    } catch (error) {
        console.error("Flattened to update vibes from full code:", error);
        logToConsole(`Failed to process code: ${error.message}`, 'error');
        alert(`An error occurred during processing: ${error.message}. Check the console for details.`);
    } finally {
        buttonsToDisable.forEach(b => {
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
    logToConsole(`File selected: ${file.name} (${file.type})`, 'info');
    if (!file.type.includes('html')) {
        console.warn(`File selected is not of type text/html. It is: ${file.type}. Proceeding anyway.`);
        logToConsole(`Warning: Selected file is not of type text/html. It is: ${file.type}. Proceeding anyway.`, 'warn');
    }

    // Create/assign a project ID from the filename and ensure uniqueness before processing
    const baseId = file.name.replace(/\.(html|htm)$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    let projectId = baseId || `html-project-${Date.now()}`;
    const existing = db.listProjects();
    let suffix = 1;
    while (existing.includes(projectId)) {
        projectId = `${baseId}-${suffix++}`;
    }
    currentProjectId = projectId;
    logToConsole(`New project ID assigned from file: ${currentProjectId}`, 'info');

    const reader = new FileReader();
    
    reader.onload = async (event) => {
        const fileContent = event.target.result;
        // Show code in the Full Code editor
        fullCodeEditor.value = fileContent;

        // Process with AI to decompose into Vibe Tree and refresh UI
        await processCodeAndRefreshUI(fileContent);

        // If user triggered upload from the start page (rare), move them into the main UI
        if (startPage.classList.contains('active')) {
            startPage.classList.remove('active');
            mainContainer.classList.add('active');
        }

        // Persist project
        autoSaveProject();
        logToConsole(`HTML project '${currentProjectId}' imported and processed with AI.`, 'info');
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
 * basePath should be a directory-like path (e.g. 'site/' or 'site/subdir/').
 */
function resolveZipPath(basePath, relativePath) {
    if (!relativePath) return '';
    // If it's already absolute (starts with / or has a protocol), return as-is
    if (/^[a-z]+:\/\//i.test(relativePath) || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) return relativePath;
    if (relativePath.startsWith('/')) {
        // Treat leading slash as root of zip (strip leading slash)
        relativePath = relativePath.replace(/^\//, '');
        return relativePath;
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
        // Keep quotes if original had them
        const hadQuotes = /^['"].*['"]$/.test(p1.trim());
        return `url(${hadQuotes ? `"${resolved}"` : resolved})`;
    });
}

/**
 * Build a DOM from index.html text, inline local CSS/JS from ZIP, and rewrite asset URLs to blob: URLs.
 * Returns { combinedHtml, blobUrlMap } where combinedHtml is a complete HTML string safe to render with srcdoc,
 * and blobUrlMap maps zip paths to created blob object URLs.
 */
async function buildCombinedHtmlFromZip(jszip, indexPath) {
    // Map every file path in zip to Blob and object URL
    const fileNames = Object.keys(jszip.files);
    const fileBlobs = {};
    const blobUrlMap = {};

    // First pass: build Blob and object URL map
    for (const name of fileNames) {
        const file = jszip.files[name];
        if (file.dir) continue;
        const mime = guessMimeType(name);
        const content = await file.async(mime.startsWith('text/') || mime === 'application/javascript' || mime === 'application/json' ? 'text' : 'uint8array');
        let blob;
        if (typeof content === 'string') {
            blob = new Blob([content], { type: mime });
        } else {
            blob = new Blob([content], { type: mime });
        }
        fileBlobs[name] = { blob, mime };
        try {
            blobUrlMap[name] = URL.createObjectURL(blob);
        } catch (e) {
            // Fallback: no URL, keep undefined
            console.warn(`Failed to create object URL for ${name}:`, e);
        }
    }

    // Helper to find if a path exists in zip (case-sensitive)
    const zipHas = (p) => !!jszip.files[p];

    // Load and parse index.html
    const indexText = await jszip.files[indexPath].async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(indexText, 'text/html');

    // Base directory of index.html (for resolving relative refs)
    const indexDir = indexPath.split('/').slice(0, -1).join('/') + (indexPath.includes('/') ? '/' : '');

    // Inline <link rel="stylesheet" href="..."> if it points to a zip file
    const linkNodes = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'));
    for (const link of linkNodes) {
        const href = link.getAttribute('href').trim();
        const resolved = resolveZipPath(indexDir, href);
        if (zipHas(resolved)) {
            const cssTextRaw = await jszip.files[resolved].async('text');
            // Rewrite url(...) inside CSS
            const cssDir = resolved.split('/').slice(0, -1).join('/') + (resolved.includes('/') ? '/' : '');
            const cssText = rewriteCssUrls(cssTextRaw, (assetPath) => {
                const assetResolved = resolveZipPath(cssDir, assetPath);
                return blobUrlMap[assetResolved] || assetPath;
            });

            const style = doc.createElement('style');
            style.textContent = cssText;
            link.replaceWith(style);
        }
    }

    // Inline <script src="..."></script> where src points to a zip file
    const scriptNodes = Array.from(doc.querySelectorAll('script[src]'));
    for (const s of scriptNodes) {
        const src = s.getAttribute('src').trim();
        const resolved = resolveZipPath(indexDir, src);
        if (zipHas(resolved)) {
            const code = await jszip.files[resolved].async('text');
            const inline = doc.createElement('script');
            inline.textContent = code;
            // Preserve type if present
            const type = s.getAttribute('type');
            if (type) inline.setAttribute('type', type);
            s.replaceWith(inline);
        }
    }

    // Rewrite common asset attributes to blob URLs if present in zip
    const assetAttrTargets = [
        { selector: 'img[src]', attr: 'src' },
        { selector: 'video[src]', attr: 'src' },
        { selector: 'audio[src]', attr: 'src' },
        { selector: 'source[src]', attr: 'src' },
        { selector: 'link[rel~="icon"][href]', attr: 'href' },
        { selector: 'link[rel~="apple-touch-icon"][href]', attr: 'href' },
        { selector: 'link[rel~="manifest"][href]', attr: 'href' }
    ];
    for (const { selector, attr } of assetAttrTargets) {
        const nodes = Array.from(doc.querySelectorAll(selector));
        for (const node of nodes) {
            const val = node.getAttribute(attr);
            if (!val) continue;
            const resolved = resolveZipPath(indexDir, val.trim());
            if (blobUrlMap[resolved]) {
                node.setAttribute(attr, blobUrlMap[resolved]);
            }
        }
    }

    // Optional: handle img srcset (basic)
    const imgWithSrcset = Array.from(doc.querySelectorAll('img[srcset]'));
    for (const img of imgWithSrcset) {
        const srcset = img.getAttribute('srcset');
        if (!srcset) continue;
        const parts = srcset.split(',').map(s => s.trim()).filter(Boolean);
        const rewritten = parts.map(part => {
            const [urlPart, sizePart] = part.split(/\s+/);
            const resolved = resolveZipPath(indexDir, urlPart);
            const newUrl = blobUrlMap[resolved] || urlPart;
            return sizePart ? `${newUrl} ${sizePart}` : newUrl;
        }).join(', ');
        img.setAttribute('srcset', rewritten);
    }

    const serializer = new XMLSerializer();
    const combinedHtml = serializer.serializeToString(doc);
    return { combinedHtml, blobUrlMap };
}

/**
 * Import a ZIP multi-file project:
 * - Find index.html
 * - Inline local CSS/JS and rewrite asset URLs to blob:
 * - Decompose with AI into a vibe tree (fallback to client-side parser on failure)
 */
async function handleZipUpload() {
    const file = zipFileInput.files && zipFileInput.files[0];
    if (!file) {
        alert("Please select a ZIP file to upload.");
        return;
    }
    logToConsole(`ZIP selected: ${file.name} (${file.type || 'application/zip'})`, 'info');

    // Disable button during processing
    const originalText = uploadZipButton.innerHTML;
    uploadZipButton.disabled = true;
    uploadZipButton.innerHTML = 'Processing ZIP... <div class="loading-spinner"></div>';

    try {
        if (!window.JSZip) {
            throw new Error('JSZip library failed to load.');
        }

        const jszip = await JSZip.loadAsync(file);

        // Find an index.html (prefer shortest path)
        const htmlCandidates = Object.keys(jszip.files).filter(n => !jszip.files[n].dir && n.toLowerCase().endsWith('index.html'));
        if (htmlCandidates.length === 0) {
            throw new Error('No index.html found in ZIP.');
        }
        // Choose the one with the fewest path segments
        htmlCandidates.sort((a, b) => a.split('/').length - b.split('/').length);
        const indexPath = htmlCandidates[0];
        logToConsole(`Using entry point: ${indexPath}`, 'info');

        // Build combined HTML with inlined CSS/JS and rewritten assets
        const { combinedHtml } = await buildCombinedHtmlFromZip(jszip, indexPath);

        // Show code in Full Code tab/editor
        fullCodeEditor.value = combinedHtml;

        // Create project ID from zip filename and ensure uniqueness
        const derivedId = file.name.replace(/\.zip$/i, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        let projectId = derivedId || `zip-project-${Date.now()}`;
        const existing = db.listProjects();
        let suffix = 1;
        while (existing.includes(projectId)) {
            projectId = `${derivedId}-${suffix++}`;
        }
        currentProjectId = projectId;

        // Try AI-based decomposition first
        let newTree = null;
        let usedAI = false;
        try {
            logToConsole('Decomposing ZIP website with AI into Vibe Tree...', 'info');
            newTree = await decomposeCodeIntoVibeTree(combinedHtml);
            usedAI = true;
        } catch (aiErr) {
            console.warn('AI decomposition failed, falling back to client-side parsing.', aiErr);
            logToConsole(`AI decomposition failed (${aiErr.message}). Falling back to client-side parser.`, 'warn');
            newTree = parseHtmlToVibeTree(combinedHtml);
        }

        // Apply and persist
        vibeTree = newTree;
        db.saveProject(currentProjectId, vibeTree);

        // Transition to main UI if on start page
        startPage.classList.remove('active');
        mainContainer.classList.add('active');

        resetHistory();
        historyState.lastSnapshotSerialized = JSON.stringify(vibeTree);

        renderVibeEditorUI(); 
        document.querySelector('.tab-button[data-tab="preview"]').click();
        logToConsole(`ZIP project '${currentProjectId}' imported successfully using ${usedAI ? 'AI decomposition' : 'client parser'}.`, 'info');

    } catch (e) {
        console.error('ZIP import failed:', e);
        logToConsole(`ZIP import failed: ${e.message}`, 'error');
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
        // A simple sort to respect selector/position logic
        htmlNodes.sort((a, b) => {
            if (a.position === 'beforeend' && b.position === 'afterend') return -1;
            if (a.position === 'afterend' && b.position === 'beforeend') return 1;
            return 0;
        });
        
        htmlNodes.forEach(node => {
            // If the node has children, its code is just the container. We recursively build the inner part.
            if (node.children && node.children.length > 0) {
                 const innerHtml = buildHtmlRecursive(node.children);
                 const wrapper = document.createElement('div');
                 wrapper.innerHTML = node.code;
                 if(wrapper.firstElementChild) {
                     wrapper.firstElementChild.innerHTML = innerHtml;
                     currentHtml += wrapper.innerHTML + '\n';
                 } else {
                     currentHtml += node.code + '\n'; // Fallback
                 }
            } else {
                 currentHtml += node.code + '\n';
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
        if (node.type === 'javascript' && node.code) jsNodes.push(node);
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
function assembleMultiFileBundle(tree = vibeTree) {
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

    // Build files map
    const files = new Map();
    files.set('index.html', indexHtml);
    files.set('project.json', JSON.stringify(tree, null, 2));

    // Add CSS files
    cssNodes.forEach(n => {
        const path = `assets/css/${nodeIdToFileName(n.id, 'css')}`;
        files.set(path, (n.code || '').trim() + '\n');
    });

    // Add JS files (wrap in IIFE to mirror preview execution environment)
    jsNodes.forEach(n => {
        const path = `assets/js/${nodeIdToFileName(n.id, 'js')}`;
        const code = (n.code || '').trim();
        const wrapped = `(function(){\n${code}\n})();\n`;
        files.set(path, wrapped);
    });

    // Include project asset files
    try {
        const assetPaths = db.listFiles(currentProjectId);
        assetPaths.forEach(p => {
            files.set(p, db.readFileForExport(currentProjectId, p));
        });
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
        const { files } = assembleMultiFileBundle(vibeTree);
        const zip = new JSZip();

        for (const [path, content] of files.entries()) {
            zip.file(path, content);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const fnameBase = currentProjectId || 'vibe-project';
        triggerBlobDownload(zipBlob, `${fnameBase}.zip`);
        logToConsole(`Project "${fnameBase}" packaged and downloaded as ZIP.`, 'info');
    } catch (e) {
        console.error('ZIP download failed:', e);
        logToConsole(`ZIP download failed: ${e.message}`, 'error');
        alert(`Failed to build ZIP: ${e.message}`);
    }
}

/**
 * Build a map of elementId -> vibeNodeId by scanning HTML nodes' code for id="...".
 */
function buildElementIdToNodeIdMap(node = vibeTree, map = {}) {
    if (!node) return map;
    if (node.type === 'html' && typeof node.code === 'string') {
        const m = node.code.match(/\bid\s*=\s*"([^"]+)"/i);
        if (m && m[1]) {
            map[m[1]] = node.id;
        }
    }
    if (Array.isArray(node.children)) {
        node.children.forEach(child => buildElementIdToNodeIdMap(child, map));
    }
    return map;
}

/**
 * Applies the current vibeTree to the preview iframe:
 * - Generates full HTML from the vibe tree
 * - Injects an inspector helper script and node map
 * - Ensures JS runs inside the iframe
 */
function applyVibes() {
    try {
        const doc = previewContainer.contentWindow.document;
        // Generate the full page HTML
        let html = generateFullCodeString();

        // Build elementId -> nodeId map for click-to-edit
        const idToNodeMap = buildElementIdToNodeIdMap();

        // Inspector script injection (existing)
        const inspectorScript = `
<script>
(function(){
    window.__vibeIdToNodeId = ${JSON.stringify(idToNodeMap)};
    let inspectEnabled = false;
    let hoverEl = null;
    const highlightCss = document.createElement('style');
    highlightCss.textContent = \`
.__vibe-inspect-highlight-all {
    outline: 1px dashed #56b6c2 !important; 
    outline-offset: 1px !important;
    box-shadow: 0 0 5px rgba(86, 182, 194, 0.5) !important; 
}
.__vibe-inspect-highlight-hover {
    outline: 2px solid #e5c07b !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
    box-shadow: 0 0 8px rgba(229, 192, 123, 0.8) !important;
}
\`;
    document.head.appendChild(highlightCss);

    function setHighlight(el) {
        if (hoverEl && hoverEl !== el) hoverEl.classList.remove('__vibe-inspect-highlight-hover');
        hoverEl = el;
        if (hoverEl) hoverEl.classList.add('__vibe-inspect-highlight-hover');
    }
    function clearHighlight() { if (hoverEl) hoverEl.classList.remove('__vibe-inspect-highlight-hover'); hoverEl = null; }
    
    function getNodeIdForElement(el) {
        let cur = el;
        while (cur && cur !== document.body && cur !== document.documentElement) {
            if (cur.id && window.__vibeIdToNodeId[cur.id]) return window.__vibeIdToNodeId[cur.id];
            cur = cur.parentElement;
        }
        return null;
    }
    function handleMouseOver(e) { if (!inspectEnabled) return; const el = e.target; if (!(el instanceof Element)) return; setHighlight(el); e.stopPropagation(); }
    function handleClick(e) {
        if (!inspectEnabled) return;
        e.preventDefault(); e.stopPropagation();
        const target = e.target;
        const nodeId = getNodeIdForElement(target);
        if (nodeId) {
            window.parent.postMessage({ type: 'vibe-node-click', nodeId: nodeId }, '*');
        } else {
            const nearestWithId = target.closest('[id]');
            if (nearestWithId && nearestWithId.id) window.parent.postMessage({ type: 'vibe-node-click', nodeId: nearestWithId.id }, '*');
        }
    }
    function enableInspect() {
        if (inspectEnabled) return; inspectEnabled = true;

        // Highlight all inspectable elements
        for (const elementId in window.__vibeIdToNodeId) {
            const el = document.getElementById(elementId);
            if (el) {
                el.classList.add('__vibe-inspect-highlight-all');
            }
        }

        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('click', handleClick, true);
        document.body.style.cursor = 'crosshair';
    }
    function disableInspect() {
        if (!inspectEnabled) return; inspectEnabled = false;

        // Remove all highlights
        document.querySelectorAll('.__vibe-inspect-highlight-all').forEach(el => {
            el.classList.remove('__vibe-inspect-highlight-all');
        });
        clearHighlight(); // This will clear the hover highlight

        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = '';
    }
    window.addEventListener('message', function(event) {
        const data = event.data || {};
        if (data.type === 'toggle-inspect') { if (data.enabled) enableInspect(); else disableInspect(); }
    });
})();
<\/script>`;

        if (html.includes('</body>')) {
            html = html.replace('</body>', `${inspectorScript}\n</body>`);
        } else {
            html += inspectorScript;
        }

        // Write to iframe, then inject asset rewriter with current project asset map
        doc.open();
        doc.write(html);
        doc.close();

        // After document is ready, rewrite asset URLs
        (async () => {
            const assetMap = await buildAssetUrlMap();
            injectAssetRewriterScript(doc, assetMap);
        })();
    } catch (e) {
        console.error('applyVibes failed:', e);
        logToConsole(`applyVibes failed: ${e.message}`, 'error');
    }
}

function showFullCode() {
    const fullCode = generateFullCodeString();
    fullCodeEditor.value = fullCode; 
    logToConsole('Displaying full website code.', 'info');
}

function hideFullCode() {
}

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
    // New: collapse/expand toggles
    document.querySelectorAll('.collapse-toggle').forEach(button => {
        button.addEventListener('click', handleCollapseToggle);
    });
    // NEW: card navigation
    document.querySelectorAll('.vibe-card.is-container').forEach(card => {
        card.addEventListener('click', handleCardNavigation);
    });
}

// --- Agent Logic ---

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
    agentOutput.scrollTop = agentOutput.scrollHeight; 
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
         "type": "html" | "css" | "javascript",
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
  - For new HTML nodes, you MUST correctly define the selector and position to place it correctly in the DOM. Chain off existing elements.
- The response must be a single, valid JSON object and nothing else.`;
}

/**
 * Initiates an AI-powered fix for a given error message.
 * @param {string} errorMessage - The full text of the error, including stack trace.
 * @param {HTMLElement} fixButton - The button that was clicked.
 */
async function handleFixError(errorMessage, fixButton) {
    fixButton.disabled = true;
    fixButton.innerHTML = 'Fixing... <div class="loading-spinner"></div>';

    logToConsole(`Attempting to fix error: "${errorMessage.split('\n')[0]}..."`, 'info');

    // Switch to the Agent tab to show progress
    document.querySelector('.tab-button[data-tab="agent"]').click();
    
    // Use the agent's UI elements for visual feedback
    agentPromptInput.value = `Fix this error:\n${errorMessage}`;
    runAgentButton.disabled = true;
    runAgentButton.innerHTML = 'Agent is fixing... <div class="loading-spinner"></div>';
    agentOutput.innerHTML = ''; 
    agentConversationHistory = []; 
    logToAgent(`<strong>New Task:</strong> Fix a runtime error.`, 'plan');
    logToAgent(`<strong>Error Details:</strong>\n<pre>${errorMessage}</pre>`, 'info');
    logToAgent('Analyzing current code structure...', 'info');

    const fullTreeString = JSON.stringify(vibeTree, null, 2);
    const systemPrompt = getAgentSystemPrompt(); 

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
        document.querySelector('.tab-button[data-tab="preview"]').click();

    } catch (error) {
        console.error("AI fix failed:", error);
        logToAgent(`The AI fix failed: ${error.message}. Check the main console for more details.`, 'error');
        alert(`The AI Agent encountered an error while trying to fix the issue: ${error.message}`);
    } finally {
        runAgentButton.disabled = !geminiApiKey; 
        runAgentButton.innerHTML = 'Run Agent';
        agentPromptInput.value = ''; 
        // The fix button is part of the log entry and will be gone if the console is cleared.
        // If it still exists, we can re-enable it, but it's probably better to leave it as is.
        // It's a one-shot action per error instance.
    }
}

/**
 * Processes the AI's plan to update, create, and modify nodes in the vibeTree.
 * @param {object} agentDecision - The parsed JSON response from the AI.
 * @param {function} agentLogger - The logging function to use (e.g., logToAgent or console.log).
 */
function executeAgentPlan(agentDecision, agentLogger) {
    if (!agentDecision.plan || !Array.isArray(agentDecision.actions)) {
        logToConsole("AI returned a malformed plan object. Check AI logs for details.", 'error');
        throw new Error("AI returned a malformed plan object. Check console for details.");
    }

    // Record before applying AI changes
    recordHistory('Agent plan execution');

    agentLogger(`<strong>Plan:</strong> ${agentDecision.plan}`, 'plan');

    for (const action of agentDecision.actions) {
        if (action.actionType === 'update') {
            const { nodeId, newDescription, newCode } = action;
            const nodeToUpdate = findNodeById(nodeId);

            if (nodeToUpdate) {
                if (nodeToUpdate.type === 'container') {
                    agentLogger(`Warning: Agent tried to update container node \`${nodeId}\`, which is not allowed. Skipping.`, 'warn');
                    continue;
                }
                agentLogger(`<strong>Updating Node:</strong> \`${nodeId}\` (${nodeToUpdate.type})`, 'action');
                if (newDescription) nodeToUpdate.description = newDescription;
                if (typeof newCode === 'string') nodeToUpdate.code = newCode;
            } else {
                agentLogger(`Warning: Agent wanted to update non-existent node \`${nodeId}\`. Skipping.`, 'warn');
                continue;
            }
        } else if (action.actionType === 'create') {
            const { parentId, newNode } = action;
            const parentNode = findNodeById(parentId);
            if (parentNode && (parentNode.type === 'container' || parentNode.type === 'html')) {
                if (!newNode || !newNode.id) {
                     agentLogger(`Warning: AI tried to create an invalid node (missing data or ID). Skipping.`, 'warn');
                     continue;
                }
                if (findNodeById(newNode.id)) {
                    agentLogger(`Warning: AI tried to create a node with a duplicate ID \`${newNode.id}\`. Skipping.`, 'warn');
                    continue;
                }

                if (!parentNode.children) {
                    parentNode.children = [];
                }

                agentLogger(`<strong>Creating Node:</strong> \`${newNode.id}\` inside \`${parentId}\` (${parentNode.type})`, 'action');
                parentNode.children.push(newNode);
            } else {
                agentLogger(`Warning: AI wanted to create a node under an invalid or non-container parent \`${parentId}\`. Skipping.`, 'warn');
                continue;
            }
        } else {
            agentLogger(`Warning: AI returned an unknown action type: \`${action.actionType || 'undefined'}\`. Skipping.`, 'warn');
            continue;
        }
    }
    
    renderVibeEditorUI(); 
    applyVibes();
    // Switch to preview tab to show the result.
    document.querySelector('.tab-button[data-tab="preview"]').click();
}

async function handleRunAgent() {
    const userPrompt = agentPromptInput.value.trim();
    if (!userPrompt) {
        alert("Please enter a description of the change you want to make.");
        return;
    }

    runAgentButton.disabled = true;
    runAgentButton.innerHTML = 'Agent is thinking... <div class="loading-spinner"></div>';
    // Don't clear previous logs to show history
    logToAgent(`<strong>You:</strong> ${userPrompt}`, 'user');

    // The agent now gets the FULL tree with code.
    const fullTreeString = JSON.stringify(vibeTree, null, 2);

    const systemPrompt = getAgentSystemPrompt();

    const agentUserPrompt = `User Request: "${userPrompt}"

Full Vibe Tree:
\`\`\`json
${fullTreeString}
\`\`\``;

    // Add new message to history
    agentConversationHistory.push({ role: 'user', content: agentUserPrompt });

    // Keep history from getting too long
    if (agentConversationHistory.length > 10) {
        // Keep the first message (initial context) and the last 9 messages
        agentConversationHistory = [
            agentConversationHistory[0], 
            ...agentConversationHistory.slice(-9)
        ];
    }

    try {
        const rawResponse = await callAI(systemPrompt, agentUserPrompt, true);
        
        // Add AI response to history for the next turn
        agentConversationHistory.push({ role: 'model', content: rawResponse });

        const agentDecision = JSON.parse(rawResponse);
        executeAgentPlan(agentDecision, logToAgent);
        
        logToAgent('Changes applied. The website has been updated and reloaded.', 'info');
        // Switch to preview tab to show the result.
        document.querySelector('.tab-button[data-tab="preview"]').click();

    } catch (error) {
        console.error("AI agent failed:", error);
        logToAgent(`The AI agent failed: ${error.message}. Check the main console for more details.`, 'error');
        alert(`The AI Agent encountered an error while trying to fix the issue: ${error.message}`);
        // Remove the last user prompt from history if the call failed
        agentConversationHistory.pop();
    } finally {
        runAgentButton.disabled = !(geminiApiKey || nscaleApiKey);
        runAgentButton.innerHTML = 'Run Agent';
        agentPromptInput.value = '';
    }
}

// --- Add Node Modal Logic ---
function handleAddChildClick(event) {
    const parentId = event.target.dataset.id;
    addNodeParentIdInput.value = parentId;
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

    addNodeError.textContent = '';

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newNodeId)) {
        addNodeError.textContent = 'Invalid ID. Use kebab-case (e.g., "my-new-id").';
        return;
    }

    if (findNodeById(newNodeId)) {
        addNodeError.textContent = 'This ID is already in use. Please choose a unique one.';
        return;
    }

    const parentNode = findNodeById(parentId);
    if (!parentNode) {
        console.error(`Parent node with id "${parentId}" not found.`);
        addNodeError.textContent = 'An internal error occurred. Parent node not found.';
        return;
    }

    // Record before modification
    recordHistory(`Create node ${newNodeId} under ${parentId}`);

    if (!parentNode.children) {
        parentNode.children = [];
    }

    const newNode = {
        id: newNodeId,
        type: newNodeType,
        description: newDescription,
        code: ''
    };
    
    if (newNodeType === 'html') {
        let lastHtmlSiblingId = null;
        if(parentNode.children) {
            for (let i = parentNode.children.length - 1; i >= 0; i--) {
                const sibling = parentNode.children[i];
                if (sibling.type === 'html' && sibling.id) {
                    lastHtmlSiblingId = sibling.id;
                    break;
                }
            }
        }
        
        if (lastHtmlSiblingId) {
             newNode.selector = `#${lastHtmlSiblingId}`;
             newNode.position = 'afterend';
        } else {
             newNode.selector = `#${parentNode.id}`;
             newNode.position = 'beforeend';
        }
    }

    parentNode.children.push(newNode);

    console.log(`Added new node "${newNodeId}" to parent "${parentId}".`);

    renderVibeEditorUI(); 
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
    // Enable/disable AI button based on API key availability
    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (aiImproveDescriptionButton) {
        aiImproveDescriptionButton.disabled = !keyIsAvailable;
        aiImproveDescriptionButton.title = keyIsAvailable ? '' : 'Add an API key in Settings to use AI.';
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

    const prevDescription = node.description || '';
    const prevCode = node.code || '';

    const newDescription = editNodeDescriptionInput.value;
    const newCode = editNodeCodeInput.value;

    let codeChanged = false;
    if (newCode !== prevCode) {
        recordHistory(`Edit code in modal for ${nodeId}`); 
        node.code = newCode;
        codeChanged = true;
    }

    const descChanged = newDescription !== prevDescription;

    if (!descChanged && !codeChanged) {
        closeEditNodeModal();
        return;
    }

    const saveBtn = saveEditNodeButton;

    (async () => {
        try {
            if (descChanged) {
                // Record before description change (if not already recorded due to code change)
                if (!codeChanged) {
                    recordHistory(`Edit description in modal for ${nodeId}`);
                }
                await updateNodeByDescription(nodeId, newDescription, saveBtn);
            } else {
                renderVibeEditorUI(); 
            }
            closeEditNodeModal();
            logToConsole(`Node '${nodeId}' updated from Element Editor.`, 'info');
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
    if (inspectEnabled) {
        toggleInspectButton.classList.add('inspect-active');
        toggleInspectButton.textContent = 'Disable Inspect';
    } else {
        toggleInspectButton.classList.remove('inspect-active');
        toggleInspectButton.textContent = 'Enable Inspect';
    }
    try {
        previewContainer.contentWindow.postMessage({ type: 'toggle-inspect', enabled: inspectEnabled }, '*');
    } catch (e) {
        console.error('Failed to postMessage to iframe for inspect toggle:', e);
    }
}

// Listen for element click messages from the iframe
window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'vibe-node-click' && data.nodeId) {
        // Disable inspect after a selection to avoid accidental further clicks
        if (inspectEnabled) {
            toggleInspectMode();
        }
        openEditNodeModal(data.nodeId);
    }
});

// --- Full Code Search Logic ---
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
        // Clear selection
        fullCodeEditor.setSelectionRange(0, 0);
        return;
    }

    // Only re-calculate matches if the search term changes
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
    if (searchState.currentIndex < 0 || searchState.matches.length === 0) return;

    const start = searchState.matches[searchState.currentIndex];
    const end = start + searchState.term.length;

    fullCodeEditor.focus();
    fullCodeEditor.setSelectionRange(start, end);

    searchResultsCount.textContent = `Match ${searchState.currentIndex + 1} of ${searchState.matches.length}`;
}

function handleSearchInput() {
    // We use a small debounce to avoid searching on every single keystroke
    let debounceTimer;
    return () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch();
        }, 250);
    };
}

function handleTabSwitching() {
    const tabs = document.querySelector('.tabs');
    const tabContents = document.querySelector('.tab-content-area');

    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;

        const tabId = button.dataset.tab;

        // When the console tab is clicked, hide the error indicator.
        if (tabId === 'console') {
            consoleErrorIndicator.classList.remove('active');
        }
        
        // Update button active state
        tabs.querySelector('.active').classList.remove('active');
        button.classList.add('active');
        
        // Update content active state
        tabContents.querySelector('.tab-content.active').classList.remove('active');
        const newActiveContent = tabContents.querySelector(`#${tabId}`);
        newActiveContent.classList.add('active');

        // Special action for the full code tab
        if (tabId === 'code') {
            showFullCode();
        }
        if (tabId === 'files') {
            renderFileTree();
            if (filesPreviewEl) {
                filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file to preview it here.</div>';
            }
        }
    });
}

function initializeMermaid() {
    // This check ensures we don't try to initialize if the script failed to load.
    if (typeof window.mermaid === 'undefined') {
        console.error("Mermaid library not found. Flowchart functionality will be disabled.");
        if(generateFlowchartButton) {
            generateFlowchartButton.disabled = true;
            generateFlowchartButton.title = "Mermaid.js library failed to load.";
        }
        return;
    }
    // Initialize Mermaid.js
    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark', 
        fontFamily: "'Inter', sans-serif",
        themeVariables: {
            background: '#282c34',
            primaryColor: '#3a3f4b',
            primaryTextColor: '#f0f0f0',
            primaryBorderColor: '#61afef',
            lineColor: '#abb2bf',
            secondaryColor: '#98c379',
            tertiaryColor: '#e06c75'
        }
    });
    console.log("Mermaid.js initialized.");
}

// --- Project Persistence Logic ---

function populateProjectList() {
    const projects = db.listProjects();
    projectListContainer.innerHTML = ''; 

    if (projects.length === 0) {
        noProjectsMessage.style.display = 'block';
    } else {
        noProjectsMessage.style.display = 'none';
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
    }
}

function handleLoadProject(event) {
    const projectId = event.target.dataset.id;
    const projectData = db.loadProject(projectId);

    if (projectData) {
        currentProjectId = projectId;
        vibeTree = projectData;
        console.log(`Project '${projectId}' loaded.`);
        logToConsole(`Project '${projectId}' loaded successfully.`, 'info');
        
        // Transition to the main editor view
        startPage.classList.remove('active');
        mainContainer.classList.add('active');
        
        renderVibeEditorUI(); 
        applyVibes();
        // After generation, set a new baseline snapshot (no immediate undo unless user changes)
        historyState.lastSnapshotSerialized = JSON.stringify(vibeTree);
        updateUndoRedoUI();

        // Ensure a multi-file layout exists in the file system for this project
        autoSaveProject();

        // Switch to the preview tab to show the result
        document.querySelector('.tab-button[data-tab="preview"]').click();

    } else {
        console.error(`Could not load project '${projectId}'.`);
        alert(`Error: Could not find project data for '${projectId}'.`);
    }
}

function handleDeleteProject(event) {
    const projectId = event.target.dataset.id;
    if (confirm(`Are you sure you want to permanently delete project '${projectId}'?`)) {
        db.deleteProject(projectId);
        console.log(`Project '${projectId}' deleted.`);
        populateProjectList(); 
    }
}

function autoSaveProject() {
    if (!currentProjectId || !vibeTree) return;

    // Always persist the latest vibe tree JSON
    db.saveProject(currentProjectId, vibeTree);

    try {
        // Build a multi-file bundle (index.html linking external CSS/JS files)
        const { files } = assembleMultiFileBundle(vibeTree);

        // Write every file in the bundle into the per-project file store
        // - Strings are saved as text files
        // - Uint8Array are saved as binary files with inferred MIME types
        for (const [path, content] of files.entries()) {
            if (content instanceof Uint8Array) {
                const mime = guessMimeType(path);
                db.saveBinaryFile(currentProjectId, path, content, mime);
            } else {
                db.saveTextFile(currentProjectId, path, String(content));
            }
        }
    } catch (e) {
        console.warn('Failed to assemble/write multi-file bundle:', e);
    }

    // Keep Files tab in sync
    renderFileTree();

    logToConsole(`Project '${currentProjectId}' auto-saved (multi-file layout).`, 'info');
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

// Files tab implementation
let filesState = {
    selectedPath: null,
    clipboard: null 
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

function renderFileTree() {
    if (!filesTreeEl) return;
    filesTreeEl.innerHTML = '';

    if (!currentProjectId) {
        filesTreeEl.innerHTML = '<div class="files-empty">No project loaded. Create or load a project to manage files.</div>';
        return;
    }
    const paths = db.listFiles(currentProjectId);
    if (!paths || paths.length === 0) {
        filesTreeEl.innerHTML = '<div class="files-empty">No files yet. Use Upload or New File to get started.</div>';
        return;
    }

    const root = buildFolderTree(paths);

    const ul = document.createElement('ul');
    ul.className = 'files-ul';
    function renderNode(node, parentUl) {
        if (node.type === 'folder') {
            for (const [childName, child] of node.children) {
                const li = document.createElement('li');
                const row = document.createElement('div');
                row.className = 'file-row';
                const icon = document.createElement('span');
                icon.className = 'file-icon';
                icon.textContent = child.type === 'folder' ? '' : '';
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
                    // Click on folder toggles collapse/expand
                    row.addEventListener('click', (e) => {
                        e.stopPropagation();
                        childUl.style.display = childUl.style.display === 'none' ? '' : 'none';
                    });
                } else {
                    // File click selects
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectFile(child.path, li);
                    });
                }
            }
        }
    }
    renderNode(root, ul);
    filesTreeEl.appendChild(ul);
}

function selectFile(path, liEl) {
    filesState.selectedPath = path;
    // Highlight
    filesTreeEl.querySelectorAll('li.selected').forEach(li => li.classList.remove('selected'));
    if (liEl) liEl.classList.add('selected');
    // Preview
    renderFilePreview(path);
}

async function renderFilePreview(path) {
    if (!filesPreviewEl) return;
    filesPreviewEl.innerHTML = '';
    try {
        const meta = db.getFileMeta(currentProjectId, path);
        if (!meta) {
            filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">File not found.</div>';
            return;
        }

        const info = document.createElement('div');
        info.className = 'files-preview-info';
        info.innerHTML = `
            <div><strong>Path:</strong> <code>${path}</code></div>
            <div><strong>Type:</strong> ${meta.mime}${meta.isBinary ? ' (binary)' : ''}</div>
            <div class="files-preview-actions">
                <button class="action-button" id="copy-asset-path">Copy Path</button>
            </div>
        `;

        const copyBtnHandler = () => {
            navigator.clipboard.writeText(path).then(() => {
                logToConsole(`Asset path copied: ${path}`, 'info');
            });
        };

        if (meta.isBinary) {
            const blob = await db.getFileBlob(currentProjectId, path);
            const url = URL.createObjectURL(blob);
            if (meta.mime.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'files-preview-image';
                img.src = url;
                filesPreviewEl.appendChild(img);
            } else if (meta.mime.startsWith('video/')) {
                const video = document.createElement('video');
                video.className = 'files-preview-video';
                video.controls = true;
                video.src = url;
                filesPreviewEl.appendChild(video);
            } else if (meta.mime.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = url;
                filesPreviewEl.appendChild(audio);
            } else {
                const binMsg = document.createElement('div');
                binMsg.className = 'files-preview-placeholder';
                binMsg.textContent = 'Binary file preview not supported.';
                filesPreviewEl.appendChild(binMsg);
            }
            filesPreviewEl.appendChild(info);
            filesPreviewEl.querySelector('#copy-asset-path').addEventListener('click', copyBtnHandler);
        } else {
            const text = await db.readTextFile(currentProjectId, path);
            const ta = document.createElement('textarea');
            ta.className = 'files-preview-text';
            ta.value = text;
            filesPreviewEl.appendChild(ta);

            const saveRow = document.createElement('div');
            saveRow.className = 'files-preview-actions';
            const saveBtn = document.createElement('button');
            saveBtn.className = 'action-button';
            saveBtn.textContent = 'Save';
            saveBtn.addEventListener('click', async () => {
                await db.saveTextFile(currentProjectId, path, ta.value);
                logToConsole(`Saved file: ${path}`, 'info');
                autoSaveProject();
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
    if (files.length === 0) {
        alert('Select one or more files to upload.');
        return;
    }
    for (const f of files) {
        try {
            const path = `assets/${f.name}`;
            if (f.type.startsWith('text/') || ['application/json', 'application/javascript'].includes(f.type)) {
                const text = await f.text();
                await db.saveTextFile(currentProjectId, path, text);
            } else {
                const buf = new Uint8Array(await f.arrayBuffer());
                await db.saveBinaryFile(currentProjectId, path, buf, f.type || guessMimeType(f.name));
            }
            logToConsole(`Uploaded: ${path}`, 'info');
        } catch (e) {
            console.error('Upload error:', e);
            logToConsole(`Upload failed for ${f.name}: ${e.message}`, 'error');
        }
    }
    renderFileTree();
    autoSaveProject();
    filesUploadInput.value = '';
}

async function handleFilesNewFolder() {
    if (!ensureProjectForFiles()) return;
    const name = prompt('New folder path (e.g., assets/images):', 'assets/new-folder');
    if (!name) return;
    const safe = name.replace(/^\/+|\/+$/g, '');
    // Create a placeholder to persist folder in flat storage
    const keepPath = `${safe}/.keep`;
    await db.saveTextFile(currentProjectId, keepPath, '');
    renderFileTree();
    autoSaveProject();
}

async function handleFilesNewFile() {
    if (!ensureProjectForFiles()) return;
    const path = prompt('New file path (e.g., assets/data/info.txt):', 'assets/new-file.txt');
    if (!path) return;
    const safe = path.replace(/^\/+/, '');
    await db.saveTextFile(currentProjectId, safe, '');
    renderFileTree();
    selectFile(safe);
    autoSaveProject();
}

async function handleFilesDownload() {
    if (!ensureProjectForFiles()) return;
    const path = filesState.selectedPath;
    if (!path) {
        alert('Select a file to download.');
        return;
    }
    try {
        const blob = await db.getFileBlob(currentProjectId, path);
        triggerBlobDownload(blob, path.split('/').pop());
    } catch (e) {
        console.error('Download failed:', e);
        alert(`Download failed: ${e.message}`);
    }
}

function handleFilesCopy() {
    if (!ensureProjectForFiles()) return;
    const path = filesState.selectedPath;
    if (!path) {
        alert('Select a file to copy.');
        return;
    }
    const meta = db.getFileMeta(currentProjectId, path);
    if (!meta) {
        alert('File not found.');
        return;
    }
    filesState.clipboard = { path, meta };
    logToConsole(`Copied file to clipboard: ${path}`, 'info');
}

async function handleFilesPaste() {
    if (!ensureProjectForFiles()) return;
    const clip = filesState.clipboard;
    if (!clip) {
        alert('Clipboard is empty. Copy a file first.');
        return;
    }
    const baseName = clip.path.split('/').pop();
    const dir = clip.path.split('/').slice(0, -1).join('/');
    let newName = baseName.replace(/(\.[^.]*)$/, ' copy$1');
    if (newName === baseName) newName = `${baseName} copy`;
    let dest = dir ? `${dir}/${newName}` : newName;

    // Ensure unique
    const existing = new Set(db.listFiles(currentProjectId));
    let i = 2;
    while (existing.has(dest)) {
        dest = dir ? `${dir}/${newName.replace(/(\.[^.]*)?$/, ` ${i}$1`)}` : `${newName.replace(/(\.[^.]*)?$/, ` ${i}$1`)}`;
        i++;
    }

    try {
        if (clip.meta.isBinary) {
            const u8 = await db.readFileRaw(currentProjectId, clip.path);
            await db.saveBinaryFile(currentProjectId, dest, u8, clip.meta.mime);
        } else {
            const text = await db.readTextFile(currentProjectId, clip.path);
            await db.saveTextFile(currentProjectId, dest, text);
        }
        renderFileTree();
        selectFile(dest);
        autoSaveProject();
        logToConsole(`Pasted file as: ${dest}`, 'info');
    } catch (e) {
        console.error('Paste failed:', e);
        alert(`Paste failed: ${e.message}`);
    }
}

async function handleFilesRename() {
    if (!ensureProjectForFiles()) return;
    const path = filesState.selectedPath;
    if (!path) {
        alert('Select a file to rename.');
        return;
    }
    const newPath = prompt('New path/name:', path);
    if (!newPath || newPath === path) return;
    const safeNew = newPath.replace(/^\/+/, '');
    try {
        await db.renameFile(currentProjectId, path, safeNew);
        renderFileTree();
        selectFile(safeNew);
        autoSaveProject();
        logToConsole(`Renamed: ${path} -> ${safeNew}`, 'info');
    } catch (e) {
        console.error('Rename failed:', e);
        alert(`Rename failed: ${e.message}`);
    }
}

async function handleFilesDelete() {
    if (!ensureProjectForFiles()) return;
    const path = filesState.selectedPath;
    if (!path) {
        alert('Select a file to delete.');
        return;
    }
    if (!confirm(`Delete file "${path}"? This cannot be undone.`)) return;
    try {
        db.deleteFile(currentProjectId, path);
        filesState.selectedPath = null;
        renderFileTree();
        if (filesPreviewEl) {
            filesPreviewEl.innerHTML = '<div class="files-preview-placeholder">Select a file to preview it here.</div>';
        }
        autoSaveProject();
        logToConsole(`Deleted: ${path}`, 'info');
    } catch (e) {
        console.error('Delete failed:', e);
        alert(`Delete failed: ${e.message}`);
    }
}

// Wait for the DOM to be fully loaded before running initialization logic.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing application.");
    
    function bindEventListeners() {
        // Tabs
        handleTabSwitching();

        // Preview inspect
        if (toggleInspectButton) toggleInspectButton.addEventListener('click', toggleInspectMode);

        // Undo/Redo
        if (undoButton) undoButton.addEventListener('click', doUndo);
        if (redoButton) redoButton.addEventListener('click', doRedo);

        // Full code processing
        if (updateTreeFromCodeButton) updateTreeFromCodeButton.addEventListener('click', handleUpdateTreeFromCode);

        // File uploads and downloads
        if (uploadHtmlButton) uploadHtmlButton.addEventListener('click', handleFileUpload);
        if (uploadZipButton) uploadZipButton.addEventListener('click', handleZipUpload);
        if (downloadZipButton) downloadZipButton.addEventListener('click', handleDownloadProjectZip);

        // Files tab actions (NEW)
        if (filesUploadButton) filesUploadButton.addEventListener('click', handleFilesUpload);
        if (filesNewFolderButton) filesNewFolderButton.addEventListener('click', handleFilesNewFolder);
        if (filesNewFileButton) filesNewFileButton.addEventListener('click', handleFilesNewFile);
        if (filesDownloadButton) filesDownloadButton.addEventListener('click', handleFilesDownload);
        if (filesCopyButton) filesCopyButton.addEventListener('click', handleFilesCopy);
        if (filesPasteButton) filesPasteButton.addEventListener('click', handleFilesPaste);
        if (filesRenameButton) filesRenameButton.addEventListener('click', handleFilesRename);
        if (filesDeleteButton) filesDeleteButton.addEventListener('click', handleFilesDelete);

        // Search
        if (searchInput) searchInput.addEventListener('input', handleSearchInput());
        if (findNextButton) findNextButton.addEventListener('click', findNextMatch);
        if (findPrevButton) findPrevButton.addEventListener('click', findPrevMatch);

        // Agent
        if (runAgentButton) runAgentButton.addEventListener('click', handleRunAgent);

        // Flowchart
        if (generateFlowchartButton) generateFlowchartButton.addEventListener('click', handleGenerateFlowchart);

        // Start page: new project
        if (generateProjectButton) generateProjectButton.addEventListener('click', handleGenerateProject);

        // Settings modal open/close
        const addModalCloseBtn = addNodeModal ? addNodeModal.querySelector('.close-button') : null;
        if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', () => settingsModal.style.display = 'block');
        if (startPageSettingsButton) startPageSettingsButton.addEventListener('click', () => settingsModal.style.display = 'block');
        if (closeSettingsModalButton) closeSettingsModalButton.addEventListener('click', () => settingsModal.style.display = 'none');

        // Add Node modal
        if (createNodeButton) createNodeButton.addEventListener('click', handleCreateNode);
        if (addModalCloseBtn) addModalCloseBtn.addEventListener('click', () => addNodeModal.style.display = 'none');

        // Edit Node modal
        if (saveEditNodeButton) saveEditNodeButton.addEventListener('click', handleSaveEditedNode);
        if (closeEditNodeModalButton) closeEditNodeModalButton.addEventListener('click', closeEditNodeModal);
        // AI Improve Description
        if (aiImproveDescriptionButton) aiImproveDescriptionButton.addEventListener('click', handleAiImproveDescription);

        // API provider and keys
        if (aiProviderSelect) aiProviderSelect.addEventListener('change', handleProviderChange);
        if (geminiModelSelect) geminiModelSelect.addEventListener('change', () => {
            localStorage.setItem('geminiModel', geminiModelSelect.value);
            console.info(`Gemini model set to: ${geminiModelSelect.value}`);
        });
        if (saveApiKeyButton) saveApiKeyButton.addEventListener('click', saveGeminiApiKey);
        if (saveNscaleApiKeyButton) saveNscaleApiKeyButton.addEventListener('click', saveNscaleApiKey);

        // New Project button in tabs
        if (newProjectButton) newProjectButton.addEventListener('click', resetToStartPage);

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) settingsModal.style.display = 'none';
            if (event.target === addNodeModal) addNodeModal.style.display = 'none';
            if (event.target === editNodeModal) editNodeModal.style.display = 'none';
        });
    }
    
    bindEventListeners();
    initializeApiSettings();
    initializeMermaid();
    populateProjectList();
    startPage.classList.add('active');
    mainContainer.classList.remove('active');

    // Initialize history baseline
    resetHistory();
});

function resetToStartPage() {
    console.log("Resetting to new project state.");
    currentProjectId = null;
    vibeTree = JSON.parse(JSON.stringify(initialVibeTree));

    // Reset history when starting fresh
    resetHistory();

    // Reset UI
    mainContainer.classList.remove('active');
    startPage.classList.add('active');

    // Reset start page form
    projectPromptInput.value = '';
    newProjectIdInput.value = '';
    startPageGenerationOutput.style.display = 'none';
    generateProjectButton.disabled = !geminiApiKey;
    newProjectContainer.style.display = 'block';

    // Clear UI elements in the main container for a clean slate
    editorContainer.innerHTML = '';
    const previewDoc = previewContainer.contentWindow.document;
    previewDoc.open();
    previewDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    previewDoc.close();
    agentOutput.innerHTML = '<div class="agent-message-placeholder">The agent\'s plan and actions will appear here.</div>';
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">Click "Generate Flowchart" to create a diagram of your website\'s logic.</div>';
    consoleOutput.innerHTML = '';
    fullCodeEditor.value = '';
    populateProjectList();
    logToConsole("Ready for new project.", "info");
}

/* --- Missing helpers (safe stubs to prevent runtime errors if not defined elsewhere) --- */
async function buildAssetUrlMap() {
    return {};
}
function injectAssetRewriterScript(doc, assetMap) {
}
/* --- End stubs --- */

/* --- Allow editing descriptions from the Edit Component modal --- */
async function updateNodeByDescription(nodeId, newDescription, buttonEl = null) {
    const node = findNodeById(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    // Record state before change
    recordHistory(`Edit description for ${nodeId} (modal)`);
    node.description = newDescription;

    // Show loading state if a button is provided
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
            renderVibeEditorUI(); 
        } else {
            const systemPrompt = getAgentSystemPrompt();
            const fullTreeString = JSON.stringify(vibeTree, null, 2);
            const userPrompt = `The user has updated the description for component "${node.id}" to: "${newDescription}". Analyze this change and generate a plan to update the entire website accordingly.

Full Vibe Tree:
\`\`\`json
${fullTreeString}
\`\`\``;

            const rawResponse = await callAI(systemPrompt, userPrompt, true);
            const agentDecision = JSON.parse(rawResponse);
            executeAgentPlan(agentDecision, (msg, t = 'info') => logToConsole(`[ModalUpdate] ${msg}`, t));
        }
    } finally {
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.innerHTML = originalHtml;
        }
    }
}

/* --- Flowchart generation (minimal) --- */
function buildBasicMermaidFromTree(tree) {
    let graph = 'graph TD\n';
    const addNode = (node, parentId = null) => {
        const safeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        const label = `${node.id}\\n(${node.type})`;
        graph += `  ${safeId}["${label}"]\n`;
        if (parentId) {
            graph += `  ${parentId} --> ${safeId}\n`;
        }
        if (Array.isArray(node.children)) {
            node.children.forEach(child => addNode(child, safeId));
        }
    };
    addNode(tree, null);
    return graph;
}

function extractMermaidFromText(text) {
    if (!text) return '';
    // Prefer fenced mermaid block
    const mermaidFence = text.match(/```mermaid\s*([\s\S]*?)\s*```/i);
    if (mermaidFence && mermaidFence[1]) {
        return mermaidFence[1];
    }
    // Any fenced code block
    const codeFence = text.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
    if (codeFence && codeFence[1] && codeFence[1].trim().startsWith('graph')) {
        return codeFence[1].trim();
    }
    // Try to find a line starting with "graph"
    const graphIdx = text.indexOf('graph ');
    if (graphIdx !== -1) {
        return text.slice(graphIdx).trim();
    }
    return text.trim();
}

async function renderMermaidInto(container, graphText) {
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'mermaid';
    // ID for mermaid to target.
    const mermaidId = `mermaid-graph-${Date.now()}`;
    el.id = mermaidId;
    el.textContent = graphText;
    container.appendChild(el);
    try {
        // mermaid.init can return a promise that rejects on parse error. We must await it.
        await window.mermaid.run({ nodes: [el] });
    } catch (e) {
        console.error('Mermaid render error:', e);
        logToConsole(`Flowchart render error: ${e.message}`, 'error');
        container.innerHTML = `<div class="flowchart-placeholder">Flowchart render error: ${e.message}</div>`;
        // Re-throw to allow the caller to handle fallback logic.
        throw e;
    }
}

async function handleGenerateFlowchart() {
    if (typeof window.mermaid === 'undefined') {
        logToConsole('Mermaid not available.', 'warn');
        return;
    }

    // UI: loading state
    const originalText = generateFlowchartButton.innerHTML;
    generateFlowchartButton.disabled = true;
    generateFlowchartButton.innerHTML = 'Generating with AI... <div class="loading-spinner"></div>';
    flowchartOutput.innerHTML = '<div class="flowchart-placeholder">AI is analyzing your project and drawing a flowchart...</div>';

    // Build prompts
    const systemPrompt = `You are a senior frontend architect. Given a "vibe tree" describing a website as nested components (head, html, css, javascript nodes) with code and relationships, produce a clear Mermaid diagram that explains the app's structure and behavior.

Return ONLY a Mermaid definition. No explanations, no markdown besides an optional \`\`\`mermaid fence. Prefer a left-to-right or top-down layout.

Guidelines:
- Use "graph TD" (top-down) or "graph LR" (left-to-right).
- Show key sections (header, main, footer, modals) as nodes.
- Group nodes by type when helpful: CSS, JS, Head.
- **CRITICAL**: Use correct Mermaid syntax for links/edges: '-->' for a standard arrow, '---' for a line, '-.->' for a dotted line with arrow. Do not use long chains of dashes like '----------'.
- Draw DOM containment edges (parent --> child html).
- Draw dependency/behavior edges from JS to the elements they manipulate or listen to. Label edges like 'click', 'updates text', 'fetches', 'toggles class'.
- Include important IDs/classes in node labels when available.
- Keep it concise and readable.`;

    const userPrompt = `Create a Mermaid diagram for this website code structure.

Vibe Tree JSON:
\`\`\`json
${JSON.stringify(vibeTree, null, 2)}
\`\`\`

Constraints:
- Output must be ONLY the Mermaid graph definition string, starting with "graph ".
- If unsure about some interactions, infer reasonable relationships from descriptions and code.`;

    try {
        const aiText = await callAI(systemPrompt, userPrompt, false);
        const mermaidText = extractMermaidFromText(aiText);

        if (!mermaidText || !/^graph\s+(TD|LR)/i.test(mermaidText)) {
            throw new Error('AI did not return a valid Mermaid graph.');
        }

        await renderMermaidInto(flowchartOutput, mermaidText);
        logToConsole('AI-generated flowchart rendered.', 'info');
    } catch (e) {
        console.warn('AI flowchart generation failed, falling back to basic graph:', e);
        logToConsole(`AI flowchart failed (${e.message}). Falling back to a basic structure graph.`, 'warn');
        const basic = buildBasicMermaidFromTree(vibeTree);
        try {
            await renderMermaidInto(flowchartOutput, basic);
        } catch (fallbackError) {
             console.error('Fallback flowchart failed to render:', fallbackError);
             flowchartOutput.innerHTML = `<div class="flowchart-placeholder">Could not render flowchart.</div>`;
        }
    } finally {
        generateFlowchartButton.disabled = false;
        generateFlowchartButton.innerHTML = originalText;
    }
}

/**
 * Create a brand new project from a high-level prompt.
 * - Validates/normalizes the project ID
 * - Calls AI to generate a complete subtree for the root container
 * - Saves the project and prepares multi-file layout
 * - Switches to the main editor UI
 */
async function handleGenerateProject() {
    try {
        // Validate API availability
        const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
        if (!keyIsAvailable) {
            alert(`Please add your ${currentAIProvider === 'gemini' ? 'Gemini' : 'nscale'} API Key in Settings to generate a project.`);
            
            return;
        }

        // Read inputs
        let desiredId = (newProjectIdInput.value || '').trim().toLowerCase();
        const prompt = (projectPromptInput.value || '').trim();

        if (!prompt) {
            alert('Please enter a short description for your new project.');
            projectPromptInput.focus();
            return;
        }

        // Normalize/validate project ID (kebab-case)
        desiredId = desiredId
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/^-+|-+$/g, '');

        if (!desiredId) {
            desiredId = `project-${Date.now()}`;
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(desiredId)) {
            alert('Project ID must be in kebab-case (letters, numbers, hyphens). Example: my-awesome-site');
            newProjectIdInput.focus();
            return;
        }

        // Ensure unique
        const existing = db.listProjects();
        let projectId = desiredId;
        let suffix = 2;
        while (existing.includes(projectId)) {
            projectId = `${desiredId}-${suffix++}`;
        }

        // UI: show generation panel
        newProjectContainer.style.display = 'none';
        startPageGenerationOutput.style.display = 'block';
        generationStatusText.textContent = 'Generating your project...';
        liveCodeOutput.textContent = '';

        // Build a fresh root tree using the prompt
        vibeTree = {
            id: 'whole-page',
            type: 'container',
            description: prompt,
            children: []
        };

        // Generate complete subtree (children) for root
        const children = await generateCompleteSubtree(vibeTree);
        vibeTree.children = children;

        // Assign as current project and persist
        currentProjectId = projectId;
        resetHistory();
        historyState.lastSnapshotSerialized = JSON.stringify(vibeTree);

        // Show generated code on the start page
        const fullCode = generateFullCodeString(vibeTree);
        liveCodeOutput.textContent = fullCode;
        generationStatusText.textContent = 'Project generated! Finalizing...';

        // Save project + assemble multi-file layout
        autoSaveProject();
        populateProjectList();

        // Transition to main editor UI
        startPage.classList.remove('active');
        mainContainer.classList.add('active');

        renderVibeEditorUI(); 
        document.querySelector('.tab-button[data-tab="preview"]').click();
        logToConsole(`New project '${currentProjectId}' created from prompt.`, 'info');
    } catch (e) {
        console.error('Project generation failed:', e);
        generationStatusText.textContent = 'Generation failed.';
        alert(`Failed to generate project: ${e.message}`);
        // Restore start page form so user can try again
        newProjectContainer.style.display = 'block';
    }
}

// NEW: Use AI to generate a more detailed description for the selected component.
async function handleAiImproveDescription() {
    const nodeId = editNodeIdInput.value;
    const node = findNodeById(nodeId);
    if (!node) {
        editNodeError.textContent = 'Internal error: node not found.';
        return;
    }

    const keyIsAvailable = (currentAIProvider === 'gemini' && !!geminiApiKey) || (currentAIProvider === 'nscale' && !!nscaleApiKey);
    if (!keyIsAvailable) {
        alert(`Please add your ${currentAIProvider === 'gemini' ? 'Gemini' : 'nscale'} API Key in Settings to use AI features.`);
        
        return;
    }

    // UI loading state
    const originalHtml = aiImproveDescriptionButton.innerHTML;
    aiImproveDescriptionButton.disabled = true;
    aiImproveDescriptionButton.innerHTML = 'Analyzing... <div class="loading-spinner"></div>';
    editNodeError.textContent = '';

    try {
        const systemPrompt = `You are a senior frontend engineer and technical writer.
Given a website component (its type, code, and context within a page), write an improved, more detailed description
in 2–5 concise sentences. Focus on intent, structure, behavior, interactions, dependencies, accessibility hooks (ids/aria/roles),
and how it fits into the page. Output plain text only. No code fences, no markdown.`;

        // Provide compact context for accuracy
        const context = {
            node: {
                id: node.id,
                type: node.type,
                currentDescription: node.description || '',
                code: node.code || ''
            },
            parent: (() => {
                // Find parent id/type for context
                const stack = [vibeTree];
                while (stack.length) {
                    const cur = stack.pop();
                    if (Array.isArray(cur.children)) {
                        for (const ch of cur.children) {
                            if (ch.id === node.id) {
                                return { id: cur.id, type: cur.type };
                            }
                            stack.push(ch);
                        }
                    }
                }
                return null;
            })(),
            siblingIds: (() => {
                const result = [];
                const stack = [vibeTree];
                while (stack.length) {
                    const cur = stack.pop();
                    if (Array.isArray(cur.children)) {
                        const idx = cur.children.findIndex(c => c.id === node.id);
                        if (idx !== -1) {
                            cur.children.forEach((c, i) => { if (i !== idx) result.push(c.id); });
                            return result;
                        }
                        cur.children.forEach(c => stack.push(c));
                    }
                }
                return result;
            })()
        };

        const userPrompt = `Improve the component description.

Component Context (JSON):
${JSON.stringify(context, null, 2)}

If helpful, you may infer likely behavior from the code and ids/classes. Output plain text only.`;

        const aiText = await callAI(systemPrompt, userPrompt, false);
        // Clean potential markdown fences
        let improved = aiText.trim();
        const fenced = improved.match(/```[\s\S]*?```/);
        if (fenced && fenced[0]) improved = fenced[0].replace(/```[a-z]*\s*|\s*```/gi, '').trim();

        // Apply to textarea (do not auto-save yet; user can review/edit)
        if (improved) {
            editNodeDescriptionInput.value = improved;
            logToConsole(`AI generated a richer description for "${node.id}".`, 'info');
        } else {
            editNodeError.textContent = 'AI returned an empty response. Please try again.';
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
    const btn = event.currentTarget;
    const nodeEl = btn.closest('.vibe-node');
    if (!nodeEl) return;
    const childrenEl = nodeEl.querySelector(':scope > .children');
    if (!childrenEl) return;

    const isCollapsed = childrenEl.classList.contains('collapsed');
    if (isCollapsed) {
        childrenEl.classList.remove('collapsed');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '▼';
    } else {
        childrenEl.classList.add('collapsed');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '▶';
    }
}

// --- NEW: Vibe Editor Navigation State ---
let editorNavPath = ['whole-page'];

// --- NEW: Vibe Editor Card Rendering ---

/**
 * Main function to render the entire Vibe Editor UI, including breadcrumbs and cards.
 */
function renderVibeEditorUI(direction = 'none') {
    editorContainer.innerHTML = ''; 

    const currentParentId = editorNavPath[editorNavPath.length - 1];
    const parentNode = findNodeById(currentParentId);

    if (!parentNode) {
        console.error(`renderVibeEditorUI: Could not find parent node with id "${currentParentId}"`);
        editorNavPath = ['whole-page']; 
        renderVibeEditorUI(); 
        return;
    }
    
    // 1. Render Breadcrumbs
    const breadcrumbsEl = document.createElement('div');
    breadcrumbsEl.id = 'vibe-breadcrumbs';
    editorNavPath.forEach((nodeId, index) => {
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.textContent = nodeId;
        item.dataset.index = index;
        
        // Add click handler to navigate back, unless it's the last item
        if (index < editorNavPath.length - 1) {
            item.addEventListener('click', handleBreadcrumbClick);
        } else {
            item.classList.add('active');
        }

        breadcrumbsEl.appendChild(item);

        if (index < editorNavPath.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '>';
            breadcrumbsEl.appendChild(separator);
        }
    });
    editorContainer.appendChild(breadcrumbsEl);

    // 2. Render Cards
    const cardsContainer = document.createElement('div');
    cardsContainer.id = 'vibe-cards-container';

    // Add animation classes for incoming cards
    if (direction === 'forward') {
        cardsContainer.classList.add('anim-in-forward');
    } else if (direction === 'backward') {
        cardsContainer.classList.add('anim-in-backward');
    }

    const nodesToRender = parentNode.children || [];

    if (nodesToRender.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'vibe-empty-message';
        emptyMessage.textContent = `This component (${parentNode.id}) has no children. Use "+ Add Child" to add one.`;
        cardsContainer.appendChild(emptyMessage);
    } else {
        nodesToRender.forEach(node => {
            cardsContainer.appendChild(renderCard(node));
        });
    }

    editorContainer.appendChild(cardsContainer);
    addEventListeners(); 
}

/**
 * Renders a single vibe node as a card.
 * @param {object} node - The vibe node to render.
 * @returns {HTMLElement} The card element.
 */
function renderCard(node) {
    const cardEl = document.createElement('div');
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isContainer = node.type === 'container' || (node.type === 'html' && hasChildren);
    const showCodeButton = node.type !== 'container';
    const isHeadNode = node.type === 'head';

    cardEl.className = `vibe-card type-${node.type} ${isContainer ? 'is-container' : ''}`;
    
    if (isContainer) {
        cardEl.title = 'Click to view children';
        cardEl.dataset.navId = node.id; 
    }

    cardEl.innerHTML = `
        <div class="vibe-card-header">
            <span class="id">${node.id} ${isContainer ? '<span class="has-children-indicator">➔</span>' : ''}</span>
            <span class="type">${node.type}</span>
        </div>
        <textarea class="description-input" rows="3" placeholder="Describe the purpose of this component...">${node.description}</textarea>
        <div class="button-group">
            <button class="update-button" data-id="${node.id}">Update Vibe</button>
            ${(node.type === 'container' || node.type === 'html') ? `<button class="add-child-button" data-id="${node.id}">+ Add Child</button>` : ''}
        </div>
         <div class="code-actions">
            ${(showCodeButton || isHeadNode) ? `<button class="toggle-code-button" data-id="${node.id}">View Code</button>` : ''}
            ${(showCodeButton || isHeadNode) ? `<button class="save-code-button" data-id="${node.id}" style="display: none;">Save Code</button>` : ''}
        </div>
        ${(showCodeButton || isHeadNode) ? `<textarea class="code-editor-display" id="editor-${node.id}" style="display: none;"></textarea>` : ''}
    `;

    return cardEl;
}

/**
 * Handles clicks on breadcrumb items to navigate up the tree.
 * @param {Event} event
 */
function handleBreadcrumbClick(event) {
    const index = parseInt(event.currentTarget.dataset.index, 10);
    // Slice the path to the clicked item's level + 1 (to include it)
    const newPath = editorNavPath.slice(0, index + 1);
    navigateVibeEditor(newPath, 'backward');
}

/**
 * Handles clicks on container cards to navigate into them.
 * @param {Event} event
 */
function handleCardNavigation(event) {
    // Ensure we're not clicking a button or textarea inside the card
    if (event.target.closest('button, textarea')) {
        return;
    }
    const card = event.currentTarget;
    const navId = card.dataset.navId;
    if (navId) {
        const newPath = [...editorNavPath, navId];
        navigateVibeEditor(newPath, 'forward');
    }
}

/**
 * Handles the animation and state change for Vibe Editor navigation.
 * @param {string[]} newPath - The new navigation path array.
 * @param {'forward'|'backward'} direction - The direction of navigation.
 */
function navigateVibeEditor(newPath, direction) {
    const cardsContainer = document.getElementById('vibe-cards-container');
    if (!cardsContainer) {
        // Fallback for safety: if no container, just re-render directly.
        editorNavPath = newPath;
        renderVibeEditorUI();
        return;
    }

    const animationClass = direction === 'forward' ? 'anim-out-forward' : 'anim-out-backward';
    cardsContainer.classList.add(animationClass);

    // Wait for the animation to finish before re-rendering the view.
    cardsContainer.addEventListener('animationend', () => {
        editorNavPath = newPath;
        renderVibeEditorUI(direction);
    }, { once: true });
}