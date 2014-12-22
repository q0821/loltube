'use strict';

var express = require('express');
var router = express.Router();
var Item = require('../../models/item.js');

router.post('/', function(req, res){
  var data = req.body;
  data.lastModifier = req.user ? req.user.username : 'system';
  data.lastModified = Date.now();
  item = new Item(data);
  item.save(function(err){
    if(err)
      res.status(401).end(err.message);
    else
      Item.findById( item._id, function(err, result){
        if(err)
          errHandler(err, res);
        else
          res.status(201).json(result);
      });
  });
});

router.get('/:item_id', function(req, res){
  var item_id = req.params.item_id;
  Item.findById( item_id, function(err, result){
    if(err)
      res.status(401).end(err.message);
    else
      res.status(200).json(result);
  });
});

module.exports = router;
