'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let messages = [];
let isListening = false;
let isProcessing = false;
let isWakeWordActive = false;
let recognition = null;
let wakeRecognition = null;
let config = {};

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  config = await window.jarvis.getConfig();

  messages = await window.jarvis.loadMemory();

  initClock();
  initSpeechRecognition();
  initControls();
  refreshInfoPanel();
  restoreConversationHistory();

  window.jarvis.onCommandExecuted(({ command, result }) => {
    appendCommandLog(command, result);
  });

  // ── Health monitor events ─────────────────────────────────────────────────
  window.jarvis.onMonitor('health-check', ({ stats }) => {
    const el = document.getElementById('info-memory');
    if (el) el.textContent = `${stats.requests} req · ${stats.errors} err · ${stats.uptime}`;
  });

  window.jarvis.onMonitor('diagnosis', ({ text, errorCount }) => {
    appendMessage('assistant', `[DIAGNOSTIC — ${errorCount} erreur(s) détectée(s)]\n${text}`);
    if (config.elevenLabsKey) speakText(`Diagnostic système: ${text.slice(0, 200)}`);
  });

  window.jarvis.onMonitor('auto-updated', ({ message }) => {
    appendMessage('assistant', `[MISE À JOUR] ${message}`);
  });

  // Global error capture → send to monitor
  window.addEventListener('unhandledrejection', (e) => {
    window.jarvis.reportError('renderer:unhandledRejection', e.reason?.message || String(e.reason));
  });
  window.addEventListener('error', (e) => {
    window.jarvis.reportError('renderer:error', e.message);
  });

  if (!config.anthropicKey || !config.elevenLabsKey) {
    openSettings();
  } else {
    // Brief startup pause, then briefing
    setTimeout(() => playDailyBriefing(), 1200);
  }

  setStatus('EN ATTENTE', 'idle');
});

// ── Clock ─────────────────────────────────────────────────────────────────────
function initClock() {
  const el = document.getElementById('clock');
  const tick = () => {
    el.textContent = new Date().toTimeString().slice(0, 8);
    setTimeout(tick, 1000);
  };
  tick();
}

// ── Speech Recognition ────────────────────────────────────────────────────────
function getSR() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function initSpeechRecognition() {
  const SR = getSR();
  if (!SR) { console.warn('Web Speech API non disponible'); return; }

  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = config.speechLang || 'fr-FR';

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('mic-button').classList.add('active');
    setStatus('ÉCOUTE EN COURS...', 'listening');
    setReactorState('listening', 'ÉCOUTE');
    clearSubtitle();
  };

  recognition.onresult = (event) => {
    const results = Array.from(event.results);
    const transcript = results.map((r) => r[0].transcript).join('');
    showSubtitle(transcript, !results[results.length - 1].isFinal);

    if (results[results.length - 1].isFinal && transcript.trim()) {
      recognition.stop();
      handleInput(transcript.trim());
    }
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('mic-button').classList.remove('active');
    if (!isProcessing) {
      setStatus(isWakeWordActive ? 'MODE VEILLE — DIS "JARVIS"' : 'EN ATTENTE', 'idle');
      setReactorState('idle', 'STANDBY');
    }
    // Resume wake word loop if active
    if (isWakeWordActive && !isProcessing) {
      setTimeout(startWakeWordCycle, 300);
    }
  };

  recognition.onerror = (e) => {
    isListening = false;
    document.getElementById('mic-button').classList.remove('active');
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      setStatus('ERREUR MICRO: ' + e.error, 'error');
      setReactorState('error', 'ERREUR');
      setTimeout(() => { if (!isProcessing) reset(); }, 3000);
    }
    if (isWakeWordActive && !isProcessing) setTimeout(startWakeWordCycle, 500);
  };
}

// ── Wake Word ─────────────────────────────────────────────────────────────────
const WAKE_WORDS = ['jarvis', "j'arvis", 'jarvice', 'jarvi', 'jarvis!'];

function toggleWakeWord() {
  isWakeWordActive ? stopWakeWord() : startWakeWord();
}

function startWakeWord() {
  const SR = getSR();
  if (!SR) return;
  isWakeWordActive = true;
  document.getElementById('wake-btn').classList.add('active');
  setStatus('MODE VEILLE — DIS "JARVIS"', 'idle');
  startWakeWordCycle();
}

function stopWakeWord() {
  isWakeWordActive = false;
  document.getElementById('wake-btn').classList.remove('active');
  if (wakeRecognition) { try { wakeRecognition.stop(); } catch (_) {} wakeRecognition = null; }
  setStatus('EN ATTENTE', 'idle');
}

