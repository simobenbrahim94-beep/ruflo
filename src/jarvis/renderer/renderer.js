'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let messages = [];
let isListening = false;
let isProcessing = false;
let recognition = null;
let config = {};

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  config = await window.jarvis.getConfig();

  initClock();
  initSpeechRecognition();
  initControls();
  refreshInfoPanel();

  window.jarvis.onCommandExecuted(({ command, result }) => {
    appendCommandLog(command, result);
  });

  if (!config.anthropicKey || !config.elevenLabsKey) {
    openSettings();
  }

  setStatus('EN ATTENTE', 'idle');
});

// ── Clock ─────────────────────────────────────────────────────────────────────
function initClock() {
  const el = document.getElementById('clock');
  const tick = () => {
    const now = new Date();
    el.textContent = now.toTimeString().slice(0, 8);
    setTimeout(tick, 1000);
  };
  tick();
}

// ── Speech Recognition ────────────────────────────────────────────────────────
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn('Web Speech API non disponible');
    return;
  }

  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = config.speechLang || 'fr-FR';

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('mic-button').classList.add('active');
    setStatus('ÉCOUTE EN COURS...', 'listening');
    setReactorState('listening', 'ÉCOUTE');
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join('');
    document.getElementById('transcript-display').textContent = transcript;

    if (event.results[event.results.length - 1].isFinal) {
      recognition.stop();
      if (transcript.trim()) handleInput(transcript.trim());
    }
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('mic-button').classList.remove('active');
    if (!isProcessing) {
      setStatus('EN ATTENTE', 'idle');
      setReactorState('idle', 'STANDBY');
      document.getElementById('transcript-display').textContent = '';
    }
  };

  recognition.onerror = (e) => {
    isListening = false;
    document.getElementById('mic-button').classList.remove('active');
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      setStatus(`ERREUR MICRO: ${e.error}`, 'error');
      setReactorState('error', 'ERREUR');
      setTimeout(() => { if (!isProcessing) { setStatus('EN ATTENTE', 'idle'); setReactorState('idle', 'STANDBY'); } }, 3000);
    }
  };
}

function startListening() {
  if (!recognition) { alert('Reconnaissance vocale non disponible.'); return; }
  if (isListening || isProcessing) return;
  try { recognition.start(); } catch (_) { /* already started */ }
}

function stopListening() {
  if (recognition && isListening) recognition.stop();
}

// ── Controls setup ────────────────────────────────────────────────────────────
function initControls() {
  const micBtn = document.getElementById('mic-button');
  micBtn.addEventListener('mousedown', startListening);
  micBtn.addEventListener('mouseup', stopListening);
  micBtn.addEventListener('mouseleave', stopListening);
  // tap support (toggle)
  micBtn.addEventListener('click', () => {
    if (isListening) stopListening(); else startListening();
  });

  document.getElementById('send-btn').addEventListener('click', sendTextInput);
  document.getElementById('text-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextInput(); }
  });

  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('cfg-cancel').addEventListener('click', closeSettings);
  document.getElementById('cfg-save').addEventListener('click', saveSettings);
  document.getElementById('clear-btn').addEventListener('click', clearConversation);

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

function sendTextInput() {
  const input = document.getElementById('text-input');
  const text = input.value.trim();
  if (!text || isProcessing) return;
  input.value = '';
  handleInput(text);
}

// ── Core conversation handler ─────────────────────────────────────────────────
async function handleInput(text) {
  if (isProcessing) return;
  isProcessing = true;

  document.getElementById('transcript-display').textContent = '';
  appendMessage('user', text);
  messages.push({ role: 'user', content: text });

  setStatus('TRAITEMENT...', 'processing');
  setReactorState('processing', 'CALCUL');

  try {
    const response = await window.jarvis.chat(messages);
    messages = response.messages;
    appendMessage('assistant', response.text);

    if (config.elevenLabsKey) {
      await speakText(response.text);
    } else {
      setStatus('EN ATTENTE', 'idle');
      setReactorState('idle', 'STANDBY');
    }
  } catch (err) {
    const msg = err.message || 'Erreur inconnue';
    appendMessage('error', msg);
    setStatus('ERREUR', 'error');
    setReactorState('error', 'ERREUR');
    setTimeout(() => { setStatus('EN ATTENTE', 'idle'); setReactorState('idle', 'STANDBY'); }, 4000);
  } finally {
    isProcessing = false;
  }
}

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
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
    console.error('TTS error:', err);
  } finally {
    setStatus('EN ATTENTE', 'idle');
    setReactorState('idle', 'STANDBY');
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function appendMessage(role, text) {
  const list = document.getElementById('conversation-list');
  const el = document.createElement('div');
  el.className = `message ${role}`;
  const label = { user: 'VOUS', assistant: 'J.A.R.V.I.S.', error: 'ERREUR' }[role];
  el.innerHTML = `<div class="message-role">${label}</div><div class="message-text">${escapeHtml(text)}</div>`;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

function appendCommandLog(command, result) {
  const log = document.getElementById('command-log');
  const el = document.createElement('div');
  el.className = 'cmd-entry';
  const statusClass = result.success ? 'cmd-ok' : 'cmd-err';
  const statusText = result.success ? '✓ OK' : '✗ ERREUR';
  el.innerHTML = `<div class="cmd-text">$ ${escapeHtml(command)}</div><div class="${statusClass}">${statusText}</div>`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function clearConversation() {
  messages = [];
  document.getElementById('conversation-list').innerHTML = '';
}

function setStatus(text, mode) {
  const el = document.getElementById('status-text');
  el.textContent = text;
  el.className = `status-text ${mode || 'idle'}`;
}

function setReactorState(state, label) {
  const reactor = document.getElementById('arc-reactor');
  reactor.className = `state-${state}`;
  document.getElementById('reactor-label').textContent = label || state.toUpperCase();
}

function refreshInfoPanel() {
  document.getElementById('info-model').textContent = config.model || 'claude-opus-4-7';
  document.getElementById('info-lang').textContent = config.speechLang || 'fr-FR';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

// ── Settings modal ────────────────────────────────────────────────────────────
async function openSettings() {
  const cfg = await window.jarvis.getConfig();
  document.getElementById('cfg-anthropic-key').value = cfg.anthropicKey || '';
  document.getElementById('cfg-elevenlabs-key').value = cfg.elevenLabsKey || '';
  document.getElementById('cfg-voice-id').value = cfg.voiceId || 'onwK4e9ZLuTAKqWW03F9';
  document.getElementById('cfg-model').value = cfg.model || 'claude-opus-4-7';
  document.getElementById('cfg-speech-lang').value = cfg.speechLang || 'fr-FR';
  document.getElementById('settings-overlay').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
}

async function saveSettings() {
  const newCfg = {
    anthropicKey:   document.getElementById('cfg-anthropic-key').value.trim(),
    elevenLabsKey:  document.getElementById('cfg-elevenlabs-key').value.trim(),
    voiceId:        document.getElementById('cfg-voice-id').value.trim() || 'onwK4e9ZLuTAKqWW03F9',
    model:          document.getElementById('cfg-model').value,
    speechLang:     document.getElementById('cfg-speech-lang').value,
  };

  await window.jarvis.setConfig(newCfg);
  config = newCfg;

  if (recognition) recognition.lang = newCfg.speechLang;

  refreshInfoPanel();
  closeSettings();
}
