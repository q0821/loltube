'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId
var ItemType = require('./itemType.js');
var Tag = require('./tag.js');

var Item = Schema({
  title: String,
  keyword: String,
  des: String,
  type: {type: ObjectId, ref: 'ItemType'},
  key: {type: String, unique: true},
  tags: [{type: ObjectId, ref: 'Tag'}],
  shortDes: String,
  content: String,
  upTime: Date,
  downTime: Date,
  isPublish: Boolean,
  lastModified: Date, // auto-generate by backend
  lastModifier: String // auto-generate by req.use
});

module.exports = mongoose.model('Item', Item);
