const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const releaseSchema = new Schema({
  artist: {
    type: String,
  },
  title: {
    type: String,
  },
  anime: {
    type: String,
    required: true,
  },
  type: {
    type: [{
      type: {
        type: String,
      },
      video: {
        type: String,
      },
      mv: {
        type: String,
      },
    }],
  },
  uploaded: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  playlistLink: {
    type: String,
  },
  preReleaseLink: {
    type: String,
  },
  additionalInfo: {
    type: String,
  },
  date: {
    type: String,
  },
  season: {
    type: String,
  },
  covers: {
    type: Array,
  },
  likes: {
    type: Number,
  },
  shadowColor: {
    type: String,
  },
  songs: {
    type: [{
      url: {
        type: String,
      },
      artist: {
        type: String,
      },
      title: {
        type: String,
      },
    }],
  },
});

mongoose.model('Release', releaseSchema);