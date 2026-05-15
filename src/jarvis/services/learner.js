'use strict';
// JARVIS continuous learning engine
// - Queries Wikipedia for any topic
// - Stores facts in local knowledge base (JSON)
// - Auto-installs requested npm packages at runtime
// - Checks for JARVIS updates and npm dependency updates
// - Builds a growing personal knowledge file per user

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

class LearnerService {
  constructor() {
    this.knowledgePath = null;
    this.knowledge = {};
    this.learningLog = [];
  }

  init(userDataPath) {
    this.knowledgePath = path.join(userDataPath, 'jarvis-knowledge.json');
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.knowledgePath)) {
        this.knowledge = JSON.parse(fs.readFileSync(this.knowledgePath, 'utf-8'));
      }
    } catch (_) { this.knowledge = {}; }
  }

  save() {
    try {
      fs.writeFileSync(this.knowledgePath, JSON.stringify(this.knowledge, null, 2));
    } catch (_) {}
  }

  store(key, value, source = 'user') {
    this.knowledge[key.toLowerCase()] = {
      value,
      source,
      ts: new Date().toISOString(),
      accessed: 0,
    };
    this.save();
    return `Mémorisé: "${key}" → ${String(value).slice(0, 80)}`;
  }

  recall(key) {
    const entry = this.knowledge[key.toLowerCase()];
    if (!entry) return null;
    entry.accessed++;
    this.save();
    return entry.value;
  }

  getStats() {
    const entries = Object.keys(this.knowledge).length;
    const sources = [...new Set(Object.values(this.knowledge).map(v => v.source))];
    return { entries, sources, log: this.learningLog.slice(-10) };
  }

  // ── Wikipedia ──────────────────────────────────────────────────────────────
  async searchWikipedia(query, lang = 'fr') {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
      const { stdout } = await execAsync(`curl -s --max-time 8 -A "JARVIS/1.0" "${url}"`);
      const d = JSON.parse(stdout);
      if (d.extract) {
        const text = d.extract.slice(0, 500);
        this.store(query, text, 'wikipedia');
        this.learningLog.push({ ts: new Date().toISOString(), action: 'wikipedia', query });
        return `${d.title}: ${text}`;
      }
      // Retry in English
      if (lang === 'fr') return this.searchWikipedia(query, 'en');
      return `Aucun article Wikipedia trouvé pour "${query}".`;
    } catch (err) {
      return `Wikipedia inaccessible: ${err.message}`;
    }
  }

  // ── Check and install npm packages on demand ───────────────────────────────
  async installPackage(packageName, jarvisDir) {
    const safe = packageName.replace(/[^a-z0-9@/._-]/gi, '');
    if (!safe || safe.length > 100) return 'Nom de package invalide.';
    try {
      await execAsync(`npm list ${safe} --prefix "${jarvisDir}" 2>/dev/null`);
      return `Package "${safe}" déjà installé.`;
    } catch {
      try {
        await execAsync(`npm install ${safe} --prefix "${jarvisDir}" --save 2>&1`);
        this.learningLog.push({ ts: new Date().toISOString(), action: 'install', package: safe });
        return `Package "${safe}" installé avec succès.`;
      } catch (err) {
        return `Erreur installation "${safe}": ${err.message.slice(0, 200)}`;
      }
    }
  }

  // ── Check for npm dependency updates ──────────────────────────────────────
  async checkDependencyUpdates(jarvisDir) {
    try {
      const { stdout } = await execAsync(`npm outdated --json --prefix "${jarvisDir}" 2>/dev/null`);
      if (!stdout.trim() || stdout.trim() === '{}') return 'Toutes les dépendances sont à jour.';
      const outdated = JSON.parse(stdout);
      const list = Object.entries(outdated)
        .map(([pkg, info]) => `${pkg}: ${info.current} → ${info.latest}`)
        .join(', ');
      return `Mises à jour disponibles: ${list}`;
    } catch {
      return 'Impossible de vérifier les mises à jour.';
    }
  }

  // ── Update all dependencies ────────────────────────────────────────────────
  async updateDependencies(jarvisDir) {
    try {
      await execAsync(`npm update --prefix "${jarvisDir}" 2>&1`);
      this.learningLog.push({ ts: new Date().toISOString(), action: 'update-deps' });
      return 'Dépendances mises à jour.';
    } catch (err) {
      return `Erreur mise à jour: ${err.message.slice(0, 200)}`;
    }
  }

  // ── Wolfram Alpha-style computation (via wttr + external free APIs) ─────────
  async compute(expression) {
    try {
      const encoded = encodeURIComponent(expression);
      const { stdout } = await execAsync(
        `curl -s --max-time 6 "https://api.mathjs.org/v4/?expr=${encoded}"`
      );
      return `${expression} = ${stdout.trim()}`;
    } catch {
      // Fallback: python3 eval for math
      try {
        const safe = expression.replace(/[^0-9+\-*/().%, ]/g, '');
        const { stdout } = await execAsync(`python3 -c "print(${safe})"`);
        return `${expression} = ${stdout.trim()}`;
      } catch {
        return `Impossible de calculer: ${expression}`;
      }
    }
  }

  // ── List what JARVIS knows ─────────────────────────────────────────────────
  listKnowledge(limit = 10) {
    const entries = Object.entries(this.knowledge)
      .sort((a, b) => new Date(b[1].ts) - new Date(a[1].ts))
      .slice(0, limit)
      .map(([k, v]) => `• ${k}: ${String(v.value).slice(0, 80)}`)
      .join('\n');
    return entries || 'Base de connaissance vide.';
  }
}

module.exports = new LearnerService();
