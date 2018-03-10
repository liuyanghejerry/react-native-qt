const { setInterval, setTimeout } = require('timers');

const addon = require('../build/Release/addon');

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

module.exports = {
  startUiLoop,
  stopUiLoop,
  createWidget: addon.createWidget,
};
