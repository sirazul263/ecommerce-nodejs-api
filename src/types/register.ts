import { z } from "zod";

// Unicode regex for letters, spaces, and hyphens
const nameRegex = /^[\p{L} \-]+$/u;
// Regex for strong password
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First Name is required")
      .regex(
        nameRegex,
        "First Name must contain only letters, spaces, or hyphens"
      ),
    lastName: z
      .string()
      .min(1, "Last Name is required")
      .regex(
        nameRegex,
        "Last Name must contain only letters, spaces, or hyphens"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
