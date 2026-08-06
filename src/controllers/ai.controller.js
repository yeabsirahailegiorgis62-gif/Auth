const aiService = require('../services/ai/ai.service');

class AiController {
  async processAction(req, res, next) {
    try {
      const { workspaceId, documentId } = req.params;
      const { action, payload } = req.body;
      const userId = req.user.id;

      if (!action || !payload || !payload.text) {
         return res.status(400).json({ success: false, error: 'Missing required fields: action or payload.text' });
      }

      const result = await aiService.processAction(userId, workspaceId, documentId, action, payload);

      res.json({ success: true, result });
    } catch (error) {
      console.error('AI Error:', error);
      // Give a nicer error if it's an API key issue
      if (error.message.includes('API key')) {
         return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async getConfig(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const config = await aiService.getAiConfig(workspaceId);
      
      // Do not return full API key for security
      const safeConfig = config ? { 
         provider: config.provider, 
         hasApiKey: !!config.apiKey 
      } : null;

      res.json({ success: true, config: safeConfig });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const { provider, apiKey } = req.body;

      if (!provider || !apiKey) {
         return res.status(400).json({ success: false, error: 'Provider and API Key are required' });
      }

      await aiService.updateAiConfig(workspaceId, provider, apiKey);

      res.json({ success: true, message: 'AI configuration updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AiController();
