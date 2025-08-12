import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().url("Image must be a valid URL"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    message: "Status must be either ACTIVE or INACTIVE",
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
