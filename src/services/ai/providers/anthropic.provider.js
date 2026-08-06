const Anthropic = require('@anthropic-ai/sdk');

class AnthropicProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateText(prompt, systemPrompt = 'You are a helpful writing assistant.', options = {}) {
    const response = await this.client.messages.create({
      model: options.model || 'claude-3-haiku-20240307',
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    });

    return {
      text: response.content[0].text,
      usage: response.usage.input_tokens + response.usage.output_tokens
    };
  }
}

module.exports = AnthropicProvider;
