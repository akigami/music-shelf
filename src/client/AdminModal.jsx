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

class AdminModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      anime: '',
      artist: '',
      title: '',
      link: '',
      playlistLink: '',
      preReleaseLink: '',
      additionalInfo: '',
      uploaded: false,
      updateCover: false,
      date: '',
      vgmdb: '',
      type: [],
      songs: [],
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleVGMDBImport = this.handleVGMDBImport.bind(this);
    this.handleAddType = this.handleAddType.bind(this);
    this.handleRemoveType = this.handleRemoveType.bind(this);
    this.handleAddSong = this.handleAddSong.bind(this);
    this.handleRemoveSong = this.handleRemoveSong.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleAddType() {
    const type = this.state.type;
    type.push({
      type: '',
      video: '',
      mv: '',
    });
    this.setState({
      type,
    });
  }
  handleRemoveType(e) {
    const arr = this.state.type;
    arr.splice(e.target.dataset.index, 1);
    this.setState({
      type: arr,
    });
  }
  handleAddSong() {
    const songs = this.state.songs;
    songs.push({
      url: '',
      artist: '',
      title: '',
    });
    this.setState({
      songs,
    });
  }
  handleRemoveSong(e) {
    const arr = this.state.songs;
    arr.splice(e.target.dataset.index, 1);
    this.setState({
      songs: arr,
    });
  }
  async handleSubmit() {
    await fetch('/api/set', { 
      method: 'POST', 
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(this.state),
    });
    this.handleClose();
  }
  handleShow(item) {
    this.setState({ ...item, show: true });
  }
  async handleRemove() {
    const { _id } = this.state;
    if (_id) {
      await fetch('/api/remove', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ _id }),
      });
      this.handleClose();
    }
  }
  handleClose() {
    this.setState({
      _id: null,
      show: false,
      anime: '',
      artist: '',
      title: '',
      link: '',
      playlistLink: '',
      preReleaseLink: '',
      additionalInfo: '',
      uploaded: false,
      updateCover: false,
      date: '',
      vgmdb: '',
      type: [],
      songs: [],
    });
  }
  handleChange(e) {
    if (!e.target.dataset.arr) {
      this.setState({
        [e.target.dataset.key]: e.target.dataset.key === 'uploaded' ? e.target.checked : e.target.value,
      });
    } else {
      const arr = this.state[e.target.dataset.arr];
      arr[e.target.dataset.index][e.target.dataset.key] = e.target.value;
      this.setState({
        [e.target.dataset.arr]: arr,
      });
    }
  }
  async handleVGMDBImport() {
    const [, id] = /(\d+)/.exec(this.state.vgmdb);
    const item = await fetch(`https://vgmdb.info/album/${id}?format=json`).then((res) => res.json());
    const anime = item.products.length > 0 && item.products[0].names['ja-latn'] || 'ANIME';
    const date = item.release_date
    const set = {};
    if (!this.state.date) {
      set.date = date;
    }
    if (!this.state.anime) {
      set.anime = anime;
    }
    let a;
    if (/(.*) \/ (.*)/.test(item.name)) {
      const [, title, artist] = /(.*) \/ (.*)/.exec(item.name);
      console.log({ title: `${artist} - ${title}`, anime });
      if (!this.state.artist) {
        set.artist = artist;
      }
      if (!this.state.title) {
        set.title = title;
      }
      a = artist;
    } else {
      if (!this.state.title) {
        set.title = item.name;
      }
      t = item.name;
      console.log({ title: item.name, anime });
    }
    if (item.discs.length && !this.state.songs.length) {
      const tracks = item.discs[0].tracks.map((item) => ({
        artist: a || '',
        title: item.names.Romaji || item.names.Japanese || item.names.English,
      }));
      set.songs = tracks;
    }
    this.setState({
      ...set,
    });
  }
  renderBody(item) {
    return (
      <div className="admin-modal">
        <div className="item">
          <div>Импорт из VGMDB:</div>
          <input data-key="vgmdb" type="text" onChange={this.handleChange} />
          <button className="vk-flat-button" style={{ marginLeft: 8 }} onClick={this.handleVGMDBImport}>get</button>
        </div>
        <div className="item">
          <div>Аниме:</div>
          <input data-key="anime" type="text" value={this.state.anime} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Артист:</div>
          <input data-key="artist" type="text" value={this.state.artist} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Название:</div>
          <input data-key="title" type="text" value={this.state.title} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Ссылка:</div>
          <input data-key="link" type="text" value={this.state.link} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Ссылка на плейлист:</div>
          <input data-key="playlistLink" type="text" value={this.state.playlistLink} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Ссылка на пре-релиз:</div>
          <input data-key="preReleaseLink" type="text" value={this.state.preReleaseLink} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Дополнительная информация:</div>
          <textarea data-key="additionalInfo" style={{
            height: 30,
            width: 256,
          }} value={this.state.additionalInfo} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Загружено:</div>
          <input data-key="uploaded" type="checkbox" checked={this.state.uploaded} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Обновить ковёр:</div>
          <input data-key="updateCover" type="checkbox" checked={this.state.updateCover} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Дата:</div>
          <input data-key="date" type="date" value={this.state.date} onChange={this.handleChange} />
        </div>
        <div className="item">
          <div>Типы:</div>
          {this.state.type.map((item, index) => {
            return (
              <div className="modal-content-type container" key={index}>
                <div className="item">
                  <div>Тип:</div>
                  <input data-arr="type" data-index={index} data-key="type" type="text" value={this.state.type[index].type} onChange={this.handleChange} />
                </div>
                <div className="item">
                  <div>Видео из аниме:</div>
                  <input data-arr="type" data-index={index} data-key="video" type="text" value={this.state.type[index].video} onChange={this.handleChange} />
                </div>
                <div className="item">
                  <div>MV:</div>
                  <input data-arr="type" data-index={index} data-key="mv" type="text" value={this.state.type[index].mv} onChange={this.handleChange} />
                </div>
                <div><button style={{ margin: '4px 0 4px 0' }} className="vk-flat-button" data-index={index} onClick={this.handleRemoveType}>remove type</button></div>
              </div>
            );
          })}
          <div><button className="vk-flat-button" onClick={this.handleAddType}>add type</button></div>
        </div>
        <div className="item">
          <div>Треки:</div>
          {this.state.songs.map((item, index) => {
            return (
              <div className="modal-content-type container" key={index}>
              <div className="item">
                  <div>Ссылка:</div>
                  <input data-arr="songs" data-index={index} data-key="url" type="text" value={this.state.songs[index].url} onChange={this.handleChange} />
                </div>
                <div className="item">
                  <div>Артист:</div>
                  <input data-arr="songs" data-index={index} data-key="artist" type="text" value={this.state.songs[index].artist} onChange={this.handleChange} />
                </div>
                <div className="item">
                  <div>Название:</div>
                  <input data-arr="songs" data-index={index} data-key="title" type="text" value={this.state.songs[index].title} onChange={this.handleChange} />
                </div>
                <div><button style={{ margin: '4px 0 4px 0' }} className="vk-flat-button" data-index={index} onClick={this.handleRemoveSong}>remove song</button></div>
              </div>
            );
          })}
          <div><button className="vk-flat-button" onClick={this.handleAddSong}>add song</button></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {this.state._id && <button style={{ marginRight: 4 }} className="vk-flat-button red" onClick={this.handleRemove}>remove</button>}
          <button className="vk-flat-button green" onClick={this.handleSubmit}>submit</button>
        </div>
      </div>
    );
  }
  render() {
    const { show } = this.state;
    return (
      <React.Fragment>
        <Modal
          blockScroll={false}
          open={show}
          onClose={this.handleClose}
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
          {this.renderBody()}
        </Modal>
      </React.Fragment>
    );
  }
}

export default AdminModal;