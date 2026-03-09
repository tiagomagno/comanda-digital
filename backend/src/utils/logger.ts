/**
 * Logger estruturado simples
 * TODO: Considerar usar Winston ou Pino em produção
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    [key: string]: any;
}

function formatLog(entry: LogEntry): string {
    const { level, message, timestamp, ...meta } = entry;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
    info: (message: string, meta?: Record<string, any>) => {
        const entry: LogEntry = {
            level: 'info',
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };
        console.log(formatLog(entry));
    },

    warn: (message: string, meta?: Record<string, any>) => {
        const entry: LogEntry = {
            level: 'warn',
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };
        console.warn(formatLog(entry));
    },

    error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
        const entry: LogEntry = {
            level: 'error',
            message,
            timestamp: new Date().toISOString(),
            ...(error instanceof Error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                },
            }),
            ...meta,
        };
        console.error(formatLog(entry));
    },

    debug: (message: string, meta?: Record<string, any>) => {
        if (process.env.NODE_ENV === 'development') {
            const entry: LogEntry = {
                level: 'debug',
                message,
                timestamp: new Date().toISOString(),
                ...meta,
            };
            console.debug(formatLog(entry));
        }
    },
};
