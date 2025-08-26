// Custom error classes for better error handling

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ImageProcessingError extends Error {
  constructor(message: string, public step?: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}
