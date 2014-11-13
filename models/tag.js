var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Tag = new Schema({
  name: String,
  lastModified: Date, 
  lastModifier: String
});

module.exports = mongoose.model('Tag', Tag);
