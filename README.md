@cisl/logger
============

This is a NPM module that wraps around the [winston](https://www.npmjs.com/package/winston) logging
library to take advantage of the `cog.json` file for configuration. This allows for easier usage
within cogs as it does not require knowing the boilerplate of using winston and the parts of the
`cog.json`. This is largely compatible with the existing function/usage of `@cel/logger`.

Installation
============
```
npm install @cisl/logger
```

Usage
=====
```javascript
const logger = require('@cisl/logger');
logger.debug('debug');
logger.verbose(1);
logger.info('info');
logger.warn({test: 'aaaa', foo: 'bar'});
logger.error('error');
logger.setLogLevel('warn');
logger.logExpression('some message', 'info');
logger.logExpression('some error', 0);
```

Note: For logging throw exceptions, you should either cast it to a string (e.g.
```logger.info(`${new Error('test')}`))```) or pass specific parts of the
exception as strings:
```javascript
const err = new Error('test');
logger.error(err.message);
logger.error(err.stack);
```
Attempting to log the Error object as-is will end up with just logging `undefined`.

Configuration
=============
As stated above, the logger uses the `cog.json` file in the current working
directory to configure itself. By default, the logger will always log to console
and be set to a level of `info`. This can be tuned, as well as adding additional
transports, by adding a `logging` block to the `cog.json`, using the following keys:
```
{
  logging: {
    info: "level" // String specifying level to log at, defaults to 'info'
    console: true|false // Boolean flag to turn on/off console logging, defaults to true.
    file: "filename" // string for file to write log to
    db: true|false // Boolean flag to turn on/off logging to MongoDB, defaults to false
  }
}
```

If no `cog.json` exists, then it uses a default of log level `info` and uses the
console.

Function Signatures
===================
* error(msg: string | object): void
* warn(msg: string | object): void
* info(msg: string | object): void
* verbose(msg: string | object): void
* debug(msg: string | object): void
* silly(msg: string | object): void
* setLogLevel(level: string | number): void
* logExpression(msg: string | object, level: string | number)

Where `msg` is the message to log and then `level` is a specific log level to use (see below).

Log Levels
----------
The `setLogLevel` and `logExpression` functions both allow passing in a string or
number to them. Strings should be equal to one of the following available levels:
[*] error
[*] warn
[*] info
[*] verbose
[*] debug
[*] silly

Each of these strings can also be used as the function name on the `logger` object:
```
logger.error(msg);
logger.warn(msg);
logger.info(msg);
logger.verbose(msg);
logger.debug(msg);
logger.silly(msg);
```

If you use a number, these correspond to the following levels (being backwards
compatible with `@cel/logger`):
```
const levels = {
  0: error,
  1: warn,
  2: info,
  3: debug
}
```
