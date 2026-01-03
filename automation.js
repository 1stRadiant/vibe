
/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * Fixed UI Injection + Event-Driven Logic + Expanded Trigger Library
 */

(function() {
    const UI_MAP = {
        "Start Tab": ".tab-button[data-tab='start']",
        "Preview Tab": ".tab-button[data-tab='preview']",
        "Editor Tab": ".tab-button[data-tab='editor']",
        "Agent Tab": ".tab-button[data-tab='agent']",
        "Chat Tab": ".tab-button[data-tab='chat']",
        "Files Tab": ".tab-button[data-tab='files']",
        "Code Tab": ".tab-button[data-tab='code']",
        "Settings Tab": "#open-settings-modal-button",
        "Project Name Input": "#new-project-id-input",
        "Project Prompt Input": "#project-prompt-input",
        "Build Project Button": "#start-iterative-build-button", 
        "Generate From Instructions": "#generate-from-instructions-button",
        "Load GitHub Button": "#load-from-github-button",
        "Save Cloud": "#save-to-cloud-button",
        "Save Local": "#save-to-local-button",
        "Undo": "#undo-button",
        "Redo": "#redo-button",
        "Inspect": "#toggle-inspect-button",
        "Agent Input": "#agent-prompt-input",
        "Add Task": "#run-agent-single-task-button",
        "Process Queue": "#start-iterative-session-button",
        "Chat Input": "#chat-prompt-input",
        "Send Chat": "#send-chat-button",
        "Upload HTML": "#upload-html-button",
        "Update From Code": "#update-tree-from-code-button",
        "Close Modal": ".close-button",
        "Login Button": "#login-button",
        // Event Observation Targets
        "Agent Log": "#agent-output",
        "Console Log": "#console-output"
    };

    const TEMPLATES = [
        { label: '⚡ Queue Done', type: 'event', text: 'Wait until "Task queue complete" appears in Agent Log, then ' },
        { label: '🐞 On Error', type: 'event', text: 'Wait until "Error" appears in Agent Log, then ' },
        { label: '☁️ On Saved', type: 'event', text: 'Wait until "Saved" appears in Save Cloud, then ' },
        { label: '⏳ Wait 2s', type: 'event', text: 'Wait 2000ms, then ' },
        { label: '🧭 Goto Tab', type: 'action', text: 'Go to Agent Tab ' },
        { label: '👆 Click', type: 'action', text: 'Click "Add Task" ' },
        { label: '⌨️ Type', type: 'action', text: 'Type "Fix the header" into Agent Input ' },
        { label: '🔎 Inspect', type: 'action', text: 'Click Inspect ' },
        { label: '🔄 Repeat', type: 'logic', text: 'Repeat this 3 times: ' }
    ];

    class VibeAutomator {
        constructor() {
            this.taskQueue = [];
            this.isRunning = false;
            this.init();
        }

        init() {
            console.log("🤖 Auto-Pilot System Initializing...");
            this.injectUI();
            
            // Listen for internal "step-complete" event to drive the sequence
            window.removeEventListener('vibe-task-complete', this.handleTaskComplete);
            window.addEventListener('vibe-task-complete', () => this.processNextTask());
        }

        injectUI() {
            // Remove existing if re-injected
            if (document.getElementById('auto-pilot-btn')) return;

            const styles = document.createElement('style');
            styles.id = 'auto-pilot-styles';
            styles.textContent = `
                #auto-pilot-btn { 
                    position: fixed !important; 
                    bottom: 25px !important; 
                    right: 25px !important; 
                    width: 60px !important; 
                    height: 60px !important; 
                    border-radius: 50% !important; 
                    background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%) !important; 
                    color: white !important; 
                    border: 2px solid rgba(255,255,255,0.2) !important; 
                    cursor: pointer !important; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; 
                    z-index: 2147483647 !important; 
                    display: flex !important; 
                    align-items: center !important; 
                    justify-content: center !important; 
                    font-size: 30px !important; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                }
                #auto-pilot-btn:hover { transform: scale(1.1) rotate(10deg); box-shadow: 0 8px 30px rgba(142, 45, 226, 0.6); }
                
                #auto-modal { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 550px; background: #1a1d21; border: 1px solid #444; border-radius: 12px; z-index: 2147483647; box-shadow: 0 20px 60px rgba(0,0,0,0.8); padding: 20px; color: #fff; font-family: sans-serif; }
                #auto-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483646; backdrop-filter: blur(4px); }
                
                .auto-input { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #444; color: #00ff00; border-radius: 6px; font-family: monospace; font-size: 13px; box-sizing: border-box; resize: vertical; }
                .auto-log-box { max-height: 120px; overflow-y: auto; background: #080808; border: 1px solid #222; padding: 10px; font-family: monospace; font-size: 11px; color: #888; margin-bottom: 15px; border-radius: 4px; display: none; }
                .auto-btn { padding: 10px 20px; border-radius: 6px; cursor: pointer; border: none; font-weight: bold; }
                
                .trigger-container { margin-bottom: 15px; border: 1px solid #333; padding: 10px; border-radius: 6px; background: #21252b; }
                .trigger-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 5px; align-items: center; }
                .trigger-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; width: 50px; }
                .trigger-chip { font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s; user-select: none; border: 1px solid transparent; }
                
                .chip-event { background: rgba(97, 175, 239, 0.15); color: #61afef; border-color: rgba(97, 175, 239, 0.3); }
                .chip-event:hover { background: rgba(97, 175, 239, 0.3); }
                
                .chip-action { background: rgba(152, 195, 121, 0.15); color: #98c379; border-color: rgba(152, 195, 121, 0.3); }
                .chip-action:hover { background: rgba(152, 195, 121, 0.3); }

                .chip-logic { background: rgba(229, 192, 123, 0.15); color: #e5c07b; border-color: rgba(229, 192, 123, 0.3); }
                .chip-logic:hover { background: rgba(229, 192, 123, 0.3); }
                
                .target-highlight { 
                    outline: 4px solid #d946ef !important; 
                    outline-offset: 4px !important; 
                    box-shadow: 0 0 30px rgba(217, 70, 239, 0.8) !important; 
                    position: relative !important;
                    z-index: 2147483645 !important;
                }
            `;
            document.head.appendChild(styles);

            const btn = document.createElement('button');
            btn.id = 'auto-pilot-btn';
            btn.innerHTML = '🤖'; 
            btn.title = 'AI Auto-Pilot';
            btn.onclick = () => this.openModal();
            
            const overlay = document.createElement('div');
            overlay.id = 'auto-overlay';
            overlay.onclick = () => this.closeModal();

            const modal = document.createElement('div');
            modal.id = 'auto-modal';
            modal.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0; color:#8E2DE2;">🤖 AI Auto-Pilot</h3>
                    <button id="auto-close-x" style="background:none; border:none; color:#666; cursor:pointer; font-size:20px;">&times;</button>
                </div>
                
                <div class="trigger-container" id="trigger-container">
                    <!-- Triggers injected here -->
                </div>

                <textarea id="auto-prompt" class="auto-input" rows="5" placeholder="Describe automation flow... (e.g. 'Go to Agent, type fix code, click Add, wait for Queue Done, then click Save')"></textarea>
                
                <div id="auto-logs" class="auto-log-box"></div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button id="auto-run-btn" class="auto-btn" style="background:#4A00E0; color:white;">Run Sequence</button>
                </div>
            `;

            document.body.appendChild(btn);
            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            document.getElementById('auto-close-x').onclick = () => this.closeModal();
            document.getElementById('auto-run-btn').onclick = () => this.startAutomation();
            
            this.renderTriggers();
        }

        renderTriggers() {
            const container = document.getElementById('trigger-container');
            if (!container) return;

            const groups = {
                event: { label: 'Wait', items: [] },
                action: { label: 'Do', items: [] },
                logic: { label: 'Logic', items: [] }
            };

            TEMPLATES.forEach(t => groups[t.type].items.push(t));

            Object.keys(groups).forEach(key => {
                const group = groups[key];
                const row = document.createElement('div');
                row.className = 'trigger-row';
                
                const label = document.createElement('span');
                label.className = 'trigger-label';
                label.textContent = group.label;
                row.appendChild(label);

                group.items.forEach(item => {
                    const btn = document.createElement('button');
                    btn.className = `trigger-chip chip-${item.type}`;
                    btn.textContent = item.label;
                    btn.onclick = () => this.insertAtCursor(document.getElementById('auto-prompt'), item.text);
                    row.appendChild(btn);
                });

                container.appendChild(row);
            });
        }

        insertAtCursor(input, text) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const before = input.value.substring(0, start);
            const after = input.value.substring(end, input.value.length);
            input.value = before + text + after;
            input.selectionStart = input.selectionEnd = start + text.length;
            input.focus();
        }

        openModal() {
            document.getElementById('auto-modal').style.display = 'block';
            document.getElementById('auto-overlay').style.display = 'block';
            document.getElementById('auto-prompt').focus();
        }

        closeModal() {
            document.getElementById('auto-modal').style.display = 'none';
            document.getElementById('auto-overlay').style.display = 'none';
        }

        log(msg) {
            const logBox = document.getElementById('auto-logs');
            logBox.style.display = 'block';
            const entry = document.createElement('div');
            entry.textContent = `> ${msg}`;
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        }

        async startAutomation() {
            const promptInput = document.getElementById('auto-prompt');
            const runBtn = document.getElementById('auto-run-btn');
            const prompt = promptInput.value;

            if(!prompt || this.isRunning) return;

            runBtn.disabled = true;
            runBtn.textContent = "Analyzing...";
            this.log("Parsing instructions via AI...");
            
            try {
                const systemPrompt = `You are a browser automation engine. Convert user instructions into a JSON execution array.
                
                COMMANDS:
                - {"action": "click", "target": "UI_MAP_KEY"}
                - {"action": "input", "target": "UI_MAP_KEY", "value": "text"}
                - {"action": "navigate", "target": "tab_name"} (tabs: start, preview, editor, agent, chat, files, code)
                - {"action": "wait", "value": 1000} (milliseconds)
                - {"action": "waitForText", "target": "UI_MAP_KEY", "value": "text to contain"} (Wait until element contains text)

                UI_MAP_KEYS: ${Object.keys(UI_MAP).join(', ')}
                
                Example User: "Go to agent tab, type 'Refactor', click Add, wait for 'Task queue complete' in Agent Log, then click Save Cloud"
                Result: [
                    {"action":"navigate","target":"agent"},
                    {"action":"input","target":"Agent Input","value":"Refactor"},
                    {"action":"click","target":"Add Task"},
                    {"action":"waitForText","target":"Agent Log","value":"Task queue complete"},
                    {"action":"click","target":"Save Cloud"}
                ]
                
                Return ONLY the JSON array. Handles logic like "repeat 3 times" by duplicating steps in the array.`;

                const response = await window.vibeAPI.callAI(systemPrompt, prompt, true);
                let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                
                this.taskQueue = JSON.parse(cleanJson);
                this.isRunning = true;
                this.closeModal();
                
                // Start sequence
                window.dispatchEvent(new CustomEvent('vibe-task-complete'));
            } catch (e) {
                this.log("AI Error: " + e.message);
                runBtn.disabled = false;
                runBtn.textContent = "Run Sequence";
            }
        }

        async processNextTask() {
            if (this.taskQueue.length === 0) {
                this.log("Sequence complete.");
                this.isRunning = false;
                document.getElementById('auto-run-btn').disabled = false;
                document.getElementById('auto-run-btn').textContent = "Run Sequence";
                return;
            }

            const step = this.taskQueue.shift();
            await this.performAction(step);
            
            // Dispatch event to trigger the next step in the sequence
            window.dispatchEvent(new CustomEvent('vibe-task-complete'));
        }

        async performAction(step) {
            return new Promise(async (resolve) => {
                this.log(`Action: ${step.action} on ${step.target || 'delay'}`);

                if (step.action === 'wait') {
                    setTimeout(resolve, step.value || 1000);
                    return;
                }

                if (step.action === 'navigate') {
                    if (window.vibeAPI && window.vibeAPI.switchToTab) {
                        window.vibeAPI.switchToTab(step.target);
                        setTimeout(resolve, 800); 
                    } else { resolve(); }
                    return;
                }

                const selector = UI_MAP[step.target] || step.target;
                const el = document.querySelector(selector);

                if (!el) {
                    console.warn("Element not found for step:", step);
                    resolve();
                    return;
                }

                // Handle Event/Text Observation
                if (step.action === 'waitForText') {
                    this.log(`Waiting for text "${step.value}" in ${step.target}...`);
                    
                    // Poll for text presence
                    const checkInterval = setInterval(() => {
                        const currentText = el.innerText || el.textContent || "";
                        if (currentText.includes(step.value)) {
                            clearInterval(checkInterval);
                            clearTimeout(timeout);
                            this.log(`Event detected: "${step.value}" found.`);
                            resolve();
                        }
                    }, 500);

                    // Timeout after 60 seconds to prevent hanging
                    const timeout = setTimeout(() => {
                        clearInterval(checkInterval);
                        this.log(`Timeout waiting for text: ${step.value}`);
                        resolve(); // Resolve anyway to not block forever
                    }, 60000);
                    
                    return;
                }

                // UI Interaction Actions
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('target-highlight');

                // Allow time for scroll and visual focus
                setTimeout(() => {
                    if (step.action === 'click') {
                        el.click();
                    } else if (step.action === 'input') {
                        el.value = step.value;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    setTimeout(() => {
                        el.classList.remove('target-highlight');
                        resolve();
                    }, 600);
                }, 700);
            });
        }
    }

    // Initialize logic: Check for document body and vibeAPI availability
    function bootstrap() {
        if (document.body) {
            window.vibeAutomator = new VibeAutomator();
        } else {
            setTimeout(bootstrap, 100);
        }
    }

    // Start immediately if possible
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        bootstrap();
    } else {
        window.addEventListener('DOMContentLoaded', bootstrap);
    }

})();
