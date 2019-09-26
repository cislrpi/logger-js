import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { MongoDB } from 'winston-mongodb';

declare module 'winston-mongodb' {
  const MongoDB: MongoDBTransportInstance;
}

const log_levels = ['error', 'warn', 'info', 'debug'];
const config_file = path.resolve('cog.json');

let level = 'info';

declare module 'winston' {
  interface Logger {
    setLogLevel(level: number | string): void;
    logExpression(msg: string, level: number | string): void;
  }
}

interface Logging {
  level: string;
  console: undefined | boolean;
  file: undefined | string;
  db: undefined | boolean;
  timestamp_format: string;
}

interface Config {
  log: undefined | string;
  logging: undefined | Logging;
}

let config: Config;

let config_obj: object | undefined;

if (fs.existsSync(config_file)) {
  try {
    config_obj = JSON.parse(fs.readFileSync(config_file, {encoding: 'utf-8'}));
  }
  catch (e) {
    console.error('Error: could not parse cog.json file');
    console.error(e);
    process.exit(-1);
  }
}

if (config_obj) {
  config = config_obj as Config;
}
else {
  config = {
    log: undefined,
    logging: undefined
  };
}

// If we haven't defined anything in the config file, assume
// we want to log info+, to the console, and format is just
// timestamp with no date (YYYY-MM-DD).
if (config.logging === undefined) {
  config.logging = {
    level: 'info',
    console: true,
    file: undefined,
    db: undefined,
    timestamp_format: 'hh:mm:ss.SS'
  };
}

const winston_timestamp = winston.format.timestamp({
  format: config.logging.timestamp_format
});
const winston_printf = winston.format.printf((info): string => {
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

const logger = winston.createLogger({
  level: level,
  format: default_format,
  transports: []
});

if (config.logging) {
  if (config.logging.level) {
    level = config.logging.level;
  }
  // Unless explicitly asked not to, log to console
  if (config.logging.console !== false) {
    logger.transports.push(new winston.transports.Console({format: colorized_format}));
  }
  if (config.logging.file && typeof config.logging.file === 'string') {
    // resolve to an absolute path for logging
    config.logging.file = path.resolve(config.logging.file);
    if (!fs.existsSync(path.dirname(config.logging.file))) {
      // Recursively attempt to create directories as necessary for logging
      path.dirname(config.logging.file)
        .split(path.sep)
        .reduce((currentPath, folder): string => {
          currentPath += folder + path.sep;
          if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
          }
          return currentPath;
        }, '');
    }
    logger.transports.push(new winston.transports.File({filename: config.logging.file}));
  }
  if (config.logging.db) {
    logger.transports.push(new MongoDB());
  }
}

/**
 * Set the log level for the logger.
 * @param {number|string} level Level to set logger at
 * @return {void}
 */
logger.setLogLevel = (level: number | string): void => {
  logger.warn('setLogLevel');
  let str_level: string;
  if (typeof level === 'number') {
    if (level < 0 || level >= log_levels.length) {
      return;
    }
    str_level = log_levels[level];
  }
  else {
    str_level = level;
  }

  logger.level = str_level.toLowerCase();
};

function isLogLevel(level: string): level is "debug" | "info" | "warn" | "error" {
  return log_levels.includes(level);
}

/**
 * Write a message to the log given some level
 * @param {string} msg Message to log
 * @param {number|string} level  Level to log message at
 * @return {void}
 */
logger.logExpression = (msg: string, level: number | string): void => {
  let str_level: string = (typeof level === 'number') ? log_levels[level] : level.toLowerCase();
  
  if (isLogLevel(str_level)) {
    logger[str_level](msg);
  }
};

export = logger;
