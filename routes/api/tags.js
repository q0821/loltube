'use strict';

var express = require('express');
var router = express.Router();
var Tag = require('../../models/tag');

// Request all tags
router.get('/', function(req, res){
  var order = req.query.o ? req.query.o : '-lastModified';
  Tag.find({}).sort(order).exec(function(err, results){
    if(err) {
      res.status(400).json({ 
        message: "get tag list error"
      });
    } else {
      res.status(200).json(results);
    }
  });  
});

// Request tags by page
router.get('/page/:page_index', function(req, res){
  var order = req.query.o ? req.query.o : 'name';
  var perPage = req.query.p ? parseInt(req.query.p) : 50; 
  var pageIndex = req.params.page_index;
  Tag.find({}).sort(order).skip((pageIndex-1)*perPage).limit(perPage).exec(function(err, results){
    if(err) {
      res.status(400).json({ 
        message: "get tag list error"
      });
    } else {
      res.status(200).json({ 
        message: "get tag list success", 
        result: results
      });
    }
  });  
});

router.get('/:tag_id', function(req, res){
  var tag_id = req.params.tag_id;
  Tag.find({ _id: tag_id}, function(err, results){
    if(err) {
      res.status(400).json({ 
        message: "get tag from tag_id error"
      });
    } else {
      res.status(200).json({ 
        message: "get tag from tag_id success",
        result: results
      });
    }
  });
});

router.post('/', function(req, res){
  var data = req.body;
  var tag = new Tag();
  tag.name = data.name;
  tag.lastModifier = req.user?req.user.username:"system";
  tag.lastModified = Date.now();

  tag.save(function(err){
    if(err){
      res.status(400).json({ 
        message: "insert tag error"
      });
    } else {
      Tag.findOne(tag, function(err, result){
        if(err){          
          res.status(400).json({
            message: "some unknown error.."
          });
        } else {
          //res.status(400).end('same tag name');
          res.status(201).json({
            _id: result._id
          });          
        }
      });
    }
  });
});

router.put('/:tag_id', function(req, res){
  var data = req.body;
  var tag_id = req.params.tag_id;
  
  Tag.update(
    {_id: tag_id},
    {$set: { 
      name: data.name,
      lastModifier: req.user?req.user.username : "system",
      lastModified: Date.now()
    }},
    function(err, num, raw, results) {
      if(err){
        res.status(400).json({
          message: "update tag error"
        });
      } else {
        Tag.find({ _id: tag_id}, function(err, results){
          res.status(201).json({ 
            message: "update db success",
            result: results
          });  
        })
      }
    }  
  );
});

router.delete('/:tag_id', function(req, res){
  var tag_id = req.params.tag_id;

  Tag.remove({ _id:tag_id }, function(err){
    if(err){
      res.status(400).json({ 
        message: "remove tag error"
      });
    } else {
      res.status(201).json({ 
        message: "remove tag success"
      });
    }
  });  
});

module.exports = router;
