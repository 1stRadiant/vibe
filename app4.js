
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Coding System</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <!-- Custom Stylesheet -->
    <link rel="stylesheet" href="style.css">
    <!-- Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
    <!-- START OF CHANGE: Styles for Inspector Panel & Layout Fixes -->
    <style>
        .preview-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             width: 100%;
        }

        .preview-toolbar {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .preview-layout {
            display: flex;
            flex-direction: row;
            height: calc(100% - 60px); /* Adjust height to account for header */
            width: 100%;
        }

        #website-preview {
            flex-grow: 1;
            transition: width 0.3s ease-in-out;
            border: none;
        }

        .inspector-panel {
            width: 350px;
            min-width: 300px;
            background-color: #21252b;
            border-left: 1px solid #3a3f4b;
            display: none; /* Hidden by default */
            flex-direction: column;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .inspector-panel.visible {
            display: flex;
        }

        .inspector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background-color: #2c313a;
            border-bottom: 1px solid #4b5263;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .inspector-header h4 {
            margin: 0;
            font-size: 1rem;
        }

        #inspector-close-button {
            cursor: pointer;
            font-size: 1.5rem;
            padding: 0 5px;
            line-height: 1;
        }

        #inspector-element-info {
            padding: 10px;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.9rem;
            color: #abb2bf;
            background-color: #282c34;
            border-bottom: 1px solid #3a3f4b;
        }

        #inspector-styles-container {
            padding: 10px;
            flex-grow: 1;
        }

        .css-rule-block {
            margin-bottom: 15px;
            border: 1px solid #3a3f4b;
            border-radius: 4px;
            font-size: 0.85rem;
        }

        .css-rule-header {
            background-color: #2c313a;
            padding: 5px 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .css-rule-selector {
            color: #e5c07b;
            font-family: 'Roboto Mono', monospace;
        }
        .css-rule-source {
            color: #98c379;
            cursor: pointer;
            font-size: 0.8rem;
        }
        .css-rule-source:hover {
            text-decoration: underline;
        }

        .css-properties {
            padding: 8px;
            background-color: #282c34;
        }

        .css-property {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            padding-left: 10px;
        }

        .css-property.disabled {
            text-decoration: line-through;
            opacity: 0.6;
        }

        .css-property-toggle {
            margin-right: 8px;
        }

        .css-property-name, .css-property-value {
            outline: none;
            background: transparent;
            border: none;
            color: #abb2bf;
            padding: 2px 4px;
            border-radius: 2px;
            min-width: 50px;
        }
        .css-property-name {
            color: #61afef;
            min-width: 100px;
        }
        .css-property-name:focus, .css-property-value:focus {
            background-color: #3a3f4b;
            box-shadow: 0 0 0 1px #4a90e2;
        }
        .add-property-button {
            font-size: 0.8rem;
            padding: 2px 6px;
            margin-left: 30px;
        }
        
        @media (max-width: 768px) {
             .files-browser, .context-browser {
                flex-direction: column;
            }
            .files-tree {
                height: 250px;
                margin-bottom: 15px;
                min-width: unset;
                width: 100%;
            }
            .context-list-panel {
                margin-bottom: 15px;
            }
            .button-row {
                flex-direction: column;
                gap: 10px;
            }
            .modal-content {
                width: 90%;
            }
            .preview-layout {
                flex-direction: column;
            }
            .inspector-panel {
                width: 100%;
                height: 40vh;
                border-left: none;
                border-top: 1px solid #3a3f4b;
            }
        }
    </style>
    <!-- END OF CHANGE -->
</head>
<body>

    <!-- Main App Container -->
    <div id="main-app-container" style="width:100%; height: 100vh;">
        <div class="container-fluid h-100">
            <div class="row flex-nowrap h-100">
                <!-- Centered Icon-Only Bootstrap Sidebar -->
                <div class="col-auto px-0 bg-dark d-none d-md-flex">
                    <div class="d-flex flex-column align-items-center pt-2 text-white min-vh-100">
                        <a href="#" class="d-flex align-items-center p-3 text-white text-decoration-none" title="Vibe Coding System">
                            <i class="fs-4 bi-lightning-charge"></i>
                        </a>
                        <ul class="nav nav-pills flex-column mb-auto text-center" id="menu">
                            <li class="nav-item">
                                <a href="#" class="nav-link py-3 px-2 tab-button active" data-tab="start" title="Start">
                                    <i class="fs-4 bi-house"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="preview" title="Live Preview">
                                    <i class="fs-4 bi-display"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="editor" title="Vibe Editor">
                                    <i class="fs-4 bi-pencil-square"></i>
                                </a>
                            </li>
                             <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="agent" title="Agent">
                                    <i class="fs-4 bi-robot"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="chat" title="Chat">
                                    <i class="fs-4 bi-chat-dots"></i>
                                </a>
                            </li>
                             <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="flowchart" title="Flowchart">
                                    <i class="fs-4 bi-diagram-3"></i>
                                </a>
                            </li>
                             <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="console" title="Console">
                                    <i class="fs-4 bi-terminal"></i><span id="console-error-indicator"></span>
                                </a>
                            </li>
                             <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="files" title="Files">
                                    <i class="fs-4 bi-folder"></i>
                                </a>
                            </li>
                             <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="context" title="Context">
                                    <i class="fs-4 bi-archive"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="code" title="Full Code">
                                    <i class="fs-4 bi-code-slash"></i>
                                </a>
                            </li>
                        </ul>
                        <div class="pb-4">
                             <a href="#" class="d-flex align-items-center justify-content-center text-white text-decoration-none p-3" id="sidebar-settings-button" title="API Settings">
                                <i class="fs-4 bi-gear"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Content Area -->
                <div class="col py-3 d-flex flex-column h-100">
                    <div class="d-flex justify-content-end mb-3">
                        <button id="undo-button" class="btn btn-secondary me-2" title="Undo (Ctrl/Cmd+Z)">↶ Undo</button>
                        <button id="redo-button" class="btn btn-secondary" title="Redo (Ctrl+Y or Shift+Ctrl/Cmd+Z)">↷ Redo</button>
                    </div>

                    <div class="tab-content-area flex-grow-1">
                        <div id="start" class="tab-content active">
                             <div class="start-page-content">
                                <div class="start-header">
                                    <h1>Welcome to Vibe</h1>
                                    <button id="start-page-settings-button" class="settings-button" title="API Settings">⚙️</button>
                                </div>
                                <p style="margin-top: 1rem;">Your AI-powered web development environment.</p>
                                
                                <div id="existing-projects-container" class="mt-4">
                                    <h2>Your Projects</h2>
                                    <div id="project-list"></div>
                                    <p id="no-projects-message" style="display: none;">You have no saved projects. Create one below!</p>
                                </div>

                                <div id="new-project-container" class="mt-4">
                                    <h2>Create a New Project</h2>
                                    <p>Enter a unique ID and a description, then choose how to build your site.</p>
                                    <input type="text" id="new-project-id-input" placeholder="my-awesome-new-site">
                                    <textarea id="project-prompt-input" placeholder="e.g., 'A modern portfolio website for a photographer...'"></textarea>
                                    <div id="agent-buttons-container">
                                        <button id="generate-project-button">Generate Project (Single Task)</button>
                                        <button id="start-iterative-build-button" class="action-button">Start Iterative Build</button>
                                    </div>
                                </div>

                                <div id="start-page-generation-output" style="display: none;">
                                    <div id="generation-status-container">
                                        <h3 id="generation-status-text">Generating your project...</h3>
                                        <div class="loading-spinner"></div>
                                    </div>
                                    <div id="live-code-container">
                                        <pre><code id="live-code-output" class="language-html"></code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="preview" class="tab-content h-100">
                            <div class="preview-container h-100 d-flex flex-column">
                                <div class="preview-header p-2 border-bottom">
                                    <div class="preview-toolbar">
                                        <button id="toggle-inspect-button" class="action-button" title="Click to select elements in the preview">Enable Inspect</button>
                                    </div>
                                </div>
                                <div class="preview-layout flex-grow-1">
                                    <iframe id="website-preview" title="Live Website Preview"></iframe>
                                    <div id="inspector-panel" class="inspector-panel">
                                        <div class="inspector-header">
                                            <h4>Element Inspector</h4>
                                            <span id="inspector-close-button">&times;</span>
                                        </div>
                                        <div id="inspector-element-info">Select an element to inspect.</div>
                                        <div id="inspector-styles-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="editor" class="tab-content">
                            <div class="editor-container">
                                <div class="editor-header">
                                    <div class="editor-header-left">
                                        <p>Edit the descriptions to change the website. Updating a parent will automatically update its children.</p>
                                    </div>
                                    <div class="editor-header-right">
                                        <div id="ai-editor-search-container">
                                            <input type="text" id="ai-editor-search-input" placeholder="AI Search: 'find the navbar styles'">
                                            <button id="ai-editor-search-button" class="action-button">Search</button>
                                        </div>
                                        <button id="open-settings-modal-button" class="action-button">API Settings</button>
                                    </div>
                                </div>
                                <div id="vibe-editor"></div>
                            </div>
                        </div>
                        <div id="agent" class="tab-content">
                            <div class="agent-container">
                                <p>Describe a task or overall goal. The agent can execute it as a single task or start an interactive, step-by-step session.</p>
                                <div id="agent-controls">
                                    <textarea id="agent-prompt-input" rows="4" placeholder="Describe the overall goal for your website..."></textarea>
                                    <div id="agent-buttons-container">
                                        <button id="run-agent-single-task-button" class="action-button">Execute as Single Task</button>
                                        <button id="start-iterative-session-button" class="action-button">Start Iterative Session</button>
                                    </div>
                                </div>
                                <div id="iterative-session-ui" class="hidden">
                                    <h4>Project Plan:</h4>
                                    <div id="iterative-plan-display"></div>
                                    <div id="iterative-controls" class="hidden">
                                        <p>Review the changes in the preview. Then, provide feedback or continue.</p>
                                        <button id="accept-continue-button" class="action-button">Looks Good, Continue</button>
                                        <button id="request-changes-button" class="action-button">Request Changes</button>
                                        <button id="end-session-button">End Session</button>
                                    </div>
                                </div>
                                <div id="agent-output-container">
                                    <h3>Agent Log</h3>
                                    <div id="agent-output">
                                        <div class="agent-message-placeholder">The agent's plan and actions will appear here.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="chat" class="tab-content">
                            <div class="chat-container">
                                <div class="system-prompt-container">
                                    <label for="chat-system-prompt-input">System Prompt (Optional)</label>
                                    <textarea id="chat-system-prompt-input" placeholder="e.g., You are a helpful assistant that only replies in haikus."></textarea>
                                </div>
                                <div class="chat-output-container">
                                    <div id="chat-output">
                                        <div class="chat-message-placeholder">Start the conversation by typing a message below.</div>
                                    </div>
                                </div>
                                <div class="chat-controls">
                                    <textarea id="chat-prompt-input" placeholder="Ask the AI anything about your project..."></textarea>
                                    <button id="send-chat-button" class="action-button">Send</button>
                                </div>
                            </div>
                        </div>
                        <div id="flowchart" class="tab-content">
                            <div class="flowchart-container">
                                <p>This flowchart visualizes the user interactions and logic defined in your website's code.</p>
                                <div class="flowchart-controls">
                                    <button id="generate-flowchart-button" class="action-button">Generate Flowchart</button>
                                </div>
                                <div id="flowchart-output">
                                    <div class="flowchart-placeholder">Click "Generate Flowchart" to create a diagram of your website's logic.</div>
                                </div>
                            </div>
                        </div>
                        <div id="console" class="tab-content">
                            <div id="console-container">
                                <div id="console-output"></div>
                            </div>
                        </div>
                        <div id="files" class="tab-content">
                            <div class="files-container">
                                <p>Manage files for this project. You can upload images, fonts, JSON, and other assets. Reference them in code using their paths (e.g., "assets/images/logo.png").</p>
                                <div class="files-toolbar">
                                    <input type="file" id="files-upload-input" multiple style="display: none;">
                                    <button id="files-upload-button" class="action-button">Upload</button>
                                    <button id="files-new-folder-button" class="action-button">New Folder</button>
                                    <button id="files-new-file-button" class="action-button">New File</button>
                                    <button id="files-download-button" class="action-button">Download</button>
                                    <button id="files-copy-button" class="action-button">Copy</button>
                                    <button id="files-paste-button" class="action-button">Paste</button>
                                    <button id="files-rename-button" class="action-button">Rename</button>
                                    <button id="files-delete-button" class="action-button danger">Delete</button>
                                </div>
                                <div class="assets-hint">
                                    <strong>Hint:</strong> You can reference these assets in your prompts and code. The AI receives a list of available assets. Use paths exactly as shown below.
                                </div>
                                <div class="files-browser">
                                    <div class="files-tree" id="files-tree"></div>
                                    <div class="files-preview" id="files-preview">
                                        <div class="files-preview-placeholder">Select a file to preview it here.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div id="context" class="tab-content">
                            <div class="context-container">
                                <p>Create and manage reusable components (HTML, CSS, JS). The AI will use this library as context to improve generation quality and consistency.</p>
                                <div class="context-browser">
                                    <div class="context-list-panel">
                                        <h3>Components</h3>
                                        <div id="context-component-list"></div>
                                        <button id="add-new-component-button" class="action-button">Add New Component</button>
                                        <div class="context-io-buttons" style="margin-top: 15px; display: flex; gap: 10px;">
                                            <input type="file" id="context-upload-input" accept=".json,application/json" style="display: none;">
                                            <button id="upload-context-button" class="action-button" title="Import a component library from a .json file">Upload Library</button>
                                            <button id="download-context-button" class="action-button" title="Export the current component library to a .json file">Download Library</button>
                                        </div>
                                    </div>
                                    <div id="context-component-viewer" class="context-viewer-panel">
                                        <div class="files-preview-placeholder">Select a component to view it here.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="code" class="tab-content">
                            <div class="full-code-container">
                                <p>Edit the code below and click "Process Code" to have the AI analyze it and update the Vibe Editor nodes.</p>
                                <div class="file-upload-container">
                                    <p>Or, upload an HTML file to start a new project:</p>
                                    <input type="file" id="html-file-input" accept=".html,text/html" style="display: none;">
                                    <button id="upload-html-button" class="action-button">Upload & Process File</button>
                                </div>
                                <div class="file-upload-container">
                                    <p>Upload a ZIP of a multi-file website (HTML, CSS, JS, images). We'll inline CSS/JS and re-link assets automatically.</p>
                                    <input type="file" id="zip-file-input" accept=".zip,application/zip" style="display: none;">
                                    <button id="upload-zip-button" class="action-button">Upload ZIP & Import Project</button>
                                </div>
                                <div class="file-upload-container">
                                    <p>Download your current project as a multi-file ZIP (including a self-contained bundle.html).</p>
                                    <button id="download-zip-button" class="action-button">Download Project ZIP</button>
                                </div>
                                <div class="search-container">
                                    <input type="text" id="search-input" placeholder="Find in code...">
                                    <button id="find-prev-button" class="action-button">&lt; Prev</button>
                                    <button id="find-next-button" class="action-button">Next &gt;</button>
                                    <span id="search-results-count"></span>
                                </div>
                                <textarea id="full-code-editor"></textarea>
                                <button id="update-tree-from-code-button" class="action-button">Process Code and Update Nodes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation for Mobile -->
    <div class="fixed-bottom bg-dark d-md-none">
        <div class="d-flex justify-content-around">
            <a href="#" class="nav-link py-3 px-2 tab-button active" data-tab="start" title="Start">
                <i class="fs-4 bi-house text-white"></i>
            </a>
            <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="preview" title="Live Preview">
                <i class="fs-4 bi-display text-white"></i>
            </a>
            <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="editor" title="Vibe Editor">
                <i class="fs-4 bi-pencil-square text-white"></i>
            </a>
            <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="agent" title="Agent">
                <i class="fs-4 bi-robot text-white"></i>
            </a>
            <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="files" title="Files">
                <i class="fs-4 bi-folder text-white"></i>
            </a>
            <a href="#" class="nav-link py-3 px-2 tab-button" data-tab="code" title="Full Code">
                <i class="fs-4 bi-code-slash text-white"></i>
            </a>
        </div>
    </div>
    
    <!-- Modals -->
     <div id="add-node-modal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Add New Child Node</h2>
            <p>Define the new component to add to the selected container.</p>
            <input type="hidden" id="add-node-parent-id">
            <input type="hidden" id="add-node-target-id">
            <input type="hidden" id="add-node-position">
            <label for="new-node-id">New Node ID (kebab-case):</label>
            <input type="text" id="new-node-id" placeholder="e.g., my-new-button">
            <label for="new-node-description">Description:</label>
            <textarea id="new-node-description" rows="2" placeholder="A concise description..."></textarea>
            <label for="new-node-type">Node Type:</label>
            <select id="new-node-type">
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
            </select>
            <button id="create-node-button" class="action-button">Create Node</button>
            <div id="add-node-error" class="modal-error"></div>
        </div>
    </div>

    <div id="settings-modal" class="modal">
        <div class="modal-content">
            <span class="close-button" id="close-settings-modal-button">&times;</span>
            <h2>API Settings</h2>
            <div class="ai-provider-container">
                <h3>AI Provider</h3>
                <select id="ai-provider-select">
                    <option value="gemini">Google Gemini</option>
                    <option value="nscale">nscale</option>
                </select>
            </div>
            <div id="gemini-settings-container">
                 <h3>Gemini Model</h3>
                 <select id="gemini-model-select">
                    <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Fast, Default)</option>
                    <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Advanced)</option>
                    <option value="gemini-1.0-pro">Gemini 1.0 Pro (Legacy)</option>
                    <optgroup label="Advanced & Experimental Models">
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    </optgroup>
                 </select>
                <div id="gemini-api-key-container" class="api-key-container">
                    <h3>Gemini API Key</h3>
                    <input type="password" id="api-key-input" placeholder="Enter your Gemini API Key here...">
                    <button id="save-api-key-button">Save Key</button>
                    <div id="api-key-status"></div>
                </div>
            </div>
            <div id="nscale-api-key-container" class="api-key-container" style="display: none;">
                <h3>nscale API Key</h3>
                <input type="password" id="nscale-api-key-input" placeholder="Enter your nscale API Key here...">
                <button id="save-nscale-api-key-button">Save Key</button>
                <div id="nscale-api-key-status"></div>
            </div>
        </div>
    </div>

    <div id="edit-node-modal" class="modal">
        <div class="modal-content">
            <span class="close-button" id="close-edit-node-modal-button">&times;</span>
            <h2>Edit Component</h2>
            <label>Node ID</label>
            <input type="text" id="edit-node-id" readonly>
            <label>Type</label>
            <input type="text" id="edit-node-type" readonly>
            <label for="edit-node-description">Description</label>
            <textarea id="edit-node-description" rows="3"></textarea>
            <button id="ai-improve-description-button" class="action-button" style="margin-top: 10px;">AI: Improve Description</button>
            <label for="edit-node-code">Code</label>
            <textarea id="edit-node-code" rows="10"></textarea>
            <div class="button-row">
                <button id="save-edit-node-button" class="action-button">Save & Update Vibe</button>
                <button id="save-as-component-button" class="action-button">Save as Component</button>
            </div>
            <div id="edit-node-error" class="modal-error"></div>
        </div>
    </div>

    <div id="context-component-modal" class="modal">
        <div class="modal-content">
            <span class="close-button" id="close-context-modal-button">&times;</span>
            <h2 id="component-modal-title">Add New Component</h2>
            <div class="component-ai-generator">
                <label for="component-ai-prompt-input">Generate with AI:</label>
                <textarea id="component-ai-prompt-input" rows="3" placeholder="e.g., 'a responsive card with an image...'"></textarea>
                <button id="generate-component-button" class="action-button">Generate Component</button>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #4b5263;">
            <label for="component-id-input">Component ID (unique, kebab-case):</label>
            <input type="text" id="component-id-input" placeholder="e.g., responsive-navbar">
            <label for="component-name-input">Display Name:</label>
            <input type="text" id="component-name-input" placeholder="e.g., Responsive Navbar">
            <label for="component-description-input">Description:</label>
            <textarea id="component-description-input" rows="2"></textarea>
            <div class="component-modal-code-fields">
                <div>
                    <label for="component-html-input">HTML Snippet:</label>
                    <textarea id="component-html-input" rows="6"></textarea>
                </div>
                <div>
                    <label for="component-css-input">CSS Snippet:</label>
                    <textarea id="component-css-input" rows="6"></textarea>
                </div>
                <div>
                    <label for="component-js-input">JavaScript Snippet:</label>
                    <textarea id="component-js-input" rows="6"></textarea>
                </div>
            </div>
            <div class="button-row">
                <button id="save-component-button" class="action-button">Save Component</button>
                <button id="delete-component-button" class="action-button danger" style="display: none;">Delete</button>
            </div>
            <div id="component-modal-error" class="modal-error"></div>
        </div>
    </div>

    <div id="global-agent-loader">
        <div class="loading-spinner"></div>
        <div class="loader-text">
            <p id="global-agent-status-text">Agent is working...</p>
            <p id="global-agent-progress-text"></p>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="app.js"></script>

</body>
</html>
