/**
 * VIBE NEURAL FLOW — Nervous System Visualizer
 * Renders the vibe tree as an animated neural graph.
 * Nodes pulse when healthy; glow red and ring-animate on error.
 * Click any node → opens AI repair modal.
 */

// ─── Styles ────────────────────────────────────────────────────────────────
const NS_STYLES = `
:root {
  --ns-bg: #0d0f14;
  --ns-grid: rgba(255,255,255,0.03);
  --ns-container: #4fc3f7;
  --ns-html:      #81c784;
  --ns-css:       #ce93d8;
  --ns-js:        #ffb74d;
  --ns-head:      #4dd0e1;
  --ns-raw:       #90a4ae;
  --ns-error:     #ef5350;
  --ns-conn:      rgba(255,255,255,0.1);
  --ns-conn-active: rgba(100,200,255,0.45);
  --ns-glow-r:    2.5;
}

.nervous-system-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: var(--ns-bg);
  padding: 0;
  font-family: 'Roboto Mono', monospace;
}

.ns-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.ns-title-group h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(90deg, #4fc3f7, #ce93d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ns-title-group p {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.38);
}

.ns-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ns-btn {
  font-size: 0.75rem !important;
  padding: 5px 12px !important;
  border-radius: 4px !important;
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  color: rgba(255,255,255,0.75) !important;
  cursor: pointer;
  transition: all 0.2s;
}
.ns-btn:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }

.ns-status-badge {
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: 'Roboto Mono', monospace;
  transition: all 0.4s;
}
.ns-status-badge.healthy {
  background: rgba(129,199,132,0.12);
  border: 1px solid rgba(129,199,132,0.35);
  color: #81c784;
}
.ns-status-badge.error {
  background: rgba(239,83,80,0.15);
  border: 1px solid rgba(239,83,80,0.5);
  color: #ef9a9a;
  animation: ns-badge-pulse 1s ease-in-out infinite;
}
@keyframes ns-badge-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,83,80,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(239,83,80,0); }
}

#ns-canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
}
#ns-canvas-wrapper:active { cursor: grabbing; }
#ns-canvas { width:100%; height:100%; display:block; }

.ns-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(13,15,20,0.95);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 8px;
  padding: 9px 13px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.85);
  max-width: 240px;
  line-height: 1.6;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);
  z-index: 9999;
  transition: opacity 0.15s;
}
.ns-tooltip .tt-id   { font-weight: 700; color: #fff; margin-bottom: 2px; }
.ns-tooltip .tt-type { opacity: 0.6; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.65rem; }
.ns-tooltip .tt-err  { color: #ef9a9a; margin-top: 5px; border-top: 1px solid rgba(239,83,80,0.3); padding-top: 5px; }
.ns-tooltip .tt-hint { color: rgba(100,200,255,0.7); margin-top:4px; font-size: 0.65rem; }

.ns-legend {
  display: flex;
  gap: 18px;
  padding: 8px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.ns-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.45);
  font-family: 'Roboto Mono', monospace;
}
.ns-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.container-dot { background: var(--ns-container); }
.html-dot      { background: var(--ns-html); }
.css-dot       { background: var(--ns-css); }
.js-dot        { background: var(--ns-js); }
.head-dot      { background: var(--ns-head); }
.error-dot     { background: var(--ns-error); }

/* AI Fix Modal Overrides */
.ns-modal-content {
  max-width: 540px !important;
  border: 1px solid rgba(239,83,80,0.3) !important;
  box-shadow: 0 0 40px rgba(239,83,80,0.15) !important;
}
.ns-node-info-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.78rem;
  background: rgba(79,195,247,0.1);
  border: 1px solid rgba(79,195,247,0.3);
  color: #4fc3f7;
  margin-bottom: 12px;
}
.ns-error-preview {
  background: rgba(239,83,80,0.08);
  border: 1px solid rgba(239,83,80,0.25);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.72rem;
  color: #ef9a9a;
  margin-top: 10px;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
}

/* Nervous system indicator in sidebar */
#nervous-system-error-indicator {
  position: absolute;
  top: 8px; right: 8px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--ns-error);
  display: none;
  animation: ns-badge-pulse 1s ease-in-out infinite;
}
`;

