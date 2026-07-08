export function createLogger(scope = 'openalex') {
  return {
    info(message, metadata = {}) {
      console.log(JSON.stringify({ level: 'info', scope, message, ...metadata }));
    },
    warn(message, metadata = {}) {
      console.warn(JSON.stringify({ level: 'warn', scope, message, ...metadata }));
    },
    error(message, metadata = {}) {
      console.error(JSON.stringify({ level: 'error', scope, message, ...metadata }));
    },
  };
}
