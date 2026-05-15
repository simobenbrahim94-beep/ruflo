const { exec } = require('child_process');
const { promisify } = require('util');
const { dialog } = require('electron');
const fs = require('fs').promises;

const execAsync = promisify(exec);

const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\/(?!(tmp|private\/tmp))/,
  /sudo\s+rm\s+-rf/,
  /mkfs/i,
  /dd\s+if=.*of=\/dev\//,
  /:\(\)\{.*\|.*&\}/,
];

class ExecutorService {
  constructor() {
    this.win = null;
    this.history = [];
  }

  setWindow(win) {
    this.win = win;
  }

  isBlocked(command) {
    return BLOCKED_PATTERNS.some((p) => p.test(command));
  }

  async confirm(command, explanation) {
    if (!this.win) return true;
    const { response } = await dialog.showMessageBox(this.win, {
      type: 'warning',
      buttons: ['Autoriser', 'Refuser'],
      defaultId: 1,
      cancelId: 1,
      title: 'J.A.R.V.I.S. — Confirmation requise',
      message: 'JARVIS souhaite exécuter une commande :',
      detail: `Commande : ${command}\n\nRaison : ${explanation}`,
    });
    return response === 0;
  }

  async run(command, explanation, requiresConfirmation = true) {
    if (this.isBlocked(command)) {
      return { success: false, output: 'Commande refusée : opération dangereuse détectée.' };
    }

    if (requiresConfirmation) {
      const approved = await this.confirm(command, explanation);
      if (!approved) {
        return { success: false, output: "Commande refusée par l'utilisateur." };
      }
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 512,
        shell: '/bin/zsh',
      });
      const output = (stdout || stderr || 'Exécuté avec succès.').trim();
      this.history.push({ command, explanation, output, ts: Date.now() });
      return { success: true, output };
    } catch (err) {
      return { success: false, output: err.message };
    }
  }

  async openApp(appName) {
    try {
      await execAsync(`open -a "${appName.replace(/"/g, '\\"')}"`);
      return { success: true, output: `${appName} lancé.` };
    } catch (err) {
      return { success: false, output: `Impossible d'ouvrir ${appName} : ${err.message}` };
    }
  }

  async readFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, output: content.substring(0, 5000) };
    } catch (err) {
      return { success: false, output: `Erreur lecture : ${err.message}` };
    }
  }

  async getSystemInfo(infoType) {
    const commands = {
      time: "date '+%A %d %B %Y, %H:%M:%S'",
      battery: "pmset -g batt | grep -o '[0-9]*%' | head -1",
      processes: "ps aux --sort=-pcpu | head -6 | tail -5 | awk '{print $11\": \"$3\"%\"}'",
      disk: "df -h / | tail -1 | awk '{print \"Utilisé: \"$3\", Disponible: \"$4\", Total: \"$2}'",
      memory: "memory_pressure | head -3",
      ip: "ifconfig | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1",
      wifi: "networksetup -getairportnetwork en0 2>/dev/null || echo 'WiFi non disponible'",
    };
    const cmd = commands[infoType] || `echo "Type inconnu: ${infoType}"`;
    return this.run(cmd, `Info système: ${infoType}`, false);
  }

  getHistory() {
    return this.history.slice(-10);
  }
}

module.exports = new ExecutorService();
