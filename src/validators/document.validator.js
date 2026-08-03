const { z } = require("zod");

const contentSchema = z.union([
  z.string(),
  z.record(z.any()),
  z.array(z.any()),
]).optional();

const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255, "Title cannot exceed 255 characters")
    .optional(),
  content: contentSchema,
});

const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .optional(),
  content: contentSchema,
});

const queryDocumentSchema = z.object({
  search: z.string().trim().optional(),
  filter: z.enum(["all", "owned", "recent", "shared"]).optional().default("all"),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

module.exports = {
  createDocumentSchema,
  updateDocumentSchema,
  queryDocumentSchema,
};
