export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[NOVA OS :: INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[NOVA OS :: WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(`[NOVA OS :: ERROR] ${new Date().toISOString()} - ${message}`, error, meta ? JSON.stringify(meta) : '');
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[NOVA OS :: DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
};
