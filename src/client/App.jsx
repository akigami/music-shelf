import React, { Component } from 'react';
import connect from '@vkontakte/vkui-connect';
import List from './List';
import Glide from './Glide/Glide';
import CoverItem from './CoverItem';

connect.send("VKWebAppInit", {});

const popularTracks = [
  {
    id: 1,
    title: 'Chikatto Chika Chika​♡',
    artist: 'Chika Fujiwara (CV. Konomi Kohara)',
    anime: 'Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen',
    cover: 'https://pp.userapi.com/c849136/v849136085/18237a/ayIDeYGbGTM.jpg',
    type: [
      { type: 'ED2' },
    ],
  },
  {
    id: 2,
    title: 'Seijaku no Apostle',
    artist: 'JAM Project',
    anime: 'One Punch Man 2',
    cover: 'https://pp.userapi.com/c855432/v855432462/2b1b7/HMs-o6WAFCw.jpg',
    type: [
      { type: 'OP' },
    ],
  },
  {
    id: 3,
    title: 'Dororo',
    artist: 'ASIAN KUNG-FU GENERATION',
    anime: 'Dororo',
    cover: 'https://pp.userapi.com/c851324/v851324537/118af8/--P5ZhfH7jE.jpg',
    type: [
      { type: 'OP2' },
    ],
  },
  {
    id: 4,
    title: 'Kiss Me Hold Me Now',
    artist: 'Nai Br.XX & Celeina Ann',
    anime: 'Carole & Tuesday',
    cover: 'https://pp.userapi.com/c851524/v851524757/12a337/lLL3Gt4Bbtg.jpg',
    type: [
      { type: 'OP' },
      { type: 'ED' },
    ],
  },
  {
    id: 5,
    title: 'Stand By Me',
    artist: 'the peggies',
    anime: 'Sarazanmai',
    cover: 'https://pp.userapi.com/c850020/v850020061/19cc8c/He3DBwIEN1E.jpg',
    type: [
      { type: 'ED' },
    ],
  },
  {
    id: 6,
    title: 'Title',
    artist: 'Artist',
    anime: 'Anime',
    type: [
      { type: 'Type' },
    ],
  },
  {
    id: 7,
    title: 'WONDERFUL WONDER',
    artist: 'EDOGA-SULLIVAN',
    anime: 'Midara na Ao-chan wa Benkyou ga Dekinai',
    cover: 'https://pp.userapi.com/c851420/v851420508/12fa4d/eFuqWVV_R4Q.jpg',
    type: [
      { type: 'OP (3 трек)' },
    ],
  },
];

 class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="container popular">
          <h3>Популярное</h3>
          <div className="carousel-wrapper">
            <Glide
              horizontalScroll
              items={popularTracks}
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
