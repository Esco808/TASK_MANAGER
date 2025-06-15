const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Board', BoardSchema);
