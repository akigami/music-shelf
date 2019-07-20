import React, { Component } from 'react';
import VKC, { MODE_DEV, MODE_PROD } from '@denisnp/vkui-connect-helper';
import List from './List';
import Glide from './Glide/Glide';
import CoverItem from './CoverItem';
import { Provider } from './ModalContext';
import MoreModal from './MoreModal';
import AdminModal from './AdminModal';

VKC.init({
  // appId: 7002227,
  // accessToken: '',
  mode: MODE_PROD,
  asyncStyle: true,
  // corsAddress: 'http://127.0.0.1:1235/',
});

let scrollbarSize;

function getScrollbarSize() {
  if (typeof scrollbarSize !== 'undefined') return scrollbarSize;

  var doc = document.documentElement;
  var dummyScroller = document.createElement('div');
  dummyScroller.setAttribute('style', 'width:99px;height:99px;' + 'position:absolute;top:-9999px;overflow:scroll;');
  doc.appendChild(dummyScroller);
  scrollbarSize = dummyScroller.offsetWidth - dummyScroller.clientWidth;
  doc.removeChild(dummyScroller);
  return scrollbarSize;
}

function hasScrollbar() {
  return document.documentElement.scrollHeight > window.innerHeight;
}

const InfoContext = React.createContext('id');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popular: [],
      itemModal: null,
      openModal: false,
      id: 0,
    };
    this.onOpenModal = this.onOpenModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.handleClickAdmin = this.handleClickAdmin.bind(this);
  }
  async componentDidMount() {
    const [data, error] = await VKC.send('VKWebAppGetUserInfo');
    const popular = await fetch('/api/popular').then((res) => res.json());
    this.setState({
      popular,
      id: data.data.id,
    });
  }
  onOpenModal(item) {
    const doc = document.documentElement;
    const scrollTop = window.pageYOffset;
    if (hasScrollbar()) {
      doc.style.marginRight = getScrollbarSize();
    }
    doc.style.overflow = 'hidden';
    this.setState({
      openModal: true,
      itemModal: item,
    });
  }
  onCloseModal() {
    const doc = document.documentElement;
    doc.style.marginRight = '';
    doc.style.overflow = '';
    this.setState({
      openModal: false,
    }, () => {
      setTimeout(() => {
        this.setState({ itemModal: null });
      }, 400);
    });
  }
  handleClickAdmin(e, item) {
    this.adminModal.handleShow(item);
  }
  render() {
    const { itemModal, openModal, popular, id } = this.state;
    return (
      <Provider
        value={{
          onOpenModal: this.onOpenModal,
          onCloseModal: this.onCloseModal,
          itemModal: itemModal,
          isOpenModal: openModal,
        }}
      >
        <div className="app">
          <MoreModal />
          <div className="container popular">
            <h3>Популярное</h3>
            <div className="carousel-wrapper">
              <Glide
                horizontalScroll
                items={popular}
                ItemComponent={CoverItem}
              />
            </div>
          </div>
          <div className="grid">
            <div className="grid-2">
              <h3 className="container">Список музыки</h3>
              <List userId={id} handleEdit={this.handleClickAdmin} />
            </div>
            <div className="grid-1">
              <div className="container sticky">
                <h3>Информация</h3>
                <i>
                  Здесь хранятся все песни, которые публиковались в Акигами,
                  а также календарь предстоящих к выходу песен.
                </i>
              </div>
            </div>
          </div>
        </div>
        {id === 89379041 && <div style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
        }}><AdminModal ref={(c) => this.adminModal = c}/><button onClick={this.handleClickAdmin}>+</button></div>}
      </Provider>
    )
  }
}

export default App;
