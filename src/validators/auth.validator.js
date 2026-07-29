const { z } = require("zod");

const passwordPolicyMessage =
  "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";

const passwordPolicySchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const hasNoSpaces = !/\s/.test(value);

    if (
      !hasMinLength ||
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecial ||
      !hasNoSpaces
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordPolicyMessage,
      });
    }
  });

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email"),
  password: passwordPolicySchema,
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
