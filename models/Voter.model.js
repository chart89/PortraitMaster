const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  ip: { type: String },
  vote: { type: String},
});

module.exports = mongoose.model('Voter', voterSchema);
