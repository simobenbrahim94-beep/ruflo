const fs = require('fs').promises;
const path = require('path');

const DEFAULTS = {
  anthropicKey: '',
  elevenLabsKey: '',
  voiceId: 'onwK4e9ZLuTAKqWW03F9',
  speechLang: 'fr-FR',
  model: 'claude-opus-4-7',
  userName: 'Patron',
};

let configPath;

async function init(userDataPath) {
  configPath = path.join(userDataPath, 'jarvis-config.json');
  return get();
}

async function get() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULTS };
  }
}

async function set(newConfig) {
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
}

module.exports = { init, get, set };
