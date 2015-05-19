
var logLevel = null;

function logExpression(expression, level) {
  
  if (logLevel == null) {
    logLevel = 1;
  }
  
  if (level > logLevel) return;
  
  else {

    var date = new Date();
    var year = insertZeroes(date.getFullYear(), 4);
    var month = insertZeroes(date.getMonth() + 1, 2);
    var day = insertZeroes(date.getDate(), 2);
    var hour = insertZeroes(date.getHours(), 2);
    var minute = insertZeroes(date.getMinutes(), 2);
    var second = insertZeroes(date.getSeconds(), 2);
    var msec = insertZeroes(date.getMilliseconds(), 3);
    
    if (typeof(expression) == 'string') {
      console.log('[' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + msec + '] ' + expression);  
    }
    
    else if (typeof(expression) == 'object') {
      console.log('[' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + msec + '] ' + JSON.stringify(expression,null,2));  
    }

    return;
  }
}

function insertZeroes(num, len) {
  var text = '' + num;
  while(text.length < len) {
    text = '0' + text;
  }
  return text;
}

function setLogLevel(level) {
  logLevel = level;
}

//test();

function test() {

  logExpression('important', 1);
  logExpression('less important', 2);

  var JSONstuff = {
    "msg": "Here is an important message.",
    "msg2": "Here is a less important message."
  };

  logExpression(JSONstuff, 1);
  logExpression(JSONstuff, 2);
}

exports = module.exports = {
    logExpression: logExpression,
    setLogLevel: setLogLevel,
    insertZeroes: insertZeroes
}
