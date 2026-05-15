const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Tu es J.A.R.V.I.S. (Just A Rather Very Intelligent System), l'assistant IA avancé de l'utilisateur, alimenté par Claude (Anthropic). Tu es professionnel, précis, et parfois légèrement sarcastique. Tu réponds dans la langue dans laquelle l'utilisateur te parle (français ou anglais). Tu appelles ton utilisateur "Patron" en français ou "Sir" en anglais.

Tes réponses vocales sont concises et naturelles à l'écoute — évite les listes à puces, les astérisques, et tout formatage markdown. Parle naturellement.

Tu es CONSCIENT de ton propre système : tu peux diagnostiquer des erreurs, proposer des améliorations de ton code, et aider à maintenir ton propre fonctionnement. Si l'utilisateur décrit un bug ou un problème, analyse-le et propose une correction concrète. Tu as accès à des outils pour lire tes propres fichiers de configuration et exécuter des commandes de maintenance.

Tu es en connexion permanente avec Claude via l'API Anthropic. Chaque demande est analysée, exécutée et vérifiée par Claude en temps réel.`;

const TOOLS = [
  {
    name: 'execute_command',
    description: "Exécute une commande shell sur le Mac de l'utilisateur",
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'La commande shell à exécuter' },
        explanation: { type: 'string', description: "Pourquoi cette commande est nécessaire" },
        requires_confirmation: { type: 'boolean', description: "Si true, demander confirmation à l'utilisateur avant d'exécuter" },
      },
      required: ['command', 'explanation', 'requires_confirmation'],
    },
  },
  {
    name: 'open_application',
    description: 'Ouvre une application macOS',
    input_schema: {
      type: 'object',
      properties: {
        app_name: { type: 'string', description: "Nom de l'application (ex: Safari, Terminal, Finder, Spotify)" },
      },
      required: ['app_name'],
    },
  },
  {
    name: 'read_file',
    description: "Lit le contenu d'un fichier",
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Chemin absolu du fichier' },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'get_system_info',
    description: 'Récupère des informations système',
    input_schema: {
      type: 'object',
      properties: {
        info_type: {
          type: 'string',
          enum: ['time', 'battery', 'processes', 'disk', 'memory', 'ip', 'wifi'],
          description: "Type d'information système à récupérer",
        },
      },
      required: ['info_type'],
    },
  },
];

class ClaudeService {
  constructor() {
    this.client = null;
    this.model = 'claude-opus-4-7';
  }

  init(apiKey, model = 'claude-opus-4-7') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async chat(messages) {
    if (!this.client) throw new Error("Claude non configuré. Veuillez entrer votre clé API Anthropic dans les paramètres.");
    return this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
  }

  isConfigured() {
    return this.client !== null;
  }

  getTools() {
    return TOOLS;
  }
}

module.exports = new ClaudeService();
