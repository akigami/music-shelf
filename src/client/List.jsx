import React, { Component } from 'react';
import MovieIcon from 'react-icons/lib/md/movie';
import DiskIcon from 'react-icons/lib/md/disc-full';
import EditIcon from 'react-icons/lib/md/mode-edit';
import { Tooltip } from 'react-tippy';
import ReactList from 'react-list';
import find from 'lodash/find';
import get from 'lodash/get';
import { Consumer } from './ModalContext';


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

class List extends Component {
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
    this.listContainer = React.createRef();
    this.list = React.createRef();
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleSize = this.handleSize.bind(this);
    this.loading = false;
    this.hasMore = true;
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
    window.addEventListener('resize', this.handleSize);
    this.handleScroll();
    this.handleSize();
  }

  handleSize() {
    const width = this.listContainer.current.offsetWidth;
    this.setState({ widthContainer: width + 0.5 });
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

  handleScroll() {
    const pos = this.list.current.el.getBoundingClientRect().top + window.pageYOffset;
    const [startIndex, stopIndex] = this.list.current.getVisibleRange();
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

  rowRenderer(index, key) {
    const { userId, handleEdit } = this.props;
    const { tree } = this.state;
    const row = tree[index];
    if (row.type == 'year') {
      return (
        <div key={key} className="list-item-wrapper list-year">
          {row.value}
        </div>
      );
    } else if (row.type == 'season') {
      const [, season] = row.value.split('-');
      return (
        <div key={key} className="list-item-wrapper list-season">
          {seasons[season]}
        </div>
      );
    } else if (row.type == 'date') {
      const [,month, day] = row.value.split('-');
      return (
        <div key={key} className="list-item-wrapper list-date">
          {`${day} ${months[month]}`}
        </div>
      );
    } else if (row.type == 'release') {
      const item = row.value;
      const types = get(item, 'type', []);
      const isMedia = Boolean(find(types, e => (e.video || e.mv)));
      const type = types.map(e => e.type).join(' & ');
      const cover = item.covers.length ? item.covers.find((i) => i.type == 's').url : null;
      let classesCover = ['list-item-cover-bg'];
      if (cover) {
        classesCover.push('off');
      } else {
        classesCover = classesCover.filter(e => e !== 'off');
      }
      return (
        <Consumer key={key}>
          {({ onOpenModal }) => (
            <button
              type="button"
              className="list-item-wrapper list-item"
              onClick={() => onOpenModal({
                ...item,
                typeTitle: type,
              })}
            >
              <div
                className="list-item-cover"
                style={cover ? {
                  backgroundImage: `url(${cover})`,
                } : {}}
              >
                <div className={classesCover}>
                  {!cover && (
                    <DiskIcon />
                  )}
                </div>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">
                  <span>{item.title}</span>
                  {' - '}
                  <span className="item-performer">{item.artist}</span>
                </div>
                <div className="list-item-sub">
                  {`${type} | ${item.anime}`}
                </div>
              </div>
              {isMedia && (
                <div className="list-item-actions">
                  <Tooltip
                    arrow
                    title="Доступны видео"
                    position="bottom"
                    size="small"
                    animateFill={false}
                  >
                    <div className="list-item-icon">
                      <MovieIcon />
                    </div>
                  </Tooltip>
                </div>
              )}
              {userId === 89379041 && (
                <div className="list-item-actions" onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleEdit(e, item);
                }}>
                  <div className="list-item-icon">
                    <EditIcon />
                  </div>
                </div>
              )}
            </button>
          )}
        </Consumer>
      );
    }
    return false;
  }

  render() {
    const { tree, heading, data, widthContainer } = this.state;
    if (!data) {
      return null;
    }
    let classes = ['list-fixed'];
    if (!!heading) {
      classes.push('open');
    } else {
      classes = classes.filter(e => e !== 'open');
    }
    return (
      <div ref={this.listContainer} className="container">
        <div
          className={classes.join(' ')}
          style={{
            width: widthContainer || '100%',
          }}
        >
          {heading}
        </div>
        <ReactList
          ref={this.list}
          itemRenderer={this.rowRenderer}
          length={tree.length}
          type='uniform'
          useTranslate3d
        />
      </div>
    );
  }
}

export default List;
