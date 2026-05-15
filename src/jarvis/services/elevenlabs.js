const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  constructor() {
    this.apiKey = null;
    this.voiceId = 'onwK4e9ZLuTAKqWW03F9';
    this.modelId = 'eleven_multilingual_v2';
  }

  init(apiKey, voiceId = 'onwK4e9ZLuTAKqWW03F9') {
    this.apiKey = apiKey;
    this.voiceId = voiceId;
  }

  async synthesize(text) {
    if (!this.apiKey) throw new Error("ElevenLabs non configuré. Veuillez entrer votre clé API dans les paramètres.");

    const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${this.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: this.modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }

  async listVoices() {
    if (!this.apiKey) return [];
    const response = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { 'xi-api-key': this.apiKey },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.voices || [];
  }

  isConfigured() {
    return this.apiKey !== null;
  }
}

module.exports = new ElevenLabsService();
