import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;

      const cleanedErrors = zodError.issues.map((e) => {
        const fieldName = e.path.join(".") || "field";
        const prefix = "Invalid input: ";

        // Clean the raw message
        let message = e.message.startsWith(prefix)
          ? e.message.slice(prefix.length)
          : e.message;

        // Capitalize first letter
        message = message.charAt(0).toUpperCase() + message.slice(1);

        // Prepend field name inside the message if not already there
        // (Avoid duplication if message already includes the field)
        if (!message.toLowerCase().includes(fieldName.toLowerCase())) {
          message = `${
            fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
          } ${message}`;
        }

        return {
          field: fieldName,
          message,
        };
      });

      return res.status(422).json({
        status: 0,
        message: "Validation failed",
        errors: cleanedErrors,
      });
    }

    req.body = result.data; // Safe parsed and typed
    next();
  };
};
