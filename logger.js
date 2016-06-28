const
  fs = require('fs'),
  _ = require('lodash'),
  moment = require('moment'),
  mongodb = require('mongodb'),
  assert = require('assert'),
  EventEmitter = require('events').EventEmitter;

var defaults = {};

function Logger(o) {
  var logger = this;
  var opts = this.opts = _.extend({}, defaults, o);

  if (opts.file)
    this.logFile = fs.createWriteStream(opts.file, { flags: 'a' });

  if (opts.db) {
    mongodb.MongoClient.connect(opts.db.url, function(err, db) {
      if (err) {
        logger.emit('db_error', err);
        console.error('Error connecting to mongodb database: ' + opts.db.url);
        return;
      }
      logger.dbColumn = db.collection('log');
      logger.emit('db_connection', db);
    });
  }
}

Logger.prototype.__proto__ = EventEmitter.prototype;

Logger.prototype.write = function(type, message, level) {
  var o = this.opts;
  if (
    (o.min !== undefined && level < o.min) || 
    (o.ax != undefined && level > o.max)
  ) return;

  if (typeof message == 'object')
    message = JSON.stringify(message, null, 2);

  var xpr = `[${moment().format('YYYY-MM-DD hh:mm:ss.SS')}] ${message}`;

  if (
    o.console && 
    !(o.consoleMin !== undefined && level < o.consoleMin) &&
    !(o.consoleMax !== undefined && level > o.consoleMax)
  ) console.log(xpr);

  if (
    o.file && 
    !(o.fileMin !== undefined && level < o.fileMin) &&
    !(o.fileMax !== undefined && level > o.fileMax)
  ) this.logFile.write(xpr + '\n');

  if (
    o.db && 
    !(o.dbMin !== undefined && level < o.dbMin) &&
    !(o.dbMax !== undefined && level > o.dbMax)
  ) this.writeDb(type, message, level);
}

Logger.prototype.writeDb = function(type, message) {
  var logger = this;
  var entry = {
    message: message,
    type: type
  }
  if (logger.dbColumn)
     logger.dbColumn.insert(entry);
  else
    this.once('db_connection', function() {
      logger.dbColumn.insert(entry);
    });
}

Logger.prototype.log = function(message, level) {
  this.write('log', message, level);
}

Logger.prototype.info = function(message, level) {
  this.write('info', message, level);
}

Logger.prototype.warn = function(message, level) {
  this.write('warn', message, level);
}

// Backwards compatibility + warning
var logLevel = 1;
var warned = false;

var warn = function(name) {
  if (warned) return;
  console.warn(`Warning: "${name}" has been deprecated, please use "new Logger()".`)
  warned = true;
}
Logger.setLogLevel = function(level) {
  warn('setLogLevel');
  logLevel = level;
}
Logger.logExpression = function (xpr, level) {
  if (level > logLevel) return;
  xpr = (typeof xpr == 'object') ? JSON.stringify(xpr, null, 2) : xpr;
  console.log(`[${moment().format('YYYY-MM-DD hh:mm:ss.SS')}] ${xpr}`);
}
Logger.insertZeroes = function (num, len) {
  warn('insertZeroes');
  return Array(num).join('0') + text;
}

module.exports = Logger;