function startWakeWordCycle() {
  if (!isWakeWordActive || isListening || isProcessing) return;
  const SR = getSR();
  if (!SR) return;

  const wake = new SR();
  wake.lang = config.speechLang || 'fr-FR';
  wake.continuous = false;
  wake.interimResults = false;
  wakeRecognition = wake;

  wake.onresult = (e) => {
    const transcript = e.results[0][0].transcript.toLowerCase().trim();
    if (WAKE_WORDS.some((w) => transcript.includes(w))) {
      wakeRecognition = null;
      playBeep(880, 0.08, 0.25);
      setTimeout(() => { if (!isListening && !isProcessing) startListening(); }, 300);
    }
  };

  wake.onend = () => {
    if (isWakeWordActive && !isListening && !isProcessing) {
      setTimeout(startWakeWordCycle, 200);
    }
  };

  wake.onerror = () => {
    if (isWakeWordActive && !isListening) setTimeout(startWakeWordCycle, 800);
  };

  try { wake.start(); } catch (_) {}
}

// ── Controls ──────────────────────────────────────────────────────────────────
function initControls() {
  const mic = document.getElementById('mic-button');
  mic.addEventListener('click', () => { isListening ? stopListening() : startListening(); });

  document.getElementById('wake-btn').addEventListener('click', toggleWakeWord);
  document.getElementById('send-btn').addEventListener('click', sendText);
  document.getElementById('text-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }
  });

  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('cfg-cancel').addEventListener('click', closeSettings);
  document.getElementById('cfg-save').addEventListener('click', saveSettings);
  document.getElementById('clear-btn').addEventListener('click', clearConversation);
  document.getElementById('briefing-btn').addEventListener('click', () => playDailyBriefing());

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      isListening ? stopListening() : startListening();
    }
    if (e.code === 'Escape') closeSettings();
    if ((e.metaKey || e.ctrlKey) && e.code === 'Comma') openSettings();
  });
}

function startListening() {
  if (!recognition || isListening || isProcessing) return;
  try { recognition.start(); } catch (_) {}
}

function stopListening() {
  if (recognition && isListening) try { recognition.stop(); } catch (_) {}
}

function sendText() {
  const inp = document.getElementById('text-input');
  const text = inp.value.trim();
  if (!text || isProcessing) return;
  inp.value = '';
  handleInput(text);
}

// ── Main conversation loop ────────────────────────────────────────────────────
async function handleInput(text, silent = false) {
  if (isProcessing) return;
  isProcessing = true;
  clearSubtitle();

  if (!silent) appendMessage('user', text);
  messages.push({ role: 'user', content: text });

  setStatus('TRAITEMENT...', 'processing');
  setReactorState('processing', 'CALCUL');

  try {
    const response = await window.jarvis.chat(messages);
    messages = response.messages;

    if (!silent) appendMessage('assistant', response.text);

    await window.jarvis.saveMemory(messages);

    if (config.elevenLabsKey) {
      await speakText(response.text);
    } else {
      reset();
    }
  } catch (err) {
    const msg = err.message || 'Erreur inconnue';
    appendMessage('error', msg);
    setStatus('ERREUR', 'error');
    setReactorState('error', 'ERREUR');
    window.jarvis.reportError('claude:chat', msg);
    setTimeout(reset, 4000);
  } finally {
    isProcessing = false;
  }
}

// ── Daily Briefing ────────────────────────────────────────────────────────────
async function playDailyBriefing() {
  if (isProcessing) return;
  const d = new Date();
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const prompt = `Système JARVIS initialisé. Nous sommes le ${dateStr} à ${timeStr}. Donne un message de bienvenue bref et professionnel (2-3 phrases maximum), comme JARVIS au démarrage. Inclus optionnellement une courte phrase de motivation. Sois concis.`;
  await handleInput(prompt, false);
}

// ── TTS ───────────────────────────────────────────────────────────────────────
async function speakText(text) {
  setStatus('SYNTHÈSE VOCALE...', 'processing');
  try {
    const b64 = await window.jarvis.synthesize(text);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    setStatus('JARVIS PARLE...', 'speaking');
    setReactorState('speaking', 'TRANSMISSION');

    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('TTS:', err);
  } finally {
    reset();
  }
}

