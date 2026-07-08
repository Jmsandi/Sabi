export async function retry(operation, options) {
  const { maxAttempts, baseDelayMs, sleep, logger, shouldRetry = () => true } = options;
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
      logger.warn('Retrying AI provider call', { attempt, delayMs, error: error.message });
      await sleep(delayMs);
    }
  }

  throw lastError;
}
