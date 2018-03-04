const Root = require('./components/Root');
const Button = require('./components/Button');
const Widget = require('./components/Widget');
const Input = require('./components/Input');
const Label = require('./components/Label');
const { ROOT_NODE } = require('./render');

// Creates an element with an element type, props and a root instance
function createElement(type, props) {
  const COMPONENTS = {
    ROOT: () => new Root(props),
    WIDGET: () => new Widget(ROOT_NODE, props),
    BUTTON: () => new Button(ROOT_NODE, props),
    INPUT: () => new Input(ROOT_NODE, props),
    LABEL: () => new Label(ROOT_NODE, props),
    default: undefined,
  };

  return COMPONENTS[type]() || COMPONENTS.default;
}

module.exports = { createElement };
