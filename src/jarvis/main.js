require('dotenv').config();
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const claude = require('./services/claude');
const elevenlabs = require('./services/elevenlabs');
const executor = require('./services/executor');
const config = require('./services/config');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    vibrancy: 'dark',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  executor.setWindow(win);

  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(permission === 'media');
  });
}

app.whenReady().then(async () => {
  const cfg = await config.init(app.getPath('userData'));
  if (cfg.anthropicKey) claude.init(cfg.anthropicKey, cfg.model);
  if (cfg.elevenLabsKey) elevenlabs.init(cfg.elevenLabsKey, cfg.voiceId);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Config ────────────────────────────────────────────────────────────────────
ipcMain.handle('config:get', () => config.get());

ipcMain.handle('config:set', async (_, cfg) => {
  await config.set(cfg);
  if (cfg.anthropicKey) claude.init(cfg.anthropicKey, cfg.model);
  if (cfg.elevenLabsKey) elevenlabs.init(cfg.elevenLabsKey, cfg.voiceId);
  return { success: true };
});

// ── ElevenLabs ────────────────────────────────────────────────────────────────
ipcMain.handle('elevenlabs:synthesize', (_, text) => elevenlabs.synthesize(text));

ipcMain.handle('elevenlabs:voices', () => elevenlabs.listVoices());

// ── Claude – full conversation loop with tool handling ────────────────────────
ipcMain.handle('claude:chat', async (_, messages) => {
  let currentMessages = [...messages];
  const MAX_ITERATIONS = 12;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await claude.chat(currentMessages);

    if (response.stop_reason !== 'tool_use') {
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
      currentMessages.push({ role: 'assistant', content: text });
      return { text, messages: currentMessages };
    }

    const toolResults = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      let result;
      const inp = block.input;

      if (block.name === 'execute_command') {
        const r = await executor.run(inp.command, inp.explanation, inp.requires_confirmation);
        result = r.output;
        win.webContents.send('command:executed', { command: inp.command, result: r });
      } else if (block.name === 'open_application') {
        const r = await executor.openApp(inp.app_name);
        result = r.output;
      } else if (block.name === 'read_file') {
        const r = await executor.readFile(inp.file_path);
        result = r.output;
      } else if (block.name === 'get_system_info') {
        const r = await executor.getSystemInfo(inp.info_type);
        result = r.output;
      } else {
        result = `Outil inconnu: ${block.name}`;
      }

      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }

    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ];
  }

  throw new Error('Limite de boucle atteinte.');
});

// ── Executor history ───────────────────────────────────────────────────────────
ipcMain.handle('executor:history', () => executor.getHistory());
