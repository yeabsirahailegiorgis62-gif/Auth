const OpenAIProvider = require('./providers/openai.provider');
const AnthropicProvider = require('./providers/anthropic.provider');

class AiFactory {
  static getProvider(config) {
    if (!config || !config.provider) {
      throw new Error('AI Provider configuration is missing');
    }

    switch (config.provider) {
      case 'OPENAI':
        return new OpenAIProvider(config.apiKey);
      case 'ANTHROPIC':
        return new AnthropicProvider(config.apiKey);
      case 'LOCAL':
        // For local models, you might pass a URL or just use a default provider
        throw new Error('Local AI provider not yet implemented');
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}

module.exports = AiFactory;
