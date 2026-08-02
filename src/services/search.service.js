const searchRepository = require("../repositories/search.repository");

class SearchService {
  async search(userId, query, filter) {
    return searchRepository.searchDocuments(userId, query, filter);
  }
}

module.exports = new SearchService();
