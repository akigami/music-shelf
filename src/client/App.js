import React from 'react';
import ReactDOM from 'react-dom';
import FaCheck from 'react-icons/lib/fa/check';
import FaTimes from 'react-icons/lib/fa/close';
import FaRegPlayCircle from 'react-icons/lib/fa/play-circle-o';
import MdMusicVideo from 'react-icons/lib/md/music-video';
import ReactPlayer from 'react-player';
import connect from '@vkontakte/vkui-connect';
import ReactList from 'react-list';

connect.send("VKWebAppInit", {});

const modalRoot = document.querySelector('#modal');

class Modal extends React.Component {
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

const seasons = {
  1: 'Зима',
  2: 'Весна',
  3: 'Лето',
  4: 'Осень',
};

const months = {
  '01': 'января',
  '02': 'февраля',
  '03': 'марта',
  '04': 'апреля',
  '05': 'мая',
  '06': 'июня',
  '07': 'июля',
  '08': 'августа',
  '09': 'сентября',
  '10': 'октября',
  '11': 'ноября',
  '12': 'декабря',
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      seasons: [],
      season: null,
      modal: null,
      tree: null,
      heading: '',
      loading: false,
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.list = null;
    this.loading = false;
    this.hasMore = true;
  }
  addToTree(data, tree) {
    const uniqDates = [...new Set(data.map((item) => item.date))];
    const season = data[0].season;
    const [year] = season.split('-');
    const hasYear = !tree.some((item) => item.type == 'year' && item.value == year);
    if (hasYear) {
      tree.push({
        type: 'year',
        value: year
      });
    }
    tree.push({
      type: 'season',
      value: season,
    });
    uniqDates.forEach((item) => {
      tree.push({
        type: 'date',
        value: item,
      });
      data.filter(release => release.date == item).forEach((release) => {
        tree.push({
          type: 'release',
          value: release,
        })
      });
    });
  }
  async componentDidMount() {
    const seasons = await fetch('/api/seasons').then((res) => res.json());
    const res = await fetch('/api/get').then((res) => res.json());
    let tree = [];
    const season = seasons.length ? seasons[0] : null;
    if (season) {
      this.addToTree(res, tree);
    }
    console.log(tree);
    this.setState({
      data: res,
      seasons,
      season: 0,
      tree,
    });
    document.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }
  handleScroll() {
    const pos = this.list.el.getBoundingClientRect().top + window.pageYOffset;
    const [startIndex, stopIndex] = this.list.getVisibleRange();
    const row = this.state.tree[startIndex];
    if (row.type == 'year') {
      this.setState({
        heading: row.value,
      });
    } else if (row.type == 'season') {
      const [year, season] = row.value.split('-');
      this.setState({
        heading: `${year} - ${seasons[season]}`,
      });
    } else if (row.type == 'date') {
      const [year, month, day] = row.value.split('-');
      const season = Math.ceil(month / 3) ;
      this.setState({
        heading: `${year} - ${seasons[season]} - ${day} ${months[month]}`,
      });
    } else if (row.type == 'release') {
      const [year, month, day] = row.value.date.split('-');
      const [, season] = row.value.season.split('-');
      this.setState({
        heading: `${year} - ${seasons[season]} - ${day} ${months[month]}`,
      });
    }
    if (document.body.scrollTop <= pos) {
      this.setState({
        heading: '',
      });
    }
    if (this.state.tree.length - stopIndex < 5 && !this.loading && this.hasMore) {
      this.loading = true;
      this.handleLoad();
    }
  }
  rowRenderer(index, key) {
    const row = this.state.tree[index];
    if (row.type == 'year') {
      return (
        <div key={key} style={{ height: 40, background: '#336699', color: 'white' }}>
          {row.value}
        </div>
      );
    } else if (row.type == 'season') {
      const [year, season] = row.value.split('-');
      return (
        <div key={key} style={{ height: 40, background: '#996633', color: 'white' }}>
          {`${year} - ${seasons[season]}`}
        </div>
      );
    } else if (row.type == 'date') {
      const [year, month, day] = row.value.split('-');
      const season = Math.ceil(month / 3) ;
      return (
        <div key={key} style={{ height: 40, background: '#669933', color: 'white' }}>
          {`${year} - ${seasons[season]} - ${day} ${months[month]}`}
        </div>
      );
    } else if (row.type == 'release') {
      const item = row.value;
      const release = `${item.artist} - ${item.title} | ${item.anime}`;
      return (
        <div key={key} style={{ height: 40, background: '#993366', color: 'white' }}>
          {release}
        </div>
      );
    }
    return false;
  }
  handleLoad() {
    if (this.state.seasons[this.state.season + 1]) {
      this.setState({
        season: this.state.season + 1,
      }, async () => {
        const res = await fetch(`/api/get?season=${this.state.seasons[this.state.season]}`).then((res) => res.json());
        const tree = this.state.tree;
        this.addToTree(res, tree);
        this.setState({
          tree,
        }, () => {
          this.loading = false;
        });
      });
    } else {
      this.hasMore = false;
    }
  }
  handleOpenModal(type, item) {
    let modal;
    if (type == 'mv' || type == 'video') {
      modal = (
        <Modal>
          <div className="modal">
            <div className={'player-wrapper'}>
              <ReactPlayer className={'react-player'} url={item} controls playing muted width='100%' height='100%' />
              <FaTimes style={{ position: 'absolute', top: 0, right: 0 }} onClick={this.handleOpenModal} size={28} color={'white'} className={'clickable'} />
            </div>
          </div>
        </Modal>
      );
    }
    this.setState({ modal });
  }
  render() {
    if (!this.state.data) {
      return null;
    }
    return (
      <React.Fragment>
        {this.state.modal}
        <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: '#996633', color: 'white' }}>
          {this.state.heading}
        </div>
        <ReactList
          ref={(c) => this.list = c}
          itemRenderer={this.rowRenderer}
          // threshold={0}
          length={this.state.tree.length}
          type='uniform'
          useTranslate3d
        />
      </React.Fragment>
    )
  }
}