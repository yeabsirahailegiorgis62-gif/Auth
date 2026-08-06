const { OpenAI } = require('openai');

class OpenAIProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateText(prompt, systemPrompt = 'You are a helpful writing assistant.', options = {}) {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      text: response.choices[0].message.content,
      usage: response.usage.total_tokens
    };
  }
}

module.exports = OpenAIProvider;
