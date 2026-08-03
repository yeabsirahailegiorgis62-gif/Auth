const { documentService } = require("../services/document.service");
const permissionService = require("../services/permission.service");

class ExportImportController {
  async exportDocument(req, res, next) {
    try {
      const { id } = req.params;
      const format = (req.query.format || "html").toLowerCase();

      const document = await documentService.getDocumentById(req.user.id, id);

      let contentStr = "";
      if (typeof document.content === "string") {
        try {
          const parsed = JSON.parse(document.content);
          contentStr = JSON.stringify(parsed, null, 2);
        } catch {
          contentStr = document.content;
        }
      } else {
        contentStr = JSON.stringify(document.content, null, 2);
      }

      if (format === "md" || format === "markdown") {
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, "_")}.md"`
        );
        return res.send(`# ${document.title}\n\n${contentStr}`);
      }

      if (format === "txt") {
        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, "_")}.txt"`
        );
        return res.send(`${document.title}\n\n${contentStr}`);
      }

      // Default HTML
      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, "_")}.html"`
      );

      const htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
  <div class="content">${contentStr}</div>
</body>
</html>`;

      res.send(htmlOutput);
    } catch (error) {
      next(error);
    }
  }

  async importDocument(req, res, next) {
    try {
      const { title, content } = req.body;
      const document = await documentService.createDocument(req.user.id, {
        title: title || "Imported Document",
        content: content || "",
      });

      res.status(201).json({
        success: true,
        document,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExportImportController();
