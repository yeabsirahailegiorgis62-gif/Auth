const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Collaborative Document Editor API",
      version: "1.0.0",
      description:
        "Production-grade RESTful API and Socket.IO specification for real-time document collaboration, authorization, commenting, version control, and workspace productivity.",
      contact: {
        name: "Engineering Team",
        email: "dev@collab-editor.local",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT Access Token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@example.com" },
            avatarUrl: { type: "string", nullable: true },
            bio: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Document: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Architecture Blueprint" },
            content: { type: "string", example: "<h1>Title</h1>" },
            ownerId: { type: "integer", example: 1 },
            isArchived: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            lastOpenedAt: { type: "string", format: "date-time" },
          },
        },
        DocumentShare: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            documentId: { type: "string", format: "uuid" },
            userId: { type: "integer", example: 2 },
            role: { type: "string", enum: ["VIEWER", "COMMENTER", "EDITOR", "OWNER"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CommentThread: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            documentId: { type: "string", format: "uuid" },
            createdBy: { type: "integer", example: 1 },
            selectedText: { type: "string", example: "architecture diagram" },
            resolved: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Revision: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            documentId: { type: "string", format: "uuid" },
            authorId: { type: "integer", example: 1 },
            content: { type: "string" },
            version: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Permission denied" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.routes.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

module.exports = setupSwagger;
