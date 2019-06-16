import React, { Component } from 'react';
import connect from '@vkontakte/vkui-connect';
import List from './List';
import Glide from './Glide/Glide';
import CoverItem from './CoverItem';

connect.send("VKWebAppInit", {});

 class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popular: [],
    };
  }
  async componentDidMount() {
    const popular = await fetch('/api/popular').then((res) => res.json());
    this.setState({
      popular,
    });
  }
  render() {
    return (
      <div className="app">
        <div className="container popular">
          <h3>Популярное</h3>
          <div className="carousel-wrapper">
            <Glide
              horizontalScroll
              items={this.state.popular}
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
              123
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
