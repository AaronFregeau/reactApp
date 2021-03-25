import React, { Component, useState } from 'react';


export default class InputForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        inputValue: ''
      };
    }
  
    render() {
      return (
 
        <input value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)}
        style={{ margin: '25px 15px 5px 15px' }}/>
      );
    }
  
    updateInputValue(evt) {
      this.setState({
        inputValue: evt.target.value
      });
    }
}