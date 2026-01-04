
/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * v3.1: Sidebar Compatible + Updated Selectors
 */

(function() {
    // UPDATED UI MAP: Matches the new Sidebar + Layout structure
    const UI_MAP = {
        // --- TABS (Left Sidebar) ---
        "Start Tab": ".tab-button[data-tab='start']",
        "Preview Tab": ".tab-button[data-tab='preview']",
        "Editor Tab": ".tab-button[data-tab='editor']",
        "Chat Tab": ".tab-button[data-tab='chat']",
        "Files Tab": ".tab-button[data-tab='files']",
        "Code Tab": ".tab-button[data-tab='code']",
        "Context Tab": ".tab-button[data-tab='context']",
        "Console Tab": ".tab-button[data-tab='console']",
        
        // --- AUTO PILOT (Right Sidebar) ---
        "Agent Sidebar": ".agent-sidebar", // The new sidebar container
        "Agent Input": "#agent-prompt-input",
        "Add Task": "#run-agent-single-task-button",
        "Process Queue": "#start-iterative-session-button",
        "Stop Queue": "#end-session-button",
        "Agent Log": "#agent-output",

        // --- INPUTS & BUTTONS ---
        "Project Name Input": "#new-project-id-input",
        "Project Prompt Input": "#project-prompt-input",
        "Build Project Button": "#start-iterative-build-button", 
        "Chat Input": "#chat-prompt-input",
        "Send Chat": "#send-chat-button",
        "Search Input": "#search-input",
        "Full Code Editor": "#full-code-editor",
        "Update From Code": "#update-tree-from-code-button",
        "Save Cloud": "#save-to-cloud-button",
        "Save Local": "#save-to-local-button",
        "Settings Button": "#open-settings-modal-button",
        "Close Modal": ".close-button",
        
        // --- OBSERVATION ---
        "Console Log": "#console-output",
        "Global Loader": "#global-agent-loader",
        "Preview Frame": "#website-preview"
    };

    const TEMPLATES = [
        { label: '⚡ Queue Done', type: 'event', text: 'Wait until "Task queue complete" appears in Agent Log, then ' },
        { label: '👻 Loader Gone', type: 'event', text: 'Wait until Global Loader disappears, then ' },
        { label: '⏳ Wait 2s', type: 'event', text: 'Wait 2000ms, then ' },
        { label: '👆 Click Add', type: 'action', text: 'Click "Add Task" ' },
        { label: '⌨️ Type Fix', type: 'action', text: 'Type "Make the font larger" into Agent Input ' },
        { label: '🧭 Focus Agent', type: 'action', text: 'Go to Agent Sidebar ' },
        { label: '🧭 Go Preview', type: 'action', text: 'Go to Preview Tab ' },
        { label: '🧠 AI Decide', type: 'logic', text: 'Analyze logs and decide next step to: "Ensure the page looks correct" ' }
    ];

    class VibeAutomator {
        constructor() {
            this.taskQueue = [];
            this.isRunning = false;
            this.init();
        }

        init() {
            console.log("🤖 Auto-Pilot v3.1 (Sidebar Mode) Initializing...");
            this.injectUI();
            window.removeEventListener('vibe-task-complete', this.handleTaskComplete);
            window.addEventListener('vibe-task-complete', () => this.processNextTask());
        }

        injectUI() {
            if (document.getElementById('auto-pilot-btn')) return;

            const styles = document.createElement('style');
            styles.id = 'auto-pilot-styles';
            styles.textContent = `
                #auto-pilot-btn { 
                    position: fixed !important; bottom: 25px !important; right: 400px !important; 
                    width: 50px !important; height: 50px !important; border-radius: 50% !important; 
                    background: #8E2DE2 !important; color: white !important; border: none !important;
                    cursor: pointer !important; z-index: 2147483647 !important; display: flex !important; 
                    align-items: center !important; justify-content: center !important; font-size: 24px !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
                }
                #auto-modal { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 550px; background: #1a1d21; border: 1px solid #444; border-radius: 12px; z-index: 2147483647; padding: 20px; color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }
                #auto-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483646; }
                .auto-input { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #444; color: #00ff00; border-radius: 6px; font-family: monospace; }
                .trigger-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
                .trigger-chip { font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer; border: 1px solid #444; background: #2c313a; color: #eee; }
                .target-highlight { outline: 4px solid #0dcaf0 !important; outline-offset: 2px !important; transition: all 0.3s; }
            `;
            document.head.appendChild(styles);

            const btn = document.createElement('button');
            btn.id = 'auto-pilot-btn'; btn.innerHTML = '🪄'; 
            btn.onclick = () => this.openModal();
            
            const overlay = document.createElement('div');
            overlay.id = 'auto-overlay'; overlay.onclick = () => this.closeModal();

            const modal = document.createElement('div');
            modal.id = 'auto-modal';
            modal.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h4 style="margin:0;">🪄 Automation Sequence</h4>
                    <button id="auto-close-x" style="background:none; border:none; color:#666; cursor:pointer; font-size:20px;">&times;</button>
                </div>
                <div class="trigger-row" id="trigger-container"></div>
                <textarea id="auto-prompt" class="auto-input" rows="4" placeholder="e.g. Go to Start Tab, type 'My Project' into Project Name, click Build..."></textarea>
                <div id="auto-logs" style="max-height:100px; overflow:auto; background:#000; font-size:11px; padding:8px; margin-bottom:10px; display:none; color:#888;"></div>
                <button id="auto-run-btn" style="width:100%; padding:10px; background:#4A00E0; color:white; border:none; border-radius:5px; font-weight:bold;">Run Sequence</button>
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
            TEMPLATES.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'trigger-chip';
                btn.textContent = item.label;
                btn.onclick = () => {
                    const input = document.getElementById('auto-prompt');
                    input.value += item.text;
                    input.focus();
                };
                container.appendChild(btn);
            });
        }

        openModal() {
            document.getElementById('auto-modal').style.display = 'block';
            document.getElementById('auto-overlay').style.display = 'block';
        }

        closeModal() {
            document.getElementById('auto-modal').style.display = 'none';
            document.getElementById('auto-overlay').style.display = 'none';
        }

        log(msg) {
            const logBox = document.getElementById('auto-logs');
            logBox.style.display = 'block';
            logBox.innerHTML += `<div>> ${msg}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        }

        async startAutomation() {
            const prompt = document.getElementById('auto-prompt').value;
            if(!prompt || this.isRunning) return;

            this.isRunning = true;
            this.log("AI parsing instructions...");
            
            try {
                const systemPrompt = `You are a browser automation engine. Convert user instructions into a JSON array.
                COMMANDS: click, input, navigate, wait, waitForText, waitForDisappear, aiDecision.
                UI KEYS: ${Object.keys(UI_MAP).join(', ')}.
                If navigating to "Agent Sidebar", use {"action": "navigate", "target": "Agent Sidebar"}.`;

                const response = await window.vibeAPI.callAI(systemPrompt, prompt, true);
                let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                
                this.taskQueue = JSON.parse(cleanJson);
                this.closeModal();
                window.dispatchEvent(new CustomEvent('vibe-task-complete'));
            } catch (e) {
                this.log("Error: " + e.message);
                this.isRunning = false;
            }
        }

        async processNextTask() {
            if (this.taskQueue.length === 0) {
                this.log("Finished.");
                this.isRunning = false;
                return;
            }
            const step = this.taskQueue.shift();
            await this.performAction(step);
            window.dispatchEvent(new CustomEvent('vibe-task-complete'));
        }

        async performAction(step) {
            return new Promise(async (resolve) => {
                this.log(`${step.action}: ${step.target || step.value}`);

                // Handle Navigation
                if (step.action === 'navigate') {
                    const targetKey = step.target;
                    
                    // If it's the Agent Sidebar, just highlight it (since it's always visible)
                    if (targetKey.includes("Agent")) {
                        const el = document.querySelector(UI_MAP["Agent Sidebar"]);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                            el.classList.add('target-highlight');
                            setTimeout(() => { el.classList.remove('target-highlight'); resolve(); }, 1000);
                            return;
                        }
                    }

                    // Otherwise, try to find the tab button and click it
                    const selector = UI_MAP[targetKey];
                    const btn = document.querySelector(selector);
                    if (btn) {
                        btn.click();
                        setTimeout(resolve, 500);
                    } else {
                        resolve();
                    }
                    return;
                }

                if (step.action === 'wait') {
                    setTimeout(resolve, step.value || 1000);
                    return;
                }

                // Standard Interaction
                const selector = UI_MAP[step.target] || step.target;
                const el = document.querySelector(selector);

                if (!el) {
                    this.log(`Missing: ${step.target}`);
                    resolve();
                    return;
                }

                el.classList.add('target-highlight');

                if (step.action === 'click') {
                    el.click();
                } else if (step.action === 'input') {
                    el.value = step.value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }

                setTimeout(() => {
                    el.classList.remove('target-highlight');
                    resolve();
                }, 800);
            });
        }
    }

    // Launch
    if (document.readyState === 'complete') {
        window.vibeAutomator = new VibeAutomator();
    } else {
        window.addEventListener('load', () => window.vibeAutomator = new VibeAutomator());
    }
})();
