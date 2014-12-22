var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemType = Schema({
  name: {type: String, unique: true},
});

module.exports = mongoose.model('itemtype', ItemType);
