const addon = require('./build/Release/addon');

console.log('hello,', (new addon.createObject()).getValue());
// or:
// console.log('hello,', addon.createObject().getValue());
