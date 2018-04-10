import React, { Component } from 'react';

export default function a11yFocus(FocusedComponent) {
  return class extends Component {
    componentDidMount() {
      this.node.focus();
    }

    render() {
      return (
        <div ref={n => this.node = n} tabIndex="-1">
          <FocusedComponent {...this.props} />
        </div>
      );
    }
  };
}
