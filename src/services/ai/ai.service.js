const prisma = require('../../config/prisma');
const AiFactory = require('./ai.factory');

class AiService {
  /**
   * Main entry point to perform an AI action on a document.
   */
  async processAction(userId, workspaceId, documentId, action, payload) {
    // 1. Check workspace AI configuration
    let config = null;
    if (workspaceId) {
       config = await prisma.workspaceAiConfig.findUnique({
         where: { workspaceId }
       });
    }

    // Fallback to OPENAI and environment variables if not configured
    if (!config || !config.apiKey) {
       config = {
         provider: 'OPENAI',
         apiKey: process.env.OPENAI_API_KEY
       };
    }

    if (!config.apiKey) {
      throw new Error('AI Provider API key is not configured for this workspace.');
    }

    // 2. Instantiate Provider
    const aiProvider = AiFactory.getProvider(config);

    // 3. Construct Prompt based on Action
    const { prompt, systemPrompt } = this._buildPrompt(action, payload);

    // 4. Generate Text
    const response = await aiProvider.generateText(prompt, systemPrompt);

    // 5. Log Usage and History
    if (workspaceId) {
      await prisma.aiUsageLog.create({
        data: {
          workspaceId,
          userId,
          tokensUsed: response.usage || 0,
          action
        }
      });
    }

    if (documentId) {
      await prisma.aiHistory.create({
        data: {
          userId,
          documentId,
          prompt,
          response: response.text,
          action
        }
      });
    }

    return response.text;
  }

  _buildPrompt(action, payload) {
    const { text, context } = payload;
    let systemPrompt = 'You are a highly intelligent document writing assistant.';
    let prompt = '';

    switch (action) {
      case 'summarize':
        prompt = `Summarize the following text concisely:\n\n${text}`;
        break;
      case 'rewrite':
        prompt = `Rewrite the following text to improve flow and clarity:\n\n${text}`;
        break;
      case 'grammar':
        prompt = `Fix all grammar, spelling, and punctuation errors in the following text. Do not change the meaning:\n\n${text}`;
        break;
      case 'tone':
        prompt = `Rewrite the following text to sound more ${payload.tone || 'professional'}:\n\n${text}`;
        break;
      case 'translate':
        prompt = `Translate the following text to ${payload.language || 'English'}:\n\n${text}`;
        break;
      case 'continue':
        prompt = `Continue writing the following text naturally:\n\n${text}`;
        break;
      case 'title':
        prompt = `Generate a short, catchy title for a document with the following content:\n\n${text}`;
        break;
      case 'explain':
        prompt = `Explain the following paragraph in simple terms:\n\n${text}`;
        break;
      case 'meeting_notes':
        prompt = `Convert the following text into organized meeting notes with action items:\n\n${text}`;
        break;
      default:
        prompt = text; // Just pass through if custom or unknown
    }

    if (context) {
       systemPrompt += `\n\nContext about the document:\n${context}`;
    }

    return { prompt, systemPrompt };
  }

  async getAiConfig(workspaceId) {
     return prisma.workspaceAiConfig.findUnique({
       where: { workspaceId }
     });
  }

  async updateAiConfig(workspaceId, provider, apiKey) {
     return prisma.workspaceAiConfig.upsert({
       where: { workspaceId },
       update: { provider, apiKey },
       create: { workspaceId, provider, apiKey }
     });
  }
}

module.exports = new AiService();
