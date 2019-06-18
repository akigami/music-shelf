import React, { Component } from 'react';

class Button extends Component {
  render() {
    const { as = 'button', children, block, ...props } = this.props;
    let classes = ['shelf-button'];
    if (block) {
      classes.push('block');
    } else {
      classes = classes.filter(e => e !== 'block');
    }
    const Component = as;
    return (
      <Component className={classes.join(' ')} {...props}>
        {children}
      </Component>
    );
  }
}

export default Button;