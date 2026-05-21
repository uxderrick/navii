/**
 * Tiny structured logger — emits one JSON object per line so it streams cleanly
 * into Docker logs / journalctl. No deps; pino-shaped if we want to swap later.
 */
type Fields = Record<string, unknown>;
type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const min = LEVELS[(process.env['LOG_LEVEL'] as Level) ?? 'info'] ?? 20;

function emit(level: Level, fields: Fields, msg: string) {
  if (LEVELS[level] < min) return;
  const line = JSON.stringify({
    t: new Date().toISOString(),
    level,
    msg,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else console.log(line);
}

export const log = {
  debug: (fields: Fields, msg: string) => emit('debug', fields, msg),
  info: (fields: Fields, msg: string) => emit('info', fields, msg),
  warn: (fields: Fields, msg: string) => emit('warn', fields, msg),
  error: (fields: Fields, msg: string) => emit('error', fields, msg),
};
