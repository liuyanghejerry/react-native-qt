const PropTypes = require('prop-types');
const { createWidget } = require('../../qt');
const Component = require('./Component');


class Widget extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...Widget.defaultProps,
      ...props,
    };
    this.widget = createWidget();
    this.widget.setLayout(this.props.layout);
    this.widget.setWindowTitle(this.props.windowTitle);
  }

  update(oldProps, newProps) {
    if (newProps.windowTitle !== oldProps.windowTitle) {
      this.widget.setWindowTitle(newProps.windowTitle);
    }
  }

  render(parent) {
    this.renderChildren(this);
    this.widget.show();
  }
}

Widget.PropTypes = {
  windowTitle: PropTypes.string,
  layout: PropTypes.number,
};

Widget.defaultProps = {
  windowTitle: '',
  layout: 1,
};


module.exports = Widget;
