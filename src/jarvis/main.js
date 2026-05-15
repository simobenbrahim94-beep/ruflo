require('dotenv').config();
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs').promises;

const claude = require('./services/claude');
const elevenlabs = require('./services/elevenlabs');
const executor = require('./services/executor');
const config = require('./services/config');
const healthMonitor = require('./services/health-monitor');
const integrations = require('./services/integrations');

const fsSync = require('fs');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

let win;
let memoryPath;

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
    icon: fsSync.existsSync(iconPath) ? iconPath : undefined,
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
  const userDataPath = app.getPath('userData');
  const cfg = await config.init(userDataPath);
  memoryPath = path.join(userDataPath, 'jarvis-memory.json');
  if (cfg.anthropicKey) claude.init(cfg.anthropicKey, cfg.model);
  if (cfg.elevenLabsKey) elevenlabs.init(cfg.elevenLabsKey, cfg.voiceId);
  createWindow();
  if (process.platform === 'darwin' && fsSync.existsSync(iconPath)) {
    app.dock.setIcon(iconPath);
  }
  const repoPath = path.join(__dirname, '..', '..');
  healthMonitor.init(claude, win, repoPath);
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
      } else if (block.name === 'search_web') {
        result = await integrations.searchWeb(inp.query);
      } else if (block.name === 'get_weather') {
        result = await integrations.getWeather(inp.location);
      } else if (block.name === 'get_financial_data') {
        result = await integrations.getFinancialData(inp.symbol);
      } else if (block.name === 'get_emails') {
        result = await integrations.getEmails(inp.count || 5);
      } else if (block.name === 'send_email') {
        result = await integrations.sendEmail(inp.to, inp.subject, inp.body);
        win.webContents.send('command:executed', { command: `send_email → ${inp.to}`, result: { success: true, output: result } });
      } else if (block.name === 'control_chrome') {
        if (inp.action === 'open_url') result = await integrations.openInChrome(inp.value);
        else if (inp.action === 'search') result = await integrations.searchInChrome(inp.value);
        else if (inp.action === 'get_current_tab') result = await integrations.getChromeTab();
        else result = 'Action Chrome inconnue.';
      } else if (block.name === 'get_news') {
        result = await integrations.getNews(inp.topic || 'monde');
      } else if (block.name === 'get_reminders') {
        result = await integrations.getReminders();
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

// Wrap claude:chat to record stats + errors
const originalChatHandler = ipcMain.listeners
  ? null
  : null; // handled inline above via healthMonitor

ipcMain.on('renderer:error', (_, { context, message }) => {
  healthMonitor.recordError(context, new Error(message));
});

// ── Executor history ───────────────────────────────────────────────────────────
ipcMain.handle('executor:history', () => executor.getHistory());

// ── Memory persistence ────────────────────────────────────────────────────────
ipcMain.handle('memory:load', async () => {
  if (!memoryPath) return [];
  try {
    const data = await fs.readFile(memoryPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
});

ipcMain.handle('memory:save', async (_, msgs) => {
  if (!memoryPath) return;
  const filtered = msgs.filter((m) => typeof m.content === 'string').slice(-40);
  await fs.writeFile(memoryPath, JSON.stringify(filtered, null, 2));
});

// ── Health monitor ────────────────────────────────────────────────────────────
ipcMain.handle('monitor:report', () => healthMonitor.getReport());
ipcMain.handle('monitor:check', () => healthMonitor.runCheck());
ipcMain.handle('monitor:update', () => healthMonitor.autoUpdate());
