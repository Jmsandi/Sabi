const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

export function isRetryableStatus(statusCode) {
  return RETRYABLE_STATUS_CODES.has(statusCode);
}

// A dead connection makes fetch throw a TypeError ("fetch failed"), usually
// wrapping a socket error underneath. Worth another shot.
export function isNetworkError(error) {
  if (!error) {
    return false;
  }
  if (error.name === 'TypeError') {
    return true;
  }
  return RETRYABLE_NETWORK_CODES.has(error.code) || RETRYABLE_NETWORK_CODES.has(error.cause?.code);
}

export async function withRetry(operation, options) {
  const {
    maxAttempts,
    baseDelayMs,
    sleep,
    logger,
    shouldRetry = () => true,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = baseDelayMs * 2 ** (attempt - 1);
      logger.warn('Retrying transient OpenAlex request failure', {
        attempt,
        delayMs,
        error: error.message,
      });
      await sleep(delayMs);
    }
  }

  throw lastError;
}
