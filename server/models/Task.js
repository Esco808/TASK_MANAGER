const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String, // "TO DO", "IN PROGRESS", "DONE"
  boardId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Task', TaskSchema);
