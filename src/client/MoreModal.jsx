import React, { Component } from 'react';
import truncate from 'lodash/truncate';
import ReactDOM from 'react-dom';
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
    let modal;
    if (type == 'mv' || type == 'video') {
      modal = (
        <div className="player-wrapper">
          <ReactPlayer
            className="react-player"
            url={item}
            controls
            playing
          />
        </div>
      );
    }
    this.setState({ modal });
  }
  renderCover(item) {
    return (
      <div
        className="cover-item-cover"
        style={item.cover ? {
          backgroundImage: `url(${item.cover})`,
          ...(item.cover ? { boxShadow: `0 9px 16px -8px ${item.shadowColor}88`, } : {}),
        } : {}}
      >
        {!item.cover && (
          <DiskIcon />
        )}
      </div>
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
          {this.renderCover(coverProps)}
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
        {item.songs.length > 0 && (
          <div className="modal-content container">
            <h3>Треки</h3>
            {item.songs.map((i, idx) => (
              <div key={idx} className="modal-content-type container">
                <div>{idx+1}. {i.artist} - {i.title}</div>
                {i.url && (<audio style={{ width: '100%' }} src={i.url} controls controlsList="nodownload" /> )}
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          {item.preReleaseLink && (
            <Button
                as="a"
                block
                href={item.preReleaseLink}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Открыть пост с пре-релизом
            </Button>
          )}
          {item.uploaded && (
            <React.Fragment>
              <Button
                as="a"
                block
                href={item.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Открыть пост
              </Button>
              <Button 
                as="a"
                block
                disabled={!item.playlistLink}
                href={item.playlistLink}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                  Перейти в плейлист
              </Button>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
  render() {
    const { modal } = this.state;
    return (
      <React.Fragment>
        {modal && <Modal
          blockScroll={false}
          open={true}
          onClose={this.handleOpenModal}
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
            modal: 'video-modal',
            overlay: 'shelf-overlay',
            closeButton: 'shelf-closeButton',
            closeIcon: 'shelf-closeIcon',
          }}
        >
          {modal}
        </Modal>}
        <Consumer>
          {({ isOpenModal, itemModal, onCloseModal }) => (
            <Modal
              blockScroll={false}
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