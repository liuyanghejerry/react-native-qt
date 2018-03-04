const PropTypes = require('prop-types');
const { createLabel } = require('../../qt');
const Component = require('./Component');


class Label extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...Label.defaultProps,
      ...props,
    };
    this.widget = createLabel();
    this.widget.setText(this.props.text);
  }

  update(oldProps, newProps) {
    if (newProps.text !== oldProps.text) {
      this.widget.setText(newProps.text);
    }
  }

  render(parent) {
    this.renderChildren(this);
    this.widget.show();
  }
}

Label.PropTypes = {
  text: PropTypes.string,
};

Label.defaultProps = {
  text: '',
};


module.exports = Label;
