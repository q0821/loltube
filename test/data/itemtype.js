'use strict';

var mongoose = require('mongoose');
var config = require('../../config/config.js');
var ItemType = require('../../models/itemType.js');

var data = [
  {'name': 'Youtube影片'},
  {'name': 'Twitch影片'},
  {'name': '圖片'}
];

mongoose.connect(config.db.develop);
for(var i=0; i<data.length; i++){
  var itemType = new ItemType(data[i]);
  itemType.save(function(err){
    if(err)
      console.log(err.message);
  });
}
//mongoose.disconnect();
