const express = require('express');
const app = express();
const path = require('path');
const got = require('got');
const mongoose = require('mongoose');
const get = require('lodash/get');
const config = require('./config');
require('./src/server/models');
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
  app.get('/api/test', async (req, res) => {
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
    const r = await mongoose.model('Release').find({ season });
    res.json(r);
  });

  app.use(express.static('dist'));

  app.listen(1234, () => {
    console.log('Example app listening on port 1234!');
  });
});
