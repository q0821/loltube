'use strict';

var express = require('express');
var router = express.Router();
var ItemType = require('../../models/itemType.js');

router.get('/', function(req,res){
  ItemType.find({}, function(err, results){
    if(err)
      res.status(401).end(err.message);
    else
      res.status(200).json(results);
  });    
});

router.get('/:item_type_id', function(req, res){
  var item_type_id = req.params.item_type_id;
  ItemType.findById( item_type_id, function(err, result){
    if(err)
      res.status(401).end(err.message);
    else
      res.status(200).json(result);
  });
});

module.exports = router;
