'use strict';
// Background health monitor — permanently linked to Claude for self-diagnosis and improvement.
// Collects errors, runs periodic checks, and requests Claude to analyze + propose fixes.

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class HealthMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = { startTime: Date.now(), requestCount: 0, errorCount: 0 };
    this.claudeRef = null;
    this.winRef = null;
    this.checkInterval = null;
    this.repoPath = null;
  }

  init(claudeService, win, repoPath) {
    this.claudeRef = claudeService;
    this.winRef = win;
    this.repoPath = repoPath;
    this.startMonitoring();
  }

  startMonitoring() {
    // Check every 5 minutes
    this.checkInterval = setInterval(() => this.runCheck(), 5 * 60 * 1000);
    // Initial check after 30s
    setTimeout(() => this.runCheck(), 30 * 1000);
  }

  stopMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  recordError(context, error) {
    const entry = {
      ts: new Date().toISOString(),
      context,
      message: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
    };
    this.errors.push(entry);
    this.stats.errorCount++;
    if (this.errors.length > 100) this.errors.shift();
    this.notifyRenderer('error', entry);
  }

  recordRequest() {
    this.stats.requestCount++;
  }

  async runCheck() {
    const checks = await Promise.allSettled([
      this.checkMemory(),
      this.checkDisk(),
      this.checkUpdates(),
    ]);

    const results = checks.map((c, i) => {
      const labels = ['memory', 'disk', 'updates'];
      return { name: labels[i], status: c.status, value: c.status === 'fulfilled' ? c.value : c.reason?.message };
    });

    this.notifyRenderer('health-check', { results, stats: this.getStats() });

    // If there are recent errors, ask Claude to diagnose
    const recentErrors = this.errors.filter(e => Date.now() - new Date(e.ts).getTime() < 10 * 60 * 1000);
    if (recentErrors.length >= 2 && this.claudeRef?.isConfigured()) {
      await this.requestDiagnosis(recentErrors);
    }
  }

  async checkMemory() {
    try {
      const { stdout } = await execAsync('vm_stat | grep "Pages free" | awk \'{print $3}\'');
      const freePages = parseInt(stdout.trim().replace('.', ''));
      const freeGB = ((freePages * 4096) / 1e9).toFixed(2);
      return `${freeGB}GB libre`;
    } catch {
      return 'N/A';
    }
  }

  async checkDisk() {
    try {
      const { stdout } = await execAsync('df -h / | tail -1 | awk \'{print $4}\'');
      return `${stdout.trim()} disponible`;
    } catch {
      return 'N/A';
    }
  }

  async checkUpdates() {
    if (!this.repoPath) return 'repo non configuré';
    try {
      const { stdout } = await execAsync(`cd "${this.repoPath}" && git fetch origin --quiet && git status -sb 2>&1 | head -2`);
      if (stdout.includes('behind')) {
        await this.autoUpdate();
        return 'mise à jour appliquée ✓';
      }
      return 'à jour ✓';
    } catch {
      return 'vérification impossible';
    }
  }

  async autoUpdate() {
    if (!this.repoPath) return;
    try {
      await execAsync(`cd "${this.repoPath}" && git pull origin claude/jarvis-voice-interface-QWKOs --ff-only`);
      this.notifyRenderer('auto-updated', { message: 'JARVIS mis à jour automatiquement depuis GitHub' });
    } catch (_) {}
  }

  async requestDiagnosis(errors) {
    if (!this.claudeRef?.isConfigured()) return;
    try {
      const errorList = errors.map(e => `[${e.ts}] ${e.context}: ${e.message}`).join('\n');
      const response = await this.claudeRef.chat([{
        role: 'user',
        content: `Tu es l'agent de diagnostic de JARVIS. Analyse ces erreurs récentes et propose des corrections courtes et précises:\n\n${errorList}\n\nRéponds en 3 points maximum, en français, de façon très concise.`,
      }]);
      const text = response.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
      if (text) this.notifyRenderer('diagnosis', { text, errorCount: errors.length });
    } catch (_) {}
  }

  notifyRenderer(event, data) {
    try {
      if (this.winRef?.webContents && !this.winRef.isDestroyed()) {
        this.winRef.webContents.send(`monitor:${event}`, data);
      }
    } catch (_) {}
  }

  getStats() {
    const uptimeMs = Date.now() - this.stats.startTime;
    const h = Math.floor(uptimeMs / 3600000);
    const m = Math.floor((uptimeMs % 3600000) / 60000);
    return {
      uptime: `${h}h ${m}m`,
      requests: this.stats.requestCount,
      errors: this.stats.errorCount,
      recentErrors: this.errors.slice(-5),
    };
  }

  getReport() {
    return { stats: this.getStats(), errors: this.errors.slice(-20), warnings: this.warnings };
  }
}

module.exports = new HealthMonitor();
