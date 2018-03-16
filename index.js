const React = require('react');
const { Component } = require('react');
const Widget = 'WIDGET';
const render = require('./react/render');

class Example extends Component {

  render() {
    return (
      <Widget>
        <Widget></Widget>
      </Widget>
    );
  }
}

render(<Example/>);
