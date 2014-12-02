var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  username: String,
  password: String,
  created: Date,
  lastLogin: Date,         // time for last login
  promission: Number, // promission level
  active: Boolean
});

Account.plugin(passportLocalMongoose, {
  lastLoginField: 'lastLogin'    
});
module.exports = mongoose.model('Account', Account);
