import { z } from "zod";

// Regex for strong password
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current Password is required"),
    newPassword: z
      .string()
      .min(8, "New Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmNewPassword: z.string().min(1, "Confirm New Password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