// ─── Constants ─────────────────────────────────────────────────────────────
const NODE_COLORS = {
  container: '#4fc3f7',
  html:      '#81c784',
  css:       '#ce93d8',
  javascript:'#ffb74d',
  'js-function': '#ffcc80',
  declaration:   '#ffcc80',
  head:      '#4dd0e1',
  'raw-html-container': '#90a4ae',
  default:   '#78909c',
};

const NODE_RADIUS = {
  container: 18,
  html:      14,
  css:       12,
  javascript: 13,
  'js-function': 11,
  declaration: 11,
  head:      12,
  'raw-html-container': 20,
  default:   11,
};

// ─── State ──────────────────────────────────────────────────────────────────
let nsNodes   = [];
let nsEdges   = [];
let nsErrors  = {}; // nodeId → error message
let nsAnimId  = null;
let nsPulse   = true;
let nsTick    = 0;

// Pan/zoom
let nsOffsetX = 0, nsOffsetY = 0;
let nsScale   = 1;
let nsDragging = false;
let nsDragStart = { x:0, y:0 };

// Canvas
let nsCanvas  = null;
let nsCtx     = null;

// ─── Init ───────────────────────────────────────────────────────────────────
export function initNervousSystem(vibeTreeGetter, callAIFn, applyActionsFn) {
  injectStyles();

  nsCanvas = document.getElementById('ns-canvas');
  if (!nsCanvas) return;
  nsCtx = nsCanvas.getContext('2d');

  setupCanvasEvents();
  setupModalEvents(vibeTreeGetter, callAIFn, applyActionsFn);

  window.addEventListener('resize', resizeCanvas);

  document.getElementById('ns-refresh-button')?.addEventListener('click', () => {
    buildGraph(vibeTreeGetter());
  });

  document.getElementById('ns-toggle-pulse-button')?.addEventListener('click', (e) => {
    nsPulse = !nsPulse;
    e.currentTarget.style.opacity = nsPulse ? '1' : '0.4';
  });

  resizeCanvas();
  buildGraph(vibeTreeGetter());
  startLoop();
}

// Called externally when vibeTree changes
export function refreshNervousSystem(vibeTree, errors = {}) {
  nsErrors = errors;
  buildGraph(vibeTree);
  updateStatusBadge();
}

// Called externally when an iframe error fires
export function reportNervousSystemError(nodeId, message) {
  if (nodeId) {
    nsErrors[nodeId] = message;
  } else {
    // Try to attribute to most recent JS node
    const jsNode = nsNodes.find(n => n.type === 'javascript' || n.type === 'js-function');
    if (jsNode) nsErrors[jsNode.id] = message;
  }
  updateStatusBadge();
}

export function clearNervousSystemErrors() {
  nsErrors = {};
  updateStatusBadge();
}

// ─── Graph Builder ──────────────────────────────────────────────────────────
function buildGraph(tree) {
  if (!tree || !tree.id) return;

  nsNodes = [];
  nsEdges = [];

  // Flatten tree into nodes + edges using radial layout
  const centerX = (nsCanvas?.width  || 800) / 2;
  const centerY = (nsCanvas?.height || 600) / 2;

  layoutTree(tree, null, centerX, centerY, 0, Math.PI * 2, 0);

  // Reset pan so root is centered
  nsOffsetX = 0;
  nsOffsetY = 0;
}

function layoutTree(node, parentId, cx, cy, angleStart, angleEnd, depth) {
  const r = 140 + depth * 80;
  const midAngle = (angleStart + angleEnd) / 2;

  let x = cx, y = cy;
  if (depth > 0) {
    x = cx + r * Math.cos(midAngle);
    y = cy + r * Math.sin(midAngle);
  }

  // Check if node already placed (avoid duplicates in huge trees)
  if (nsNodes.find(n => n.id === node.id)) return;

  nsNodes.push({
    id: node.id,
    type: node.type || 'default',
    description: node.description || '',
    x, y,
    vx: 0, vy: 0,
    radius: NODE_RADIUS[node.type] || NODE_RADIUS.default,
    color: NODE_COLORS[node.type] || NODE_COLORS.default,
    depth,
    pulsePhase: Math.random() * Math.PI * 2,
  });

  if (parentId) {
    nsEdges.push({ from: parentId, to: node.id });
  }

  const children = node.children || [];
  if (children.length > 0) {
    const span = (angleEnd - angleStart);
    const slice = span / children.length;
    children.forEach((child, i) => {
      layoutTree(
        child, node.id, cx, cy,
        angleStart + i * slice,
        angleStart + (i + 1) * slice,
        depth + 1
      );
    });
  }
}

