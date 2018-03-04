const React = require('react');
const { Component } = require('react');
const Button = 'BUTTON';
const Widget = 'WIDGET';
const Input = 'INPUT';
const Label = 'LABEL';
const { stopUiLoop } = require('./qt');
const render = require('./react/render');
const testRender = require('./react/test-render');

class Example extends Component {

  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
      buttonText: props.text,
    };
  }

  incCounter() {
    this.setState(prevState => {
      return {
        ...prevState,
        counter: prevState.counter + 1,
        buttonText: `Text-${prevState.counter + 1}`,
      };
    });
  }

  applyInputContent() {
    this.setState(prevState => {
      return {
        ...prevState,
        buttonText: 'fine',
      };
    });
  }

  render() {
    // test native resource delete
    // if (this.state.counter % 2 !== 0) {
    //   setTimeout(() => this.incCounter(), 5000);
    //   return (
    //     <Widget layout={1} windowTitle="Ooops" />
    //   );
    // }
    return (
      <Widget layout={1} windowTitle="Example">
        <Button key={1} text={this.state.buttonText} clicked={this.incCounter.bind(this)}></Button>
        <Button key={2} text={"no-op"}></Button>
        <Button key={3} text={"Exit"} clicked={stopUiLoop}></Button>
        <Widget layout={2}>
          <Button key={4} text={"1"}></Button>
          <Button key={5} text={"2"}></Button>
          <Button key={6} text={"3"}></Button>
        </Widget>
        <Widget layout={2}>
          <Input text="" returnPressed={this.applyInputContent.bind(this)} />
          <Label text="This is a Qt Label." />
        </Widget>
      </Widget>
    );
  }
}

render(<Example text={"hello"}/>);
// console.log(testRender(<Example />));
