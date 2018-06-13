import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

export default function shouldFocus(Focusable) {
  return class extends Component {
    componentDidMount() {
      if (this.props.shouldFocus) {
        this.focusable.focus();
      }
    }

    componentDidUpdate(prevProps) {
      if (this.props.shouldFocus && !prevProps.shouldFocus) {
        this.focusable.focus();
      }
    }

    get focusable() {
      return findDOMNode(this);
    }

    render() {
      return (
        <Focusable {...this.props} />
      );
    }
  };
}
