import pino from 'pino';
import { Logger } from '@/types';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger: Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Disable transport to avoid worker thread issues in Next.js
  // transport: isDevelopment ? {
  //   target: 'pino-pretty',
  //   options: {
  //     colorize: true,
  //     translateTime: 'SYS:standard',
  //     ignore: 'pid,hostname',
  //   },
  // } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
