import React, { Component } from 'react';
import connect from '@vkontakte/vkui-connect';
import List from './List';
import Glide from './Glide/Glide';
import CoverItem from './CoverItem';
import { Provider } from './ModalContext';
import MoreModal from './MoreModal';

connect.send("VKWebAppInit", {});

 class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popular: [],
      itemModal: null,
      openModal: false,
    };
    this.onOpenModal = this.onOpenModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }
  async componentDidMount() {
    const popular = await fetch('/api/popular').then((res) => res.json());
    this.setState({
      popular,
    });
  }
  onOpenModal(item) {
    this.setState({
      openModal: true,
      itemModal: item,
    });
  }
  onCloseModal() {
    this.setState({
      openModal: false,
    }, () => {
      setTimeout(() => {
        this.setState({ itemModal: null });
      }, 400);
    });
  }
  render() {
    const { itemModal, openModal, popular } = this.state;
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
              <List />
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
      </Provider>
    )
  }
}

export default App;
