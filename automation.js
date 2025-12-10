
// --- Expose for Automation System ---
window.vibeAPI = {
    // Expose the AI caller so automation can generate scripts using your API keys
    callAI: callAI, 
    // Expose tab switching
    switchToTab: switchToTab,
    // Expose internals for state checks
    getCurrentProject: () => ({ id: currentProjectId, tree: vibeTree }),
    refreshUI: refreshAllUI
};

console.log("Vibe Automation API exposed as window.vibeAPI");
```

### Step 2: Create `automation.js`

Save this code as `automation.js`. This system includes a UI Map (mapping human names to DOM IDs), an Execution Engine (simulates clicks/typing), and an AI Prompt generator.

```javascript
/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * Allows natural language control of the editor interface.
 */

(function() {
    // --- 1. The UI Map ---
    // Maps logical names to CSS selectors so the AI knows how to interact with the DOM.
    const UI_MAP = {
        // Tabs
        "Start Tab": ".tab-button[data-tab='start']",
        "Preview Tab": ".tab-button[data-tab='preview']",
        "Code Tab": ".tab-button[data-tab='code']",
        "Agent Tab": ".tab-button[data-tab='agent']",
        "Files Tab": ".tab-button[data-tab='files']",
        "Settings Tab": "#open-settings-modal-button",

        // Start Page
        "Project Prompt Input": "#project-prompt-input",
        "Generate Project Button": "#generate-project-button",
        "New Project ID Input": "#new-project-id-input",
        "Cloud Storage Option": "button[data-storage='cloud']",
        "Local Storage Option": "button[data-storage='local']",
        "Load Project Button": ".load-project-button", // Gets the first one usually

        // Toolbar / Main Actions
        "Save Cloud": "#save-to-cloud-button",
        "Save Local": "#save-to-local-button",
        "Share Project": "#share-project-button",
        "Undo": "#undo-button",
        "Redo": "#redo-button",
        "Toggle Inspect": "#toggle-inspect-button",

        // Agent / Chat
        "Agent Input": "#agent-prompt-input",
        "Add Task Button": "#run-agent-single-task-button",
        "Start Queue": "#start-iterative-session-button",
        "Chat Input": "#chat-prompt-input",
        "Send Chat": "#send-chat-button",

        // Code / Editor
        "Full Code Editor": "#full-code-editor",
        "Update From Code": "#update-tree-from-code-button",
        "Upload HTML": "#upload-html-button",
        
        // Modals & Popups
        "Auth Modal": "#auth-modal",
        "Login Button": "#login-button",
        "Close Modal": ".close-button",
        "Add Node Modal": "#add-node-modal",
        "Create Node Confirm": "#create-node-button"
    };

    class VibeAutomator {
        constructor() {
            this.isRunning = false;
            this.delay = 800; // ms between actions for visual clarity
            this.injectUI();
        }

        /**
         * Injects the Auto-Pilot button and modal into the DOM.
         */
        injectUI() {
            const styles = document.createElement('style');
            styles.textContent = `
                #automation-trigger { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #9c27b0; color: white; border: none; padding: 12px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s; }
                #automation-trigger:hover { transform: scale(1.05); }
                #automation-modal { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; background: #282c34; border: 1px solid #444; border-radius: 8px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); padding: 20px; color: #abb2bf; font-family: sans-serif; }
                #automation-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; }
                .auto-input { width: 100%; padding: 10px; margin: 10px 0; background: #1e2227; border: 1px solid #444; color: white; border-radius: 4px; }
                .auto-btn { background: #9c27b0; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; float: right; margin-left: 10px; }
                .auto-btn.cancel { background: #e06c75; }
                .auto-highlight { outline: 3px solid #ff00ff !important; outline-offset: 2px; transition: all 0.3s; box-shadow: 0 0 15px #ff00ff; }
                #automation-logs { max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 10px; padding: 5px; background: #000; color: #0f0; border-radius: 4px; }
            `;
            document.head.appendChild(styles);

            // Trigger Button
            const btn = document.createElement('button');
            btn.id = 'automation-trigger';
            btn.innerHTML = '🤖 Auto-Pilot';
            btn.onclick = () => this.openModal();
            document.body.appendChild(btn);

            // Overlay
            const overlay = document.createElement('div');
            overlay.id = 'automation-overlay';
            document.body.appendChild(overlay);

            // Modal
            const modal = document.createElement('div');
            modal.id = 'automation-modal';
            modal.innerHTML = `
                <h3 style="margin-top:0">🤖 Vibe Auto-Pilot</h3>
                <p>Describe what you want to do (e.g., "Create a project named 'My Portfolio', generate it, then go to the preview tab").</p>
                <textarea id="auto-prompt" class="auto-input" rows="4" placeholder="Enter instructions..."></textarea>
                <div id="automation-logs">Logs will appear here...</div>
                <div style="margin-top: 15px; overflow: hidden;">
                    <button id="auto-run-btn" class="auto-btn">Run</button>
                    <button id="auto-close-btn" class="auto-btn cancel">Close</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('auto-close-btn').onclick = () => this.closeModal();
            document.getElementById('auto-run-btn').onclick = () => this.handleRun();
            overlay.onclick = () => this.closeModal();
        }

        openModal() {
            document.getElementById('automation-modal').style.display = 'block';
            document.getElementById('automation-overlay').style.display = 'block';
            document.getElementById('auto-prompt').focus();
        }

        closeModal() {
            document.getElementById('automation-modal').style.display = 'none';
            document.getElementById('automation-overlay').style.display = 'none';
        }

        log(msg) {
            const el = document.getElementById('automation-logs');
            const line = document.createElement('div');
            line.textContent = `> ${msg}`;
            el.appendChild(line);
            el.scrollTop = el.scrollHeight;
            console.log(`[Auto-Pilot] ${msg}`);
        }

        /**
         * Highlights an element visually to show the user what's happening.
         */
        highlightElement(element) {
            element.classList.add('auto-highlight');
            setTimeout(() => element.classList.remove('auto-highlight'), this.delay);
        }

        /**
         * The core function that uses AI to convert text to a script.
         */
        async handleRun() {
            if (this.isRunning) return;
            const prompt = document.getElementById('auto-prompt').value.trim();
            if (!prompt) return;

            if (!window.vibeAPI || !window.vibeAPI.callAI) {
                this.log("Error: Vibe API not found. Please update app.js.");
                return;
            }

            this.isRunning = true;
            document.getElementById('auto-run-btn').disabled = true;
            this.log("Generating automation script...");

            try {
                const systemPrompt = `You are an automation interface for a web application. 
                Translate the user's natural language request into a JSON array of automation commands.
                
                **AVAILABLE COMMANDS:**
                1. { "action": "click", "target": "Name from UI Map" } -> Clicks a button or tab.
                2. { "action": "input", "target": "Name from UI Map", "value": "string" } -> Types into an input field.
                3. { "action": "wait", "value": 2000 } -> Waits for X milliseconds (use for loading).
                4. { "action": "navigate", "target": "tab_id" } -> "start", "preview", "code", "agent".

                **UI MAP (Use these keys for 'target'):**
                ${Object.keys(UI_MAP).join(', ')}

                **EXAMPLE:**
                User: "Make a new project called 'Demo' and save it."
                Output:
                [
                    { "action": "navigate", "target": "start" },
                    { "action": "input", "target": "New Project ID Input", "value": "demo-project" },
                    { "action": "input", "target": "Project Prompt Input", "value": "A demo project" },
                    { "action": "click", "target": "Generate Project Button" },
                    { "action": "wait", "value": 3000 },
                    { "action": "click", "target": "Save Cloud" }
                ]

                **OUTPUT RULE:** Return ONLY the valid JSON array. No markdown.`;

                const response = await window.vibeAPI.callAI(systemPrompt, prompt, true);
                let script = [];
                try {
                    // Clean potential markdown wrappers
                    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                    script = JSON.parse(cleanJson);
                } catch (e) {
                    throw new Error("AI returned invalid JSON.");
                }

                this.log(`Script generated: ${script.length} steps.`);
                await this.executeScript(script);

            } catch (error) {
                this.log(`Error: ${error.message}`);
            } finally {
                this.isRunning = false;
                document.getElementById('auto-run-btn').disabled = false;
            }
        }

        async executeScript(script) {
            this.closeModal(); // Hide modal to see action
            
            for (const step of script) {
                try {
                    await this.performAction(step);
                    // Global delay between steps
                    await new Promise(r => setTimeout(r, this.delay)); 
                } catch (e) {
                    console.error("Step failed:", step, e);
                    alert(`Auto-Pilot Error on step: ${step.action} - ${step.target}`);
                    break;
                }
            }
            alert("Automation Sequence Complete.");
        }

        async performAction(step) {
            console.log("Executing:", step);

            if (step.action === 'wait') {
                await new Promise(r => setTimeout(r, step.value));
                return;
            }

            if (step.action === 'navigate') {
                if (window.vibeAPI.switchToTab) {
                    window.vibeAPI.switchToTab(step.target);
                }
                return;
            }

            // For click and input, we need to find the DOM element
            let selector = UI_MAP[step.target];
            if (!selector) {
                // Fallback: assume the target IS a selector if not in map
                selector = step.target;
            }

            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Element not found: ${step.target} (${selector})`);
            }

            this.highlightElement(element);

            if (step.action === 'click') {
                element.click();
            } else if (step.action === 'input') {
                element.value = step.value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
        // Wait a moment for main app to load
        setTimeout(() => {
            window.vibeAutomator = new VibeAutomator();
            console.log("Vibe Auto-Pilot Initialized.");
        }, 1000);
    });

})();
