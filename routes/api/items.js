'use strict';

var express = require('express');
var router = express.Router();
var Item = require('../../models/item.js');
var ItemType = require('../../models/itemType.js');
var Tag = require('../../models/tag.js');

router.get('/', function(req,res){
  Item.find({}, function(err, results){
    res.status(200).json(results);  
  });    
});

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

router.get('/page/:page_index', function(req, res){
  var order = req.query.o ? req.query.o : '-_id';
  var perPage = req.query.per ? req.query.per : 50;
  var pageIndex = req.params.page_index;
  Item.find().populate('type', 'name').populate('tags', 'name').sort(order).skip((pageIndex-1)*perPage).limit(perPage).exec(function(err, results){
    if(err) {
      res.status(400).end(err.message);
    } else {
      console.log(results[0].type);
      res.status(200).json(results);
    }
  });  
  
    
});



module.exports = router;


