

/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * Event-Driven Sequential Execution
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
        "Login Button": "#login-button"
    };

    class VibeAutomator {
        constructor() {
            this.taskQueue = [];
            this.isRunning = false;
            this.injectUI();
            
            // Listen for internal "step-complete" event to drive the sequence
            window.addEventListener('vibe-task-complete', () => this.processNextTask());
        }

        injectUI() {
            const styles = document.createElement('style');
            styles.textContent = `
                #auto-pilot-btn { position: fixed; bottom: 25px; right: 25px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4); z-index: 9999; display: flex; align-items: center; justify-content: center; font-size: 28px; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                #auto-pilot-btn:hover { transform: scale(1.1) rotate(5deg); }
                #auto-modal { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; background: #1a1d21; border: 1px solid #333; border-radius: 12px; z-index: 10000; box-shadow: 0 20px 50px rgba(0,0,0,0.7); padding: 25px; color: #e0e0e0; font-family: 'Inter', sans-serif; }
                #auto-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; backdrop-filter: blur(2px); }
                .auto-input { width: 100%; padding: 12px; margin: 15px 0; background: #0f1115; border: 1px solid #444; color: white; border-radius: 6px; resize: vertical; }
                .auto-actions { display: flex; justify-content: flex-end; gap: 10px; }
                .auto-btn { padding: 8px 20px; border-radius: 6px; cursor: pointer; border: none; font-weight: 600; }
                .auto-btn-run { background: #4A00E0; color: white; }
                .auto-log-box { max-height: 150px; overflow-y: auto; background: #000; border: 1px solid #333; padding: 10px; font-family: monospace; font-size: 12px; color: #00ff00; margin-top: 10px; border-radius: 4px; display: none; }
                .target-highlight { outline: 4px solid #d946ef !important; outline-offset: 2px; transition: all 0.3s; box-shadow: 0 0 20px rgba(217, 70, 239, 0.6); z-index: 10001; }
            `;
            document.head.appendChild(styles);

            const btn = document.createElement('button');
            btn.id = 'auto-pilot-btn';
            btn.innerHTML = '🤖'; 
            btn.onclick = () => this.openModal();
            document.body.appendChild(btn);

            const overlay = document.createElement('div');
            overlay.id = 'auto-overlay';
            const modal = document.createElement('div');
            modal.id = 'auto-modal';
            modal.innerHTML = `
                <h3 style="margin-top:0;">🤖 Auto-Pilot</h3>
                <textarea id="auto-prompt" class="auto-input" rows="3" placeholder="e.g. 'Go to agent, type Hello, click Add Task'"></textarea>
                <div id="auto-logs" class="auto-log-box"></div>
                <div class="auto-actions">
                    <button id="auto-close-btn" class="auto-btn" style="background:#333; color:white;">Close</button>
                    <button id="auto-run-btn" class="auto-btn auto-btn-run">Run Sequence</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            document.getElementById('auto-close-btn').onclick = () => this.closeModal();
            document.getElementById('auto-run-btn').onclick = () => this.startAutomation();
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
            const entry = document.createElement('div');
            entry.textContent = `> ${msg}`;
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        }

        async startAutomation() {
            const prompt = document.getElementById('auto-prompt').value;
            if(!prompt || this.isRunning) return;

            this.log("Consulting AI for sequence steps...");
            
            try {
                const systemPrompt = `You are an automation engine. Convert instruction to JSON array.
                COMMANDS: click, input (requires value), navigate (to start, preview, editor, agent, chat, files, code), wait (ms).
                UI KEYS: ${Object.keys(UI_MAP).join(', ')}.
                Example: [{"action":"navigate","target":"agent"},{"action":"input","target":"Agent Input","value":"Test"}]`;

                const response = await window.vibeAPI.callAI(systemPrompt, prompt, true);
                let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                
                this.taskQueue = JSON.parse(cleanJson);
                this.isRunning = true;
                this.closeModal();
                
                // Kick off the event-driven chain
                window.dispatchEvent(new CustomEvent('vibe-task-complete'));
            } catch (e) {
                this.log("Error parsing script: " + e.message);
                this.isRunning = false;
            }
        }

        async processNextTask() {
            if (this.taskQueue.length === 0) {
                this.log("Sequence complete.");
                this.isRunning = false;
                return;
            }

            const step = this.taskQueue.shift();
            this.log(`Executing: ${step.action} on ${step.target || 'delay'}`);

            try {
                await this.performAction(step);
                // Dispatch event to trigger the next item in the queue
                window.dispatchEvent(new CustomEvent('vibe-task-complete'));
            } catch (err) {
                console.error("Task failed", err);
                this.isRunning = false;
            }
        }

        async performAction(step) {
            return new Promise(async (resolve) => {
                if (step.action === 'wait') {
                    setTimeout(resolve, step.value || 1000);
                    return;
                }

                if (step.action === 'navigate') {
                    if (window.vibeAPI.switchToTab) {
                        window.vibeAPI.switchToTab(step.target);
                        setTimeout(resolve, 800); // Wait for DOM swap
                    }
                    return;
                }

                const selector = UI_MAP[step.target] || step.target;
                const el = document.querySelector(selector);

                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('target-highlight');

                    // Visual pause so the user sees what's happening
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
                        }, 500);
                    }, 600);
                } else {
                    this.log(`Element not found: ${step.target}`);
                    resolve(); // Continue anyway to prevent hanging
                }
            });
        }
    }

    window.addEventListener('load', () => {
        setTimeout(() => { window.vibeAutomator = new VibeAutomator(); }, 1000);
    });
})();
 sequences if the button is clicked multiple times.