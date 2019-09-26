import fs from 'fs';
import path from 'path';
import winston from 'winston';
let MongoDB;

try {
  MongoDB = require('winston-mongodb').MongoDB;
}
catch (ex) {
  MongoDB = false;
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
  console: boolean;
  file?: string;
  mongo?: string;
  timestamp_format: string;
}

interface Config {
  logging: Logging;
}

const config: Config = {
  logging: {
    level: 'info',
    console: true,
    timestamp_format: 'hh:mm:ss.SS'
  }
};

if (fs.existsSync(config_file)) {
  try {
    const config_obj = JSON.parse(fs.readFileSync(config_file, {encoding: 'utf-8'}));
    if (!config_obj.logging) {
      config_obj.logging = {};
    }
    if (config_obj.log) {
      config_obj.logging.file = config_obj.log;
    }
    if (config_obj.logging) {
      config.logging = Object.assign(
        config.logging,
        config_obj.logging
      );
    }
  }
  catch (e) {
    console.error('Error: could not parse cog.json file');
    console.error(e);
    process.exit(-1);
  }
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

const logger = winston.createLogger({
  level: level,
  format: default_format,
  transports: []
});

if (config.logging.level) {
  level = config.logging.level;
}
// Unless explicitly asked not to, log to console
if (config.logging.console !== false) {
  logger.add(new winston.transports.Console({format: colorized_format}));
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
  logger.add(new winston.transports.File({filename: config.logging.file}));
}
if (config.logging.mongo) {
  if (!MongoDB) {
    console.error('Error: could not load winston-mongodb. Is this installed as a dependency?');
    process.exit();
  }
  logger.add(new MongoDB({
    db: config.logging.mongo,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }));
}

/**
 * Set the log level for the logger.
 * @param level Level to set logger at
 */
logger.setLogLevel = (level: number | string): void => {
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

  logger.warn(`setLogLevel: ${str_level.toUpperCase()}`);
  logger.level = str_level.toLowerCase();
};

function isLogLevel(level: string): level is "debug" | "info" | "warn" | "error" {
  return log_levels.includes(level);
}

/**
 * Write a message to the log given some level
 * @param msg Message to log
 * @param level  Level to log message at
 */
logger.logExpression = (msg: string, level: number | string): void => {
  const str_level = (typeof level === 'number') ? log_levels[level] : level.toLowerCase();

  if (isLogLevel(str_level)) {
    logger[str_level](msg);
  }
};

export = logger;