// ─── Canvas Setup ──────────────────────────────────────────────────────────
function resizeCanvas() {
  if (!nsCanvas) return;
  const wrapper = nsCanvas.parentElement;
  if (!wrapper) return;
  nsCanvas.width  = wrapper.clientWidth;
  nsCanvas.height = wrapper.clientHeight;
}

// ─── Animation Loop ────────────────────────────────────────────────────────
function startLoop() {
  if (nsAnimId) cancelAnimationFrame(nsAnimId);
  const loop = () => {
    nsTick++;
    drawFrame();
    nsAnimId = requestAnimationFrame(loop);
  };
  nsAnimId = requestAnimationFrame(loop);
}

function drawFrame() {
  if (!nsCtx || !nsCanvas) return;
  const W = nsCanvas.width, H = nsCanvas.height;
  const ctx = nsCtx;

  // Background
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, W, H);

  // Grid
  drawGrid(ctx, W, H);

  ctx.save();
  ctx.translate(W/2 + nsOffsetX, H/2 + nsOffsetY);
  ctx.scale(nsScale, nsScale);

  // Edges
  drawEdges(ctx);

  // Nodes
  for (const node of nsNodes) {
    drawNode(ctx, node);
  }

  ctx.restore();
}

function drawGrid(ctx, W, H) {
  const spacing = 40 * nsScale;
  const ox = (W/2 + nsOffsetX) % spacing;
  const oy = (H/2 + nsOffsetY) % spacing;
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ox; x < W; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = oy; y < H; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

function drawEdges(ctx) {
  for (const edge of nsEdges) {
    const fromNode = nsNodes.find(n => n.id === edge.from);
    const toNode   = nsNodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const hasError = nsErrors[edge.from] || nsErrors[edge.to];

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);

    // Bezier for organic feel
    const mx = (fromNode.x + toNode.x) / 2;
    const my = (fromNode.y + toNode.y) / 2;
    ctx.quadraticCurveTo(mx, my - 20, toNode.x, toNode.y);

    if (hasError) {
      const t = (Math.sin(nsTick * 0.06) + 1) / 2;
      ctx.strokeStyle = `rgba(239,83,80,${0.2 + t * 0.5})`;
      ctx.lineWidth = 1.5;
    } else {
      // Signal pulse along edge
      const alpha = nsPulse ? (0.08 + 0.05 * Math.sin(nsTick * 0.04 + edge.from.length)) : 0.1;
      ctx.strokeStyle = `rgba(100,200,255,${alpha})`;
      ctx.lineWidth = 1;
    }
    ctx.stroke();

    // Animated signal dot
    if (nsPulse && !hasError) {
      const t = ((nsTick * 0.015 + edge.from.length * 0.3) % 1);
      const px = fromNode.x + (toNode.x - fromNode.x) * t;
      const py = fromNode.y + (toNode.y - fromNode.y) * t;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,200,255,0.6)';
      ctx.fill();
    }
  }
}

