export function createLogger(scope = 'a3-pipeline') {
  function write(level, message, metadata = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
      ...metadata,
    };
    const line = JSON.stringify(payload);
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
