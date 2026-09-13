/**
 * Simple structured logger for CCL AssetFlow Backend
 * Wraps console with log-level prefixes, timestamps and environment checks.
 */

const isProd = process.env.NODE_ENV === 'production';

const timestamp = () => new Date().toISOString();

const logger = {
  info: (message, meta = '') => {
    console.info(`[${timestamp()}] [INFO]  ${message}`, meta);
  },

  warn: (message, meta = '') => {
    console.warn(`[${timestamp()}] [WARN]  ${message}`, meta);
  },

  error: (message, meta = '') => {
    console.error(`[${timestamp()}] [ERROR] ${message}`, meta);
  },

  debug: (message, meta = '') => {
    if (!isProd) {
      console.debug(`[${timestamp()}] [DEBUG] ${message}`, meta);
    }
  },
};

module.exports = logger;
