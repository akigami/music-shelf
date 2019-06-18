import React, { Component } from 'react';
import truncate from 'lodash/truncate';
import Palette from 'react-palette';
import ReactDOM from 'react-dom';
import connect from '@vkontakte/vkui-connect';
import { Tooltip } from 'react-tippy';
import FaTimes from 'react-icons/lib/fa/close';
import PlayIcon from 'react-icons/lib/md/play-arrow';
import ReactPlayer from 'react-player';
import Modal from 'react-responsive-modal';
import DiskIcon from 'react-icons/lib/md/disc-full';
import { Consumer } from './ModalContext';
import Button from './Button';


const modalRoot = document.querySelector('#modal');

class ModalVideo extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

class MoreModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: null,
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
  }
  handleOpenModal(type, item) {
    console.log('kek');
    let modal;
    if (type == 'mv' || type == 'video') {
      modal = (
        <ModalVideo>
          <div className="modal">
            <div className="player-wrapper">
              <ReactPlayer
                className="react-player"
                url={item}
                controls
                playing
                muted
                width='100%'
                height='100%'
              />
              <FaTimes
                style={{ position: 'absolute', top: 0, right: 0 }}
                onClick={this.handleOpenModal}
                size={28}
                color="white"
                className="clickable"
              />
            </div>
          </div>
        </ModalVideo>
      );
    }
    this.setState({ modal });
  }
  renderCover(item, palette) {
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
  renderWithPalette(item) {
    return (
      <Palette image={item.cover}>
        {(palette) => this.renderCover(item, palette)}
      </Palette>
    );
  }
  renderBody(item) {
    const cover = item.covers.length ? item.covers.find((i) => i.type == 'p').url : null;
    const coverProps = { ...item, cover };
    const media = item.type.filter(e => (e.video || e.mv));
    return (
      <div>
        <div className="modal-heading">
          <div
            className="modal-heading-bg"
            style={cover ? {
              backgroundImage: `url(${cover})`,
            } : {}}
          />
        </div>
        <div className="modal-head">
          {cover ? this.renderWithPalette(coverProps) : this.renderCover(coverProps)}
          <div className="modal-head-info">
            <div className="modal-head-title">
              {truncate(item.title, {
                'length': 49,
                'separator': /,? +/
              })}
            </div>
            <div className="modal-head-artist">
              {item.artist}
            </div>
            <div className="modal-head-anime">
               {`${item.typeTitle} | ${item.anime}`}
            </div>
          </div>
        </div>
        {media.length > 0 && (
          <div className="modal-content">
            {media.map((i, idx) => (
              <div key={idx} className="modal-content-type container">
                <h3>{i.type}</h3>
                <div className="media-content">
                  {i.mv && (
                    <div className="media-col">
                      <button
                        onClick={() => this.handleOpenModal('mv', i.mv)}
                        className="media-item"
                      >
                        <div className="media-icon">
                          <PlayIcon />
                        </div>
                        <div className="media-title">Music Video</div>
                      </button>
                    </div>
                  )}
                  {i.video && (
                    <div className="media-col">
                      <button
                        onClick={() => this.handleOpenModal('video', i.video)}
                        className="media-item"
                      >
                        <div className="media-icon">
                          <PlayIcon />
                        </div>
                        <div className="media-title">TV size</div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          {item.uploaded && (
            <React.Fragment>
              <Button
                as="a"
                block
                // onClick={() => {
                //   const hash = item.link.split('/')[3];
                //   connect.send("VKWebAppSetLocation", {
                //     location: hash,
                //   });
                // }}
                href={item.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Открыть пост
              </Button>
              <Tooltip
                arrow
                title="Временно недоступно"
                position="bottom"
                size="small"
                animateFill={false}
                style={{ width: '100%' }}
              >
                <Button block disabled>
                  Перейти в плейлист
                </Button>
              </Tooltip>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
  render() {
    const { modal } = this.props;
    return (
      <React.Fragment>
        {modal}
        <Consumer>
          {({ isOpenModal, itemModal, onCloseModal }) => (
            <Modal
              open={isOpenModal}
              onClose={onCloseModal}
              center
              animationDuration={300}
              closeIconSize={32}
              closeIconSvgPath={(
                <path
                  fill="currentColor"
                  d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z"
                />
              )}
              classNames={{
                modal: 'shelf-modal',
                overlay: 'shelf-overlay',
                closeButton: 'shelf-closeButton',
                closeIcon: 'shelf-closeIcon',
              }}
            >
              {isOpenModal && this.renderBody(itemModal)}
            </Modal>
          )}
        </Consumer>
      </React.Fragment>
    );
  }
}

export default MoreModal;