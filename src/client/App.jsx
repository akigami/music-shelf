import React, { Component } from 'react';
import connect from '@vkontakte/vkui-connect';
import List from './List';

connect.send("VKWebAppInit", {});

 class App extends Component {
  render() {
    return (
      <div className="app">
        <List />
      </div>
    )
  }
}

export default App;
