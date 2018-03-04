const PropTypes = require('prop-types');
const { createButton } = require('../../qt');
const Component = require('./Component');


class Button extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...Button.defaultProps,
      ...props,
    };
    this.widget = createButton();
    this.widget.setText(this.props.text);
    this.widget.clicked(this.props.clicked);
  }

  update(oldProps, newProps) {
    // console.log('Button props update');
    if (newProps.text !== oldProps.text) {
      this.widget.setText(newProps.text);
    }
  }

  render(parent) {
    console.log('Button.render()');
    this.renderChildren(this);
    this.widget.show();
  }
}

Button.PropTypes = {
  text: PropTypes.string,
  clicked: PropTypes.func,
};

Button.defaultProps = {
  text: '',
  clicked: () => {},
};

module.exports = Button;
