const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const exportImportController = require("../controllers/exportImport.controller");

router.use(authenticate);

router.get("/documents/:id/export", (req, res, next) =>
  exportImportController.exportDocument(req, res, next)
);
router.post("/documents/import", (req, res, next) =>
  exportImportController.importDocument(req, res, next)
);

module.exports = router;
