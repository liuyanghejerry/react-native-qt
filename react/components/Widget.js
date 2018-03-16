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
  }

  update(oldProps, newProps) {
    if (newProps.layout !== oldProps.layout) {
      this.widget.setLayout(newProps.layout);
    }
  }

  render(parent) {
    this.renderChildren(this);
    this.widget.show();
  }
}

Widget.PropTypes = {
  layout: PropTypes.number,
};

Widget.defaultProps = {
  layout: 1,
};



module.exports = Widget;
