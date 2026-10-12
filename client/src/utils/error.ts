export const getErrorStatusCode = (error: unknown): number | undefined => {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }
};

export const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if (
    "statusMessage" in error &&
    typeof error.statusMessage === "string" &&
    error.statusMessage
  ) {
    return error.statusMessage;
  }
  if (
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message;
  }
};
