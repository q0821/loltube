var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  username: String,
  password: String,
  name: String,
  created: Date,
  last: Date,         // time for last login
  promission: Number, // promission level
  active: Boolean
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
