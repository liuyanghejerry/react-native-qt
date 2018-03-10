const { startUiLoop } = require('../../qt');
const Component = require('./Component');

class Root extends Component {
  constructor() {
    super();
    startUiLoop();
  }

  render() {
    this.renderChildren(this);
  }
}

module.exports = Root;
