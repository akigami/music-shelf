import React, { Component } from 'react';
import get from 'lodash/get';
import DiskIcon from 'react-icons/lib/md/disc-full';
import { Consumer } from './ModalContext';

class CoverItem extends Component {
  constructor(props) {
    super(props);
    this.renderCover = this.renderCover.bind(this);
  }
  renderCover() {
    const { item } = this.props;
    const cover = item.covers.length ? item.covers.find((i) => i.type == 'p').url : null;
    return (
      <div
        className="cover-item-cover"
        style={cover ? {
          backgroundImage: `url(${cover})`,
          ...(cover ? { boxShadow: `0 9px 16px -8px ${item.shadowColor}88`, } : {}),
        } : {}}
      >
        {!cover && (
          <DiskIcon />
        )}
      </div>
    );
  }
  render() {
    const { item } = this.props;
    const types = get(item, 'type', []);
    const type = types.map(e => e.type).join(' & ');
    const cover = item.covers.length ? item.covers.find((i) => i.type == 'p').url : null;
    return (
      <Consumer>
        {({ onOpenModal }) => (
          <button
            type="button"
            className="cover-item"
            onClick={() => onOpenModal({
              ...item,
              typeTitle: type,
            })}
          >
            {this.renderCover()}
            <div className="cover-item-title">
              {item.title}
            </div>
            <div className="cover-item-artist">
              {item.artist}
            </div>
            <div className="cover-item-anime">
              {`${type} | ${item.anime}`}
            </div>
          </button>
        )}
      </Consumer>
    );
  }
}

export default CoverItem;