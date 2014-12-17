var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Tag = new Schema({
  name: {type: String, unique: true},
  lastModified: Date, 
  lastModifier: String,
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Tag', Tag);
