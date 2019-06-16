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
});

mongoose.model('Release', releaseSchema);