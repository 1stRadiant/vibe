
/**
 * Vibe Web Builder - Automation System (Auto-Pilot)
 * Integration: Adds a Floating Icon to access the AI Automation Interface.
 */

(function() {
    // 1. UI MAP: Connects human terms to the specific IDs in your index.html
    const UI_MAP = {
        // Navigation Tabs
        "Start Tab": ".tab-button[data-tab='start']",
        "Preview Tab": ".tab-button[data-tab='preview']",
        "Editor Tab": ".tab-button[data-tab='editor']",
        "Agent Tab": ".tab-button[data-tab='agent']",
        "Chat Tab": ".tab-button[data-tab='chat']",
        "Files Tab": ".tab-button[data-tab='files']",
        "Code Tab": ".tab-button[data-tab='code']",
        "Settings Tab": "#open-settings-modal-button",

        // Start Page Actions
        "Project Name Input": "#new-project-id-input",
        "Project Prompt Input": "#project-prompt-input",
        "Build Project Button": "#start-iterative-build-button", 
        "Generate From Instructions": "#generate-from-instructions-button",
        "Load GitHub Button": "#load-from-github-button",
        
        // Toolbar
        "Save Cloud": "#save-to-cloud-button",
        "Save Local": "#save-to-local-button",
        "Undo": "#undo-button",
        "Redo": "#redo-button",
        "Inspect": "#toggle-inspect-button",

        // Agent / Chat
        "Agent Input": "#agent-prompt-input",
        "Add Task": "#run-agent-single-task-button",
        "Process Queue": "#start-iterative-session-button",
        "Chat Input": "#chat-prompt-input",
        "Send Chat": "#send-chat-button",

        // Code Area
        "Upload HTML": "#upload-html-button",
        "Update From Code": "#update-tree-from-code-button",
        
        // Modals
        "Close Modal": ".close-button",
        "Login Button": "#login-button"
    };

    class VibeAutomator {
        constructor() {
            this.isRunning = false;
            this.delay = 1000; // ms delay between actions
            this.injectUI();
        }

        // Injects the Floating Icon and Modal
        injectUI() {
            const styles = document.createElement('style');
            styles.textContent = `
                /* Floating Action Button */
                #auto-pilot-btn { 
                    position: fixed; 
                    bottom: 25px; 
                    right: 25px; 
                    width: 60px; 
                    height: 60px; 
                    border-radius: 50%; 
                    background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); 
                    color: white; 
                    border: none; 
                    cursor: pointer; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4); 
                    z-index: 9999; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 28px; 
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
                }
                #auto-pilot-btn:hover { 
                    transform: scale(1.1) rotate(5deg); 
                    box-shadow: 0 8px 25px rgba(74, 0, 224, 0.6); 
                }
                #auto-pilot-btn::after {
                    content: 'Auto-Pilot';
                    position: absolute;
                    right: 70px;
                    background: #333;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                }
                #auto-pilot-btn:hover::after {
                    opacity: 1;
                }

                /* Modal & Overlay */
                #auto-modal { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; background: #1a1d21; border: 1px solid #333; border-radius: 12px; z-index: 10000; box-shadow: 0 20px 50px rgba(0,0,0,0.7); padding: 25px; color: #e0e0e0; font-family: 'Inter', sans-serif; }
                #auto-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; backdrop-filter: blur(2px); }
                
                /* Modal Inputs */
                .auto-input { width: 100%; padding: 12px; margin: 15px 0; background: #0f1115; border: 1px solid #444; color: white; border-radius: 6px; resize: vertical; font-size: 14px; }
                .auto-input:focus { outline: 1px solid #8E2DE2; border-color: #8E2DE2; }
                
                /* Buttons */
                .auto-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
                .auto-btn { padding: 8px 20px; border-radius: 6px; cursor: pointer; border: none; font-weight: 600; transition: background 0.2s; }
                .auto-btn-run { background: #4A00E0; color: white; }
                .auto-btn-run:hover { background: #5d1be8; }
                .auto-btn-close { background: #333; color: #ccc; }
                .auto-btn-close:hover { background: #444; }
                
                /* Logs */
                .auto-log-box { max-height: 150px; overflow-y: auto; background: #000; border: 1px solid #333; padding: 10px; font-family: monospace; font-size: 12px; color: #00ff00; margin-top: 10px; border-radius: 4px; display: none; }
                
                /* Highlights */
                .target-highlight { outline: 4px solid #d946ef !important; outline-offset: 2px; transition: all 0.3s; box-shadow: 0 0 20px rgba(217, 70, 239, 0.6); }
            `;
            document.head.appendChild(styles);

            // Floating Button
            const btn = document.createElement('button');
            btn.id = 'auto-pilot-btn';
            // Using Bootstrap Icon class if available, else emoji fallback
            btn.innerHTML = '<i class="bi bi-robot"></i>'; 
            btn.onclick = () => this.openModal();
            document.body.appendChild(btn);

            // Modal Structures
            const overlay = document.createElement('div');
            overlay.id = 'auto-overlay';
            
            const modal = document.createElement('div');
            modal.id = 'auto-modal';
            modal.innerHTML = `
                <h3 style="margin-top:0; display:flex; align-items:center; gap:10px; color: #fff;">
                    <i class="bi bi-robot" style="color: #8E2DE2;"></i> Auto-Pilot
                </h3>
                <p style="color:#aaa; font-size: 0.9em;">Describe a sequence of actions. The AI will navigate tabs, fill inputs, and click buttons for you.</p>
                <textarea id="auto-prompt" class="auto-input" rows="3" placeholder="e.g. 'Create a project named Shop, set storage to local, and click Build.'"></textarea>
                <div id="auto-logs" class="auto-log-box"></div>
                <div class="auto-actions">
                    <button id="auto-close-btn" class="auto-btn auto-btn-close">Close</button>
                    <button id="auto-run-btn" class="auto-btn auto-btn-run"><i class="bi bi-play-fill"></i> Run</button>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            // Event Listeners
            document.getElementById('auto-close-btn').onclick = () => this.closeModal();
            overlay.onclick = () => this.closeModal();
            document.getElementById('auto-run-btn').onclick = () => this.executeCommand();
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

        async executeCommand() {
            const prompt = document.getElementById('auto-prompt').value;
            if(!prompt) return;

            if (!window.vibeAPI || !window.vibeAPI.callAI) {
                this.log("Error: vibeAPI not found in app3.js");
                return;
            }

            this.log("Analyzing request...");
            document.getElementById('auto-run-btn').disabled = true;
            document.getElementById('auto-run-btn').innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            try {
                const systemPrompt = `You are a browser automation assistant. Convert user instructions into a JSON execution script.
                
                COMMANDS:
                - { "action": "click", "target": "UI_MAP_KEY" }
                - { "action": "input", "target": "UI_MAP_KEY", "value": "text" }
                - { "action": "navigate", "target": "tab_id" } (tab_ids: start, preview, editor, agent, chat, files, code)
                - { "action": "wait", "value": 1000 }

                UI KEYS: ${Object.keys(UI_MAP).join(', ')}

                EXAMPLE: "Go to agent tab and ask 'Fix bugs'"
                RESULT: [{"action":"navigate","target":"agent"}, {"action":"input","target":"Agent Input","value":"Fix bugs"}, {"action":"click","target":"Add Task"}]
                
                Output strictly valid JSON array.`;

                const response = await window.vibeAPI.callAI(systemPrompt, prompt, true);
                let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                const script = JSON.parse(cleanJson);

                this.log(`Executing ${script.length} steps...`);
                this.closeModal();
                
                for(let step of script) {
                    await this.performStep(step);
                }
                
                document.getElementById('auto-prompt').value = '';
                document.getElementById('auto-logs').innerHTML = '';
                
            } catch (e) {
                console.error(e);
                this.log("Error: " + e.message);
                alert("Automation Error: " + e.message);
            } finally {
                document.getElementById('auto-run-btn').disabled = false;
                document.getElementById('auto-run-btn').innerHTML = '<i class="bi bi-play-fill"></i> Run';
            }
        }

        async performStep(step) {
            if (step.action === 'wait') {
                await new Promise(r => setTimeout(r, step.value || 1000));
                return;
            }

            if (step.action === 'navigate') {
                if(window.vibeAPI.switchToTab) {
                    window.vibeAPI.switchToTab(step.target);
                    await new Promise(r => setTimeout(r, 600)); 
                }
                return;
            }

            let selector = UI_MAP[step.target] || step.target;
            const el = document.querySelector(selector);
            
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('target-highlight');
                await new Promise(r => setTimeout(r, 600)); // Visual cue time

                if (step.action === 'click') {
                    el.click();
                } else if (step.action === 'input') {
                    el.value = step.value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }

                el.classList.remove('target-highlight');
                await new Promise(r => setTimeout(r, this.delay));
            } else {
                console.warn("Auto-Pilot couldn't find:", step.target);
            }
        }
    }

    window.addEventListener('load', () => {
        setTimeout(() => new VibeAutomator(), 1000);
    });

})();
