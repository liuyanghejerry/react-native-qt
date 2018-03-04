const { createElement } = require('./elements');
const DesktopRenderer = require('./reconciler');

function render(element) {
  const container = createElement('ROOT');
  const node = DesktopRenderer.createContainer(container);

  DesktopRenderer.updateContainer(element, node, null);
  return container;
}

module.exports = render;
