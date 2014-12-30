'use strict';

var mongoose = require('mongoose');
var config = require('../../config/config.js');
var Item = require('../../models/item.js');
var ObjectId = mongoose.Schema.Types.ObjectId;

//// Schema ////
/*
var Item = mongoose.Schema({
  title: String,
  keyword: String,
  des: String,
  type: {type: mongoose.Schema.Types.ObjectId, ref: 'ItemType'},
  key: {type: String, unique: true},
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  shortDes: String,
  content: String,
  upTime: Date,
  downTime: Date,
  isPublish: Boolean,
  lastModified: Date,
  lastModifier: String
});
*/

var data = {};
mongoose.connect(config.db.develop);
for(var i=0; i<10000; i++){
  data = {
    title: makeString(8),
    keyword: makeString(5),
    des: makeString(10),
    type: ObjectId('54916160976e1af1283335c0'),
    key: makeString(11),
    tags: ObjectId('54640b5d758c87381f7f23c5'),
    shortDes: makeString(10),
    content: getIframe('qDc_5zpBj7s'),
    upTime: Date.now(),
    downTime: Date.now()+20000,
    isPublish: false,
    lastModified: Date.now(),
    lastModifier: 'system',
    active: true
  };
  
  var item = new Item(data);
  
  item.save(function(err){
    if(err)
      console.log(err.message);
  });
}

mongoose.disconnect();

function makeString(length){
  return Math.random().toString(36).substring(2,2+length);
}

function getIframe(key){
  return '<iframe width="560" height="315" src="//www.youtube.com/embed/' + key + '" frameborder="0" allowfullscreen></iframe>'
}

function getRandomTag(){

}
