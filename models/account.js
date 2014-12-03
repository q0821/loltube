var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  realname: String,
  username: String,
  password: String,
  email: String,
  created: Date,
  lastLogin: Date,         // time for last login
  permission: Number, // promission level
  active: Boolean
});

Account.plugin(passportLocalMongoose, {
  lastLoginField: 'lastLogin'    
});
module.exports = mongoose.model('Account', Account);
