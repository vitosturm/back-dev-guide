export const code = `import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = Number((err as any).cause?.status) || 500;
  res.status(status).json({ message: err.message });
};

export default errorHandler;

// Usage in controllers:
//   throw new Error('Post not found', { cause: { status: 404 } });
//
// cause.status travels with the error — the handler extracts it here.
// Without cause, status defaults to 500 (Internal Server Error).
`