function drawNode(ctx, node) {
  const r  = node.radius;
  const err = nsErrors[node.id];

  // Error ring
  if (err) {
    const ringR = r + 6 + 4 * Math.sin(nsTick * 0.08 + node.pulsePhase);
    ctx.beginPath();
    ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(239,83,80,${0.4 + 0.3 * Math.sin(nsTick * 0.1)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Glow
  const glowColor = err ? 'rgba(239,83,80,' : `rgba(${hexToRgb(node.color)},`;
  const glowR  = r * 2.5;
  const grd = ctx.createRadialGradient(node.x, node.y, r * 0.2, node.x, node.y, glowR);
  const alpha = nsPulse
    ? 0.12 + 0.08 * Math.sin(nsTick * 0.05 + node.pulsePhase)
    : 0.1;
  grd.addColorStop(0, glowColor + alpha + ')');
  grd.addColorStop(1, glowColor + '0)');
  ctx.beginPath();
  ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Node body
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  const bodyColor = err ? '#ef5350' : node.color;
  ctx.fillStyle = hexWithAlpha(bodyColor, 0.18);
  ctx.fill();
  ctx.strokeStyle = err ? '#ef5350' : node.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(node.x, node.y, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = hexWithAlpha(bodyColor, 0.7);
  ctx.fill();

  // Label
  const label = node.id.length > 16 ? node.id.slice(0, 14) + '…' : node.id;
  ctx.font = `${r < 13 ? 8 : 9}px 'Roboto Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(label, node.x, node.y + r + 12);

  // Error marker
  if (err) {
    ctx.font = '11px sans-serif';
    ctx.fillText('⚠', node.x, node.y - r - 5);
  }
}

// ─── Interaction ────────────────────────────────────────────────────────────
function setupCanvasEvents() {
  if (!nsCanvas) return;

  nsCanvas.addEventListener('mousedown', e => {
    nsDragging = true;
    nsDragStart = { x: e.clientX - nsOffsetX, y: e.clientY - nsOffsetY };
  });

  nsCanvas.addEventListener('mousemove', e => {
    if (nsDragging) {
      nsOffsetX = e.clientX - nsDragStart.x;
      nsOffsetY = e.clientY - nsDragStart.y;
      return;
    }

    const node = getNodeAtMouse(e);
    const tooltip = document.getElementById('ns-tooltip');
    if (!tooltip) return;

    if (node) {
      nsCanvas.style.cursor = 'pointer';
      const err = nsErrors[node.id];
      tooltip.style.display = 'block';
      tooltip.style.left = (e.offsetX + 16) + 'px';
      tooltip.style.top  = (e.offsetY + 8) + 'px';
      tooltip.innerHTML = `
        <div class="tt-id">${node.id}</div>
        <div class="tt-type">${node.type}</div>
        ${node.description ? `<div style="margin-top:3px;opacity:0.6;font-size:0.65rem">${node.description.slice(0,80)}</div>` : ''}
        ${err ? `<div class="tt-err">⚠ ${err.slice(0,120)}</div>` : ''}
        <div class="tt-hint">🖱 Click to AI-edit</div>
      `;
    } else {
      nsCanvas.style.cursor = 'grab';
      tooltip.style.display = 'none';
    }
  });

  nsCanvas.addEventListener('mouseup',   () => { nsDragging = false; });
  nsCanvas.addEventListener('mouseleave',() => {
    nsDragging = false;
    const tooltip = document.getElementById('ns-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  });

  nsCanvas.addEventListener('click', e => {
    if (Math.abs(e.clientX - (nsDragStart.x + nsOffsetX)) > 5) return; // was a drag
    const node = getNodeAtMouse(e);
    if (node) openNsFixModal(node);
  });

  nsCanvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    nsScale = Math.max(0.2, Math.min(4, nsScale * delta));
  }, { passive: false });
}

function getNodeAtMouse(e) {
  const rect = nsCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - nsCanvas.width/2  - nsOffsetX) / nsScale;
  const my = (e.clientY - rect.top  - nsCanvas.height/2 - nsOffsetY) / nsScale;
  for (const node of nsNodes) {
    const dx = node.x - mx, dy = node.y - my;
    if (Math.sqrt(dx*dx + dy*dy) <= node.radius + 5) return node;
  }
  return null;
}

// ─── AI Fix Modal ──────────────────────────────────────────────────────────
let _callAI = null, _applyActions = null, _getTree = null;

function setupModalEvents(vibeTreeGetter, callAIFn, applyActionsFn) {
  _callAI = callAIFn;
  _applyActions = applyActionsFn;
  _getTree = vibeTreeGetter;

  document.getElementById('ns-fix-modal-close')?.addEventListener('click', closeNsFixModal);
  document.getElementById('ns-ai-fix-modal')?.addEventListener('click', e => {
    if (e.target.id === 'ns-ai-fix-modal') closeNsFixModal();
  });

  document.getElementById('ns-fix-execute-button')?.addEventListener('click', executeNsFix);
}

function openNsFixModal(node) {
  const modal = document.getElementById('ns-ai-fix-modal');
  if (!modal) return;

  document.getElementById('ns-fix-node-id').value = node.id;
  document.getElementById('ns-fix-modal-title').textContent = nsErrors[node.id]
    ? '🔴 Neural Repair — Error Detected'
    : '🧠 Neural Edit';

  const badge = document.getElementById('ns-fix-node-info');
  if (badge) badge.textContent = `Node: ${node.id}  ·  Type: ${node.type}`;

  const errPreview = document.getElementById('ns-fix-error-preview');
  if (nsErrors[node.id]) {
    errPreview.style.display = 'block';
    errPreview.textContent   = '⚠ ' + nsErrors[node.id];
    document.getElementById('ns-fix-prompt-input').value =
      `Fix the error in this node: ${nsErrors[node.id]}`;
  } else {
    errPreview.style.display = 'none';
    document.getElementById('ns-fix-prompt-input').value = '';
  }

  document.getElementById('ns-fix-modal-error').textContent = '';
  modal.style.display = 'block';
  document.getElementById('ns-fix-prompt-input').focus();
}

function closeNsFixModal() {
  const modal = document.getElementById('ns-ai-fix-modal');
  if (modal) modal.style.display = 'none';
}

async function executeNsFix() {
  const nodeId = document.getElementById('ns-fix-node-id').value;
  const prompt = document.getElementById('ns-fix-prompt-input').value.trim();
  const errEl  = document.getElementById('ns-fix-modal-error');
  const btn    = document.getElementById('ns-fix-execute-button');

  if (!prompt) { errEl.textContent = 'Please enter a command.'; return; }
  if (!_callAI || !_applyActions || !_getTree) {
    errEl.textContent = 'AI functions not initialized.'; return;
  }

  btn.disabled = true;
  btn.textContent = '⚡ Repairing…';
  errEl.textContent = '';

  try {
    const tree = _getTree();
    const node = findNodeById(tree, nodeId);
    const errContext = nsErrors[nodeId] ? `\nError context: ${nsErrors[nodeId]}` : '';

    const systemPrompt = `You are an expert AI web developer. A user has clicked a node in the Visual Nervous System to fix or edit it. Return ONLY a valid JSON object matching this format:
{
  "plan": "brief description of what you changed",
  "actions": [{
    "actionType": "update",
    "nodeId": "${nodeId}",
    "newCode": "FULL COMPLETE CODE HERE",
    "newDescription": "optional updated description"
  }]
}`;

    const userPrompt = `Fix or edit the following node in the vibe tree.
Node ID: ${nodeId}
Node Type: ${node?.type || 'unknown'}
Current Code: ${node?.code ? node.code.slice(0, 2000) : '(none)'}${errContext}

User instruction: ${prompt}`;

    const response = await _callAI(systemPrompt, userPrompt, true);
    let parsed;
    try {
      let clean = response.trim().replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      throw new Error('AI returned invalid JSON. Raw: ' + response.slice(0, 200));
    }

    await _applyActions(parsed.actions || []);

    // Clear error for this node
    delete nsErrors[nodeId];
    updateStatusBadge();

    closeNsFixModal();
    buildGraph(_getTree());

  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Execute Neural Repair';
  }
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function updateStatusBadge() {
  const badge = document.getElementById('ns-status-badge');
  const indicator = document.getElementById('nervous-system-error-indicator');
  const count = Object.keys(nsErrors).length;

  if (!badge) return;
  if (count === 0) {
    badge.className = 'ns-status-badge healthy';
    badge.textContent = '● All Systems Nominal';
    if (indicator) indicator.style.display = 'none';
  } else {
    badge.className = 'ns-status-badge error';
    badge.textContent = `● ${count} Error${count > 1 ? 's' : ''} Detected`;
    if (indicator) indicator.style.display = 'block';
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('ns-styles')) return;
  const style = document.createElement('style');
  style.id = 'ns-styles';
  style.textContent = NS_STYLES;
  document.head.appendChild(style);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function hexWithAlpha(hex, alpha) {
  try { return `rgba(${hexToRgb(hex)},${alpha})`; }
  catch { return `rgba(120,144,156,${alpha})`; }
}

function findNodeById(tree, id) {
  if (!tree) return null;
  if (tree.id === id) return tree;
  for (const child of tree.children || []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}
