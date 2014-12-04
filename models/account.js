var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  realname: String,
  username: String,
  email: String,
  created: Date,
  lastLogin: Date,         // time for last login
  lastModifier: String,
  lastModified: Date,
  permission: Number, // promission level
  active: Boolean
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
