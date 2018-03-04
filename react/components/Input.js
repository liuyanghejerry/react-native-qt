const PropTypes = require('prop-types');
const { createInput } = require('../../qt');
const Component = require('./Component');


class Input extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...Input.defaultProps,
      ...props,
    };
    this.widget = createInput();
    this.widget.setText(this.props.text);
    this.widget.returnPressed(this.props.returnPressed);
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

Input.PropTypes = {
  text: PropTypes.string,
  returnPressed: PropTypes.func,
};

Input.defaultProps = {
  text: '',
  returnPressed: () => {},
};


module.exports = Input;
