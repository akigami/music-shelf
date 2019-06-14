import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper, Scroll, Inner, Item, Shade } from './Glide.styles';

class Glide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canScrollNext: false,
      canScrollPrev: false,
    };
    this.scroll = React.createRef();
    this.effectManager = this.effectManager.bind(this);
    this.scrollEffectHandler = this.scrollEffectHandler.bind(this);
    this.enableHorizontalScroll = this.enableHorizontalScroll.bind(this);
    this.disableHorizontalScroll = this.disableHorizontalScroll.bind(this);
    this.listenerHorizontalScroll = this.listenerHorizontalScroll.bind(this);
  }

  componentDidMount() {
    const { effect, horizontalScroll } = this.props;
    if (effect) {
      const { left: percent } = this.scroll.current.getValues();
      this.effectManager(percent);
    }
    if (horizontalScroll) {
      this.enableHorizontalScroll();
    }
  }

  componentWillUnmount() {
    const { horizontalScroll } = this.props;
    if (horizontalScroll) {
      this.disableHorizontalScroll();
    }
  }

  enableHorizontalScroll() {
    if (this.scroll.current) {
      const el = this.scroll.current.container.childNodes[0];
      el.addEventListener('mousewheel', this.listenerHorizontalScroll, false);
      el.addEventListener('DOMMouseScroll', this.listenerHorizontalScroll, false);
    }
  }

  disableHorizontalScroll() {
    if (this.scroll.current) {
      const el = this.scroll.current.container.childNodes[0];
      el.removeEventListener('mousewheel', this.listenerHorizontalScroll, false);
      el.removeEventListener('DOMMouseScroll', this.listenerHorizontalScroll, false);
    }
  }

  listenerHorizontalScroll(e) {
    const { speed, lockScroll } = this.props;
    const el = this.scroll.current.container.childNodes[0];
    const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    const prevScroll = el.scrollLeft;
    el.scrollLeft -= (delta * speed);
    if (prevScroll !== el.scrollLeft) {
      e.preventDefault();
    } else if (lockScroll) {
      e.preventDefault();
    }
  }

  scrollEffectHandler(values) {
    this.effectManager(values.left);
  }

  effectManager(percent) {
    this.setState({
      canScrollNext: percent < 1,
      canScrollPrev: percent > 0,
    });
  }

  render() {
    const { canScrollPrev, canScrollNext } = this.state;
    const { items, effect, effectColor, reach, ItemComponent, ...props } = this.props;
    const shadeProps = {
      color: effect ? effectColor: null,
      reach,
    };
    return (
      <Wrapper>
        <Shade
          position="left"
          visible={canScrollPrev}
          {...shadeProps}
        />
        <Scroll
          autoHide
          universal
          autoWidth
          autoHeight
          autoHeightMax="100%"
          {...props}
          ref={this.scroll}
          onScrollFrame={effect ? this.scrollEffectHandler : null}
        >
          <Inner>
            {items.map(item => (
              <Item className="glide-item" key={item.id}>
                <ItemComponent item={item} />
              </Item>
            ))}
          </Inner>
        </Scroll>
        <Shade
          position="right"
          visible={canScrollNext}
          {...shadeProps}
        />
      </Wrapper>
    );
  }
}

Glide.propTypes = {
  speed: PropTypes.number,
  reach: PropTypes.number,
  effect: PropTypes.bool,
  lockScroll: PropTypes.bool,
  effectColor: PropTypes.string,
  horizontalScroll: PropTypes.bool,
  ItemComponent: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  })),
};

Glide.defaultProps = {
  speed: 40,
  reach: 30,
  lockScroll: false,
  effect: false,
  effectColor: '',
  horizontalScroll: false,
  ItemComponent: ({ children }) => <div>{children}</div>,
  items: [],
};

export default Glide;
