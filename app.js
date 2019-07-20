const express = require('express');
const app = express();
const path = require('path');
const got = require('got');
const mongoose = require('mongoose');
const get = require('lodash/get');
const merge = require('lodash/merge');
const config = require('./config');
const Vibrant = require('node-vibrant');
const cors_proxy = require('cors-anywhere');
const crypto = require('crypto');
const url = require('url');
const bodyParser = require('body-parser');
const m = require('moment');

const { stringify, parse } = require('querystring');
require('./src/server/models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const checkVKQueryParamsSign = params => {
	const query = url.parse(params, true).query
	const list_of_params = Object.entries(query) //перевод в обьекта параметро в список
		.filter(e => e[0].startsWith('vk_')) //фильтрация параметров VK
		.sort((a, b) => {
			if (a[0] < b[0]) {
				return -1
			}
			if (a[0] > b[0]) {
				return 1
			}
			return 0
		}) //сортировка по алфавиту
	const params_str = stringify(
		list_of_params.reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
	) //перевод параметров в строковый вид
	const hmac = crypto.createHmac('sha256', config.clientSecret) //инициализация генератора подписи
	hmac.update(params_str) //добавление строки с параметрами
	const sign = hmac
		.digest('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '') //генерация подписи
	return sign === query.sign //сравнение подписей
}

mongoose.connect(config.mongodbUri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected');
  app.get('/api/seasons', async (req, res) => {
    const seasons = (await mongoose.model('Release').aggregate([
      { $project: { season: 1 } },
      { $group: { _id: "$season", season: { $push: "$season" } } },
      { $addFields: { season: { $setUnion: ["$season", []] } } },
      { $unwind: '$season' },
      { $sort: { _id: -1 } }
    ])).map((item) => item.season);
    res.json(seasons);
  });
  app.get('/api/popular', async (req,res) => {
    const all = await mongoose.model('Release').find().sort('-likes').limit(20);
    res.json(all);
  });
  app.post('/api/set', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      const sign = checkVKQueryParamsSign(req.headers.referer);
      if (!sign) return res.json({});
      const query = url.parse(req.headers.referer, true).query;
      const userId = query.vk_user_id;
      if (userId != '89379041') return res.json({});
    }
    if (!req.body.anime) return res.json({});
    const item = {};
    if (req.body.link) {
      const [, id] = /wall(.*)/.exec(req.body.link);
      const { body } = await got(`https://api.vk.com/method/wall.getById?posts=${id}&v=5.95&access_token=${config.serviceToken}`)
      const parsedBody = JSON.parse(body);
      const attachment = get(parsedBody, 'response.0.attachments.0');
      if (attachment && attachment.type == 'photo') {
        const sizes = attachment.photo.sizes;
        item.covers = sizes;
      }
      const cover = item.covers.find((item) => item.type == 'x').url;
      const { body: imageBody } = await got(cover, { encoding: null });
      const palette = await Vibrant.from(imageBody).getPalette();
      const hex = palette.Vibrant.getHex();
      item.shadowColor = hex;
    }
    if (req.body.date) {
      const md = m(req.body.date);
      item.season = `${md.year()}-${md.quarter()}`;
    }
    const it = merge(item, req.body);
    if (it._id) {
      const { id, ...$set } = it;
      await mongoose.model('Release').updateOne({_id: it._id}, { $set });
    } else {
      await mongoose.model('Release').create(it);
    }
    // console.log(it);
    res.json({});
  });
  app.post('/api/remove', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      const sign = checkVKQueryParamsSign(req.headers.referer);
      if (!sign) return res.json({});
      const query = url.parse(req.headers.referer, true).query;
      const userId = query.vk_user_id;
      if (userId != '89379041') return res.json({});
    }
    if (!req.body._id) return res.json({});
    const release = await mongoose.model('Release').findById(req.body._id);
    if (release) {
      await release.remove();
    }
    res.json({});
  });
  app.get('/api/check', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
    });
  })
  app.get('/api/test', async (req, res) => {
    // const docs = await mongoose.model('Release').find({covers: {$exists: true, $ne: []}, shadowColor: {$exists: false}});
    // // console.log(docs);
    // let count = 0;
    // for (const item of docs) {
    //   const cover = item.covers.find((item) => item.type == 'x').url;
    //   const { body } = await got(cover, { encoding: null });
    //   const palette = await Vibrant.from(body).getPalette();
    //   const hex = palette.Vibrant.getHex();
    //   item.shadowColor = hex;
    //   await item.save();
    //   console.log(count++, '/', docs.length);
    // }
    // Vibrant.from(buffer).getPalette().then(palette => {
    //   console.log(palette.Vibrant.getHex());
    // })
    // const all = await mongoose.model('Release').find({ uploaded: true }).limit(0);
    // for (const item of all) {
    //   const [, id] = /wall(.*)/.exec(item.link);
    //   const { body } = await got(`https://api.vk.com/method/wall.getById?posts=${id}&v=5.95&access_token=${config.serviceToken}`)
    //   try { 
    //     const parsedBody = JSON.parse(body);
    //     const likes = get(parsedBody, 'response.0.likes.count');
    //     if (likes) {
    //       item.likes = likes;
    //       await item.save();
    //     }
    //     // if (attachment && attachment.type == 'photo') {
    //     //   const sizes = attachment.photo.sizes;
    //     //   item.covers = sizes;
    //     //   await item.save();
    //     // }
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
    res.json({});
  });
  app.get('/api/get', async (req, res) => {
    const lastRelease = await mongoose.model('Release').findOne({}).sort('-season').select('season');
    let lastSeason = '';
    if (lastRelease) {
      lastSeason = lastRelease.season;
    }
    const { season = lastSeason } = req.query;
    const r = await mongoose.model('Release').find({ season }).sort('-date');
    res.json(r);
  });

  app.get('/api/getOne', async (req, res) => {
    const { _id } = req.query;
    if (!_id) return res.json({});
    const item = await mongoose.model('Release').findById(_id);
    if (item) {
      res.json(item);
    } else {
      res.json({});
    }
  });

  app.use(express.static('dist'));

  app.listen(1234, () => {
    console.log('Example app listening on port 1234!');
  });
});

if (process.env.NODE_ENV === 'development') {
  cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
  }).listen('1235', function() {
    console.log('Running CORS Anywhere on ' + 1235);
  });
}
