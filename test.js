const logger = require('./dist/logger');

logger.info('test');
logger.warn('warn');
logger.error('error');

logger.setLogLevel('warn');
logger.info('does not show');
logger.warn('will show');
