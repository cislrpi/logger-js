const fs = require('fs');
const path = require('path');
const winston = require('winston');

const log_levels = ['error', 'warn', 'info', 'debug'];
const config_file = path.resolve('cog.json');

let transports = [];
let level = 'info';

let config;

if (fs.existsSync(config_file)) {
  try {
    config = JSON.parse(fs.readFileSync(config_file, {encoding: 'ascii'}));
  }
  catch (e) {
    console.error('Error: could not parse cog.json file');
    console.error(e);
    process.exit(-1);
  }
}

config = config || {};

// If we haven't defined anything in the config file, assume
// we want to log info+, to the console, and format is just
// timestamp with no date (YYYY-MM-DD).
if (config.logging === undefined) {
  config.logging = {
    level: 'info',
    console: true,
    timestamp_format: 'hh:mm:ss.SS'
  };
}

const winston_timestamp = winston.format.timestamp({
  format: config.logging.timestamp_format
});
const winston_printf = winston.format.printf(info => {
  if (typeof info.message === 'object') {
    info.message = '[object Object]\n' + JSON.stringify(info.message, null, 2);
  }
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});
const default_format = winston.format.combine(winston_timestamp, winston_printf);
const colorized_format = winston.format.combine(
  winston.format.colorize(),
  winston_timestamp,
  winston_printf
);

// Shim to support old format
if (config.log) {
  config.logging.file = config.log;
}

if (config.logging) {
  if (config.logging.level) {
    level = config.logging.level;
  }
  // Unless explicitly asked not to, log to console
  if (config.logging.console !== false) {
    transports.push(new winston.transports.Console({format: colorized_format}));
  }
  if (config.logging.file && typeof config.logging.file === 'string') {
    // resolve to an absolute path for logging
    config.logging.file = path.resolve(config.logging.file);
    if (!fs.existsSync(path.dirname(config.logging.file))) {
      // Recursively attempt to create directories as necessary for logging
      path.dirname(config.logging.file)
        .split(path.sep)
        .reduce((currentPath, folder) => {
          currentPath += folder + path.sep;
          if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
          }
          return currentPath;
        }, '');
    }
    transports.push(new winston.transports.File({filename: config.logging.file}));
  }
  if (config.logging.db) {
    transports.push(new winston.transports.MongoDB());
  }
}

const logger = winston.createLogger({
  level: level,
  format: default_format,
  transports: transports
});

/**
 * Set the log level for the logger.
 * @param {number|string} level Level to set logger at
 * @return {void}
 */
logger.setLogLevel = (level) => {
  logger.warn('setLogLevel');
  if (typeof level === 'number' && level >= 0 && level < log_levels.length) {
    level = log_levels[level];
  }
  logger.level = level.toLowerCase();
};

/**
 * Write a message to the log given some level
 * @param {string} msg Message to log
 * @param {number|string} level  Level to log message at
 * @return {void}
 */
logger.logExpression = (msg, level) => {
  if (typeof level === 'number') {
    level = log_levels[level];
  }
  logger[level.toLowerCase()](msg);
};

module.exports = logger;
