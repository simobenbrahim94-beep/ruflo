const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  chat: (messages) => ipcRenderer.invoke('claude:chat', messages),
  synthesize: (text) => ipcRenderer.invoke('elevenlabs:synthesize', text),
  listVoices: () => ipcRenderer.invoke('elevenlabs:voices'),
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (cfg) => ipcRenderer.invoke('config:set', cfg),
  getHistory: () => ipcRenderer.invoke('executor:history'),
  loadMemory: () => ipcRenderer.invoke('memory:load'),
  saveMemory: (msgs) => ipcRenderer.invoke('memory:save', msgs),
  onCommandExecuted: (cb) => ipcRenderer.on('command:executed', (_, data) => cb(data)),
  // Health monitor
  getReport: () => ipcRenderer.invoke('monitor:report'),
  runCheck: () => ipcRenderer.invoke('monitor:check'),
  autoUpdate: () => ipcRenderer.invoke('monitor:update'),
  reportError: (context, message) => ipcRenderer.send('renderer:error', { context, message }),
  onMonitor: (event, cb) => ipcRenderer.on(`monitor:${event}`, (_, data) => cb(data)),
});
