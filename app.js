const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
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
  app.get('/api/test', async (req, res) => {
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
