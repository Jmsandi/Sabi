export function createLogger(scope = 'b1-ingestion') {
  function write(level, message, metadata = {}) {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
      ...metadata,
    });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }

  return {
    info: (message, metadata) => write('info', message, metadata),
    warn: (message, metadata) => write('warn', message, metadata),
    error: (message, metadata) => write('error', message, metadata),
  };
}
