// Handles any URL that no route matched
export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

// Central error handler. It must be registered after all routes.
export const errorHandler = (err, req, res, next) => {
  // Validation errors thrown by zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      message: err.issues[0]?.message || "Invalid input",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  // Malformed JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  // Request body bigger than the allowed limit
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request too large" });
  }

  // Anything else is unexpected: log it, but do not leak details to the client
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};