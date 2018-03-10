const { createElement } = require('./elements');
const DesktopRenderer = require('./reconciler');

let ROOT_NODE = {};

// Renders the input component
function render(element) {
  ROOT_NODE = createElement('ROOT');
  const container = ROOT_NODE;

  // Returns the current fiber (flushed fiber)
  const node = DesktopRenderer.createContainer(ROOT_NODE);

  // Schedules a top level update with current fiber and a priority level (depending upon the context)
  DesktopRenderer.updateContainer(element, node, null);
  container.render();
}

render.ROOT_NODE = ROOT_NODE;
module.exports = render;
