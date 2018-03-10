const { createWidget } = require('../../qt');
const Component = require('./Component');


class Widget extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...props,
    };
    this.widget = createWidget();
  }

  render(parent) {
    this.renderChildren(this);
    this.widget.show();
  }
}


module.exports = Widget;
