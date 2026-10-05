export function apiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    if ('detail' in error && typeof error.detail === 'string')
      return error.detail;
    if ('message' in error && typeof error.message === 'string')
      return error.message;
    if ('detail' in error && Array.isArray(error.detail)) {
      const messages = error.detail.flatMap(item =>
        typeof item === 'object' &&
        item !== null &&
        'msg' in item &&
        typeof item.msg === 'string'
          ? [item.msg]
          : []
      );
      if (messages.length) return messages.join('; ');
    }
  }
  return 'The request failed. Please try again.';
}
