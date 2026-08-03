const searchService = require("../services/search.service");

class SearchController {
  async search(req, res, next) {
    try {
      const { q, filter } = req.query;
      const results = await searchService.search(req.user.id, q, filter);
      res.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
