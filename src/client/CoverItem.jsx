import React, { Component } from 'react';
import get from 'lodash/get';
import Palette from 'react-palette';
import DiskIcon from 'react-icons/lib/md/disc-full';

class CoverItem extends Component {
  constructor(props) {
    super(props);
    this.renderCover = this.renderCover.bind(this);
    this.renderWithPalette = this.renderWithPalette.bind(this);
  }
  renderCover(palette) {
    const { item } = this.props;
    return (
      <div
        className="cover-item-cover"
        style={item.cover ? {
          backgroundImage: `url(${item.cover})`,
          ...(palette ? { boxShadow: `0 9px 16px -8px ${palette.vibrant}88`, } : {}),
        } : {}}
      >
        {!item.cover && (
          <DiskIcon />
        )}
      </div>
    );
  }
  renderWithPalette() {
    const { item } = this.props;
    return (
      <Palette image={item.cover}>
        {this.renderCover}
      </Palette>
    );
  }
  render() {
    const { item } = this.props;
    const types = get(item, 'type', []);
    const type = types.map(e => e.type).join(' & ');
    return (
      <div className="cover-item">
        {item.cover ? this.renderWithPalette() : this.renderCover()}
        <div className="cover-item-title">
          {item.title}
        </div>
        <div className="cover-item-artist">
          {item.artist}
        </div>
        <div className="cover-item-anime">
          {`${type} | ${item.anime}`}
        </div>
      </div>
    );
  }
}

export default CoverItem;