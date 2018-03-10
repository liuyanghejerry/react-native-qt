const Root = require('./components/Root');
const Widget = require('./components/Widget');
const { ROOT_NODE } = require('./render');

// Creates an element with an element type, props and a root instance
function createElement(type, props) {
  const COMPONENTS = {
    ROOT: () => new Root(props),
    WIDGET: () => new Widget(ROOT_NODE, props),
    default: undefined,
  };

  return COMPONENTS[type]() || COMPONENTS.default;
}

module.exports = { createElement };