// ── Audio beep helper ─────────────────────────────────────────────────────────
function playBeep(freq = 880, vol = 0.15, duration = 0.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function reset() {
  setStatus(isWakeWordActive ? 'MODE VEILLE — DIS "JARVIS"' : 'EN ATTENTE', 'idle');
  setReactorState('idle', 'STANDBY');
}

function setStatus(text, mode) {
  const el = document.getElementById('status-text');
  el.textContent = text;
  el.className = `status-text ${mode || 'idle'}`;
}

function setReactorState(state, label) {
  document.getElementById('arc-reactor').className = `state-${state}`;
  document.getElementById('reactor-label').textContent = label || state.toUpperCase();
}

function showSubtitle(text, interim) {
  const el = document.getElementById('subtitle-bar');
  el.textContent = text;
  el.className = interim ? 'interim' : 'final';
}

function clearSubtitle() {
  const el = document.getElementById('subtitle-bar');
  el.textContent = '';
  el.className = '';
}

function appendMessage(role, text) {
  const list = document.getElementById('conversation-list');
  const el = document.createElement('div');
  el.className = `message ${role}`;
  const labels = { user: 'VOUS', assistant: 'J.A.R.V.I.S.', error: 'ERREUR' };
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-text';
  el.innerHTML = `<div class="message-role">${labels[role] || role.toUpperCase()}</div>`;
  el.appendChild(contentDiv);
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;

  if (role === 'assistant') {
    typewrite(contentDiv, text);
  } else {
    contentDiv.textContent = text;
  }
}

function typewrite(el, text, speed = 18) {
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      el.textContent += text[i++];
      el.closest('#conversation-list').scrollTop = el.closest('#conversation-list').scrollHeight;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

function appendCommandLog(command, result) {
  const log = document.getElementById('command-log');
  const el = document.createElement('div');
  el.className = 'cmd-entry';
  el.innerHTML = `<div class="cmd-text">$ ${escapeHtml(command)}</div><div class="${result.success ? 'cmd-ok' : 'cmd-err'}">${result.success ? '✓ OK' : '✗ ERR'}</div>`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function restoreConversationHistory() {
  const textMsgs = messages.filter((m) => typeof m.content === 'string');
  for (const msg of textMsgs.slice(-20)) {
    appendMessage(msg.role, msg.content);
  }
}

function clearConversation() {
  messages = [];
  window.jarvis.saveMemory([]);
  document.getElementById('conversation-list').innerHTML = '';
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function refreshInfoPanel() {
  document.getElementById('info-model').textContent = config.model || 'claude-opus-4-7';
  document.getElementById('info-lang').textContent = config.speechLang || 'fr-FR';
  const memCount = messages.filter((m) => typeof m.content === 'string').length;
  const memEl = document.getElementById('info-memory');
  if (memEl) memEl.textContent = `${memCount} messages`;
}

// ── Settings modal ────────────────────────────────────────────────────────────
async function openSettings() {
  const cfg = await window.jarvis.getConfig();
  document.getElementById('cfg-anthropic-key').value  = cfg.anthropicKey  || '';
  document.getElementById('cfg-elevenlabs-key').value = cfg.elevenLabsKey || '';
  document.getElementById('cfg-replicate-key').value  = cfg.replicateKey  || '';
  document.getElementById('cfg-stability-key').value  = cfg.stabilityKey  || '';
  document.getElementById('cfg-voice-id').value       = cfg.voiceId       || 'onwK4e9ZLuTAKqWW03F9';
  document.getElementById('cfg-model').value          = cfg.model         || 'claude-opus-4-7';
  document.getElementById('cfg-speech-lang').value    = cfg.speechLang    || 'fr-FR';
  document.getElementById('settings-overlay').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
}

async function saveSettings() {
  const newCfg = {
    anthropicKey:  document.getElementById('cfg-anthropic-key').value.trim(),
    elevenLabsKey: document.getElementById('cfg-elevenlabs-key').value.trim(),
    replicateKey:  document.getElementById('cfg-replicate-key').value.trim(),
    stabilityKey:  document.getElementById('cfg-stability-key').value.trim(),
    voiceId:       document.getElementById('cfg-voice-id').value.trim() || 'onwK4e9ZLuTAKqWW03F9',
    model:         document.getElementById('cfg-model').value,
    speechLang:    document.getElementById('cfg-speech-lang').value,
  };
  await window.jarvis.setConfig(newCfg);
  config = newCfg;
  if (recognition) recognition.lang = newCfg.speechLang;
  refreshInfoPanel();
  closeSettings();
}
