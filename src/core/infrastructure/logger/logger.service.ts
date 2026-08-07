import pino, { Logger } from 'pino';

export type AppLogger = Logger;

export function createLogger(name: string): AppLogger {
  return pino({
    name,
    level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined
  });
}

export const rootLogger = createLogger('app');
