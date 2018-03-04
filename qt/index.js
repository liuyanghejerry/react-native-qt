const { setInterval, setTimeout } = require('timers');

const addon = require('../build/Release/addon');
const widgets = require('./widgets');

let loopTimerHandle = null;

function startUiLoop() {
  console.log('startUiLoop');
  addon.processEvents();
  loopTimerHandle = setInterval(() => addon.processEvents(), 0);
}

function stopUiLoop() {
  console.log('stopUiLoop');
  loopTimerHandle ? clearInterval(loopTimerHandle) : null;
}

function appendExports() {
  return widgets.forEach(({widgetName}) => {
    const name = `create${widgetName}`;
    module.exports[`create${widgetName}`] = addon[name];
  });
}

module.exports = {
  startUiLoop,
  stopUiLoop,
  createWidget: addon.createWidget,
};

appendExports();
