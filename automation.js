
/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * v4.0: Visual Sequence Builder & Integrated UI
 */

(function() {
    // Comprehensive mapping of UI labels to CSS selectors
    const UI_MAP = {
        // --- TABS ---
        "Start Tab": ".tab-button[data-tab='start']",
        "Preview Tab": ".tab-button[data-tab='preview']",
        "Editor Tab": ".tab-button[data-tab='editor']",
        "Agent Tab": ".tab-button[data-tab='agent']",
        "Chat Tab": ".tab-button[data-tab='chat']",
        "Files Tab": ".tab-button[data-tab='files']",
        "Code Tab": ".tab-button[data-tab='code']",
        "Settings Tab": "#open-settings-modal-button",
        "Context Tab": ".tab-button[data-tab='context']",
        
        // --- INPUTS ---
        "Project Name Input": "#new-project-id-input",
        "Project Prompt Input": "#project-prompt-input",
        "Agent Input": "#agent-prompt-input",
        "Chat Input": "#chat-prompt-input",
        "Search Input": "#search-input",
        "Full Code Editor": "#full-code-editor",
        "Zip Input": "#zip-file-input",
        
        // --- BUTTONS ---
        "Build Project Button": "#start-iterative-build-button", 
        "Generate From Instructions": "#generate-from-instructions-button",
        "Load GitHub Button": "#load-from-github-button",
        "Save Cloud": "#save-to-cloud-button",
        "Save Local": "#save-to-local-button",
        "Undo": "#undo-button",
        "Redo": "#redo-button",
        "Inspect": "#toggle-inspect-button",
        "Add Task": "#run-agent-single-task-button",
        "Process Queue": "#start-iterative-session-button",
        "Stop Queue": "#end-session-button",
        "Send Chat": "#send-chat-button",
        "Upload HTML": "#upload-html-button",
        "Upload Zip": "#upload-zip-button",
        "Update From Code": "#update-tree-from-code-button",
        "Close Modal": ".close-button",
        "Login Button": "#login-button",
        "Run Code AI": "#run-full-code-ai-button",
        "Generate Flowchart": "#generate-flowchart-button",
        
        // --- OBSERVATION TARGETS ---
        "Agent Log": "#agent-output",
        "Console Log": "#console-output",
        "Global Loader": "#global-agent-loader",
        "Preview Frame": "#website-preview",
        "Task Queue List": "#task-queue-list"
    };

    class VibeAutomator {
        constructor() {
            this.sequence = []; // The visual list of steps
            this.taskQueue = []; // The internal execution queue
            this.isRunning = false;
            this.init();
        }

        init() {
            console.log("🤖 Auto-Pilot System Initializing...");
            
            // Wait for DOM in case loaded in head
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.bindUI());
            } else {
                this.bindUI();
            }

            // Listen for internal "step-complete" event to drive the sequence
            window.removeEventListener('vibe-task-complete', this.handleTaskComplete);
            window.addEventListener('vibe-task-complete', () => this.processNextTask());
        }

        bindUI() {
            // 1. Dragging Logic for the Panel Header
            const panel = document.getElementById('automation-panel');
            const header = document.getElementById('auto-header-drag');
            
            if (panel && header) {
                let isDragging = false, startX, startY, initialLeft, initialTop;
                
                header.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = panel.getBoundingClientRect();
                    initialLeft = rect.left;
                    initialTop = rect.top;
                    panel.style.right = 'auto'; // Disable right anchoring once dragged
                    panel.style.bottom = 'auto'; // Disable bottom anchoring
                    panel.style.left = initialLeft + 'px';
                    panel.style.top = initialTop + 'px';
                    header.style.cursor = 'grabbing';
                });

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    panel.style.left = (initialLeft + dx) + 'px';
                    panel.style.top = (initialTop + dy) + 'px';
                });

                window.addEventListener('mouseup', () => {
                    isDragging = false;
                    header.style.cursor = 'grab';
                });
            }

            // 2. Bind Toolbar Buttons to Add Steps
            this.bindBtn('auto-btn-queue-done', { 
                action: 'waitForText', target: 'Agent Log', value: 'Task queue complete', 
                label: 'Wait for Agent Finish', icon: 'bi-check2-square' 
            });
            
            this.bindBtn('auto-btn-loader-gone', { 
                action: 'waitForDisappear', target: 'Global Loader', 
                label: 'Wait for Loader', icon: 'bi-hourglass-split' 
            });
            
            this.bindBtn('auto-btn-wait-2s', { 
                action: 'wait', value: 2000, 
                label: 'Wait 2 Seconds', icon: 'bi-clock' 
            });
            
            this.bindBtn('auto-btn-click-add', { 
                action: 'click', target: 'Add Task', 
                label: 'Click "Add Task"', icon: 'bi-mouse' 
            });
            
            this.bindBtn('auto-btn-type-fix', { 
                action: 'input', target: 'Agent Input', value: 'Fix the errors in the code', 
                label: 'Type "Fix errors..."', icon: 'bi-keyboard' 
            });
            
            this.bindBtn('auto-btn-go-preview', { 
                action: 'navigate', target: 'Preview Tab', 
                label: 'Go to Preview', icon: 'bi-eye' 
            });
            
            this.bindBtn('auto-btn-ai-decide', { 
                action: 'aiDecision', value: 'Check logs and fix any errors found.', 
                label: 'AI: Fix Errors', icon: 'bi-cpu' 
            });

            // 3. Bind Run Button
            const runBtn = document.getElementById('run-automation-sequence-button');
            if (runBtn) {
                runBtn.addEventListener('click', () => this.runSequence());
            }
        }

        bindBtn(id, stepData) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.addStep(stepData));
            }
        }

        addStep(step) {
            // Clone to avoid reference issues
            this.sequence.push({ ...step });
            this.renderSequence();
        }

        renderSequence() {
            const display = document.getElementById('automation-sequence-display');
            if (!display) return;
            
            display.innerHTML = '';
            if (this.sequence.length === 0) {
                display.innerHTML = '<div class="text-secondary fst-italic p-2">Sequence is empty. Click buttons below to add steps.</div>';
                return;
            }

            this.sequence.forEach((step, index) => {
                const row = document.createElement('div');
                row.className = 'd-flex justify-content-between align-items-center mb-1 p-1';
                row.style.borderBottom = '1px solid #333';
                row.style.fontSize = '0.9rem';
                
                // Highlight current step if running
                if (this.isRunning && index === 0) { // Since we shift() from taskQueue, visual index logic is tricky. 
                                                     // Simpler approach: Just list them. 
                }

                row.innerHTML = `
                    <div class="text-white">
                        <span class="text-secondary me-2">${index + 1}.</span>
                        <i class="bi ${step.icon || 'bi-dot'} me-2 text-info"></i>
                        ${step.label}
                    </div>
                `;
                
                const deleteBtn = document.createElement('i');
                deleteBtn.className = 'bi bi-x text-danger';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '1.2rem';
                deleteBtn.title = 'Remove Step';
                deleteBtn.onclick = () => {
                    this.sequence.splice(index, 1);
                    this.renderSequence();
                };

                row.appendChild(deleteBtn);
                display.appendChild(row);
            });
        }

        async runSequence() {
            if (this.isRunning) return;
            if (this.sequence.length === 0) {
                alert("Please add steps to the sequence first.");
                return;
            }
            
            const runBtn = document.getElementById('run-automation-sequence-button');
            const originalText = runBtn.innerHTML;
            
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Running...';

            this.isRunning = true;
            
            // Copy sequence to execution queue
            this.taskQueue = JSON.parse(JSON.stringify(this.sequence));
            
            this.processNextTask().then(() => {
                // Done
                this.isRunning = false;
                runBtn.disabled = false;
                runBtn.innerHTML = originalText;
            });
        }

        async processNextTask() {
            if (!this.isRunning) return;

            if (this.taskQueue.length === 0) {
                console.log("🤖 Sequence complete.");
                this.isRunning = false;
                const runBtn = document.getElementById('run-automation-sequence-button');
                if(runBtn) {
                    runBtn.disabled = false;
                    runBtn.innerHTML = '<i class="bi bi-play-fill me-1"></i> Run Sequence';
                }
                return;
            }

            const step = this.taskQueue.shift();
            
            // Visual feedback: Highlight the top item in display? 
            // (Simpler: just execute)
            
            await this.performAction(step);
            
            // Recursively call next
            setTimeout(() => this.processNextTask(), 100);
        }

        async performAction(step) {
            return new Promise(async (resolve) => {
                console.log(`🤖 Action: ${step.action} | Target: ${step.target || 'N/A'}`);

                // --- 1. Basic Wait ---
                if (step.action === 'wait') {
                    setTimeout(resolve, step.value || 1000);
                    return;
                }

                // --- 2. AI Decision ---
                if (step.action === 'aiDecision') {
                    // Requires vibeAPI to be available
                    if (window.vibeAPI) {
                        const agentLogs = document.querySelector('#agent-output') ? document.querySelector('#agent-output').innerText.slice(-2000) : "";
                        const systemPrompt = `You are the automation brain. Goal: ${step.value}.
                        Logs: ${agentLogs}
                        Return a JSON array of next actions using standard commands (click, input, navigate).
                        Available Targets: ${Object.keys(UI_MAP).join(', ')}.
                        If the goal is satisfied, return [].`;
                        
                        try {
                            const response = await window.vibeAPI.callAI(systemPrompt, "Decide next steps", true);
                            let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                            // Simple heuristic to clean non-json
                            const jsonStart = cleanJson.indexOf('[');
                            const jsonEnd = cleanJson.lastIndexOf(']');
                            if(jsonStart !== -1 && jsonEnd !== -1) {
                                cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
                                const newSteps = JSON.parse(cleanJson);
                                if (newSteps.length > 0) {
                                    console.log(`🧠 AI added ${newSteps.length} steps.`);
                                    // Map AI simplified steps to our internal format
                                    const formattedSteps = newSteps.map(s => ({
                                        ...s,
                                        label: `AI: ${s.action} ${s.target || ''}`,
                                        icon: 'bi-robot'
                                    }));
                                    this.taskQueue.unshift(...formattedSteps);
                                }
                            }
                        } catch (e) { console.error("AI Decision Error:", e); }
                    }
                    resolve();
                    return;
                }

                // --- 3. Navigation ---
                if (step.action === 'navigate') {
                    let tabId = step.target.toLowerCase();
                    const knownTabs = ['start', 'preview', 'editor', 'agent', 'chat', 'files', 'code', 'context'];
                    const mappedTab = knownTabs.find(t => tabId.includes(t));

                    if (mappedTab && window.vibeAPI && window.vibeAPI.switchToTab) {
                        window.vibeAPI.switchToTab(mappedTab);
                        setTimeout(resolve, 800);
                        return;
                    }
                }

                // --- Resolve Selector ---
                const selector = UI_MAP[step.target] || step.target;
                
                // --- 4. Wait Logic ---
                if (step.action === 'waitForDisappear') {
                    const checkInterval = setInterval(() => {
                        const el = document.querySelector(selector);
                        if (!el || el.offsetParent === null || el.style.display === 'none') {
                            clearInterval(checkInterval); clearTimeout(timeout); resolve();
                        }
                    }, 500);
                    const timeout = setTimeout(() => { clearInterval(checkInterval); resolve(); }, 30000);
                    return;
                }

                if (step.action === 'waitForText') {
                    const checkInterval = setInterval(() => {
                        const currentEl = document.querySelector(selector);
                        const txt = currentEl ? (currentEl.innerText || "") : "";
                        if (txt.includes(step.value)) {
                            clearInterval(checkInterval); clearTimeout(timeout); resolve();
                        }
                    }, 500);
                    const timeout = setTimeout(() => { clearInterval(checkInterval); resolve(); }, 30000);
                    return;
                }

                // --- 5. Interactions ---
                const el = document.querySelector(selector);

                if (!el) {
                    console.warn(`Element not found: ${step.target} (${selector})`);
                    resolve(); 
                    return;
                }

                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Visual Highlight
                const originalOutline = el.style.outline;
                el.style.outline = "3px solid #00d2ff";
                
                setTimeout(() => {
                    if (step.action === 'click') {
                        el.click();
                    } else if (step.action === 'input') {
                        el.value = step.value;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    setTimeout(() => {
                        el.style.outline = originalOutline;
                        resolve();
                    }, 500);
                }, 500);
            });
        }
    }

    // Initialize
    window.vibeAutomator = new VibeAutomator();

})();