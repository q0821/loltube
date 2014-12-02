'use strict';

var express = require('express');
var router = express.Router();
var Tag = require('../../models/tag');

// Request all tags
router.get('/', function(req, res){
  var order = req.query.o ? req.query.o : '-lastModified';
  Tag.find({active: true}).sort(order).exec(function(err, results){
    if(err) {
      res.status(400).end('Get tag list error');
    } else {
      res.status(200).json(results);
    }
  });  
});


// Request all tags with inactive
router.get('/recycle', function(req, res){
  var order = req.query.o ? req.query.o : '-lastModified';
  Tag.find({active: false}).sort(order).exec(function(err, results){
    if(err) {
      res.status(400).end('Get tag list error');
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
  Tag.find({active: true}).sort(order).skip((pageIndex-1)*perPage).limit(perPage).exec(function(err, results){
    if(err) {
      res.status(400).end('Getting tag list with page+' + pageIndex + ' error');
    } else {
      res.status(200).json(results);
    }
  });  
});

router.get('/:tag_id', function(req, res){
  var tag_id = req.params.tag_id;
  Tag.findOne({ _id: tag_id}, function(err, result){
    if(err) {
      res.status(400).end('get tag from tag_id error');
    } else {
      res.status(200).json(result);
    }
  });
});

router.post('/', function(req, res){
  var data = req.body;
  Tag.find({name: data.name}).limit(1).exec( function(err, result){
    if(err){
    } else {
      if(result.length > 0){ // Already exist a tag with same name
        res.status(400).end('The tag: ' + data.name  + ' is already exist');
      } else { // Save the new Tag to database
        var tag = new Tag();
        tag.name = data.name;
        tag.lastModifier = req.user?req.user.username:"system";
        tag.lastModified = Date.now();
        tag.save(function(err){
          if(err){
            res.status(400).end('Insert tag error');
          } else {
            Tag.findOne(tag, function(err, result){
              if(err){          
                res.status(400).end('Some unknown error after saving the tag');
              } else {
                res.status(201).json(result);          
              }
            });
          }
        });
      }
    }
  });
});

router.put('/:tag_id', function(req, res){
  var data = req.body;
  var tag_id = req.params.tag_id;
  console.log('change '+tag_id+' to ' + data.active);
  Tag.update(
    {_id: tag_id},
    {$set: { 
      name: data.name,
      lastModifier: req.user?req.user.username : "system",
      lastModified: Date.now(),
      active: data.active
    }},
    function(err, num, raw, results) {
      if(err){
        res.status(400).end('Update tag error');
      } else {
        Tag.findOne({ _id: tag_id}, function(err, result){
          if(err){
            res.status(400).end('Some unknown error after updating the tag');
          } else {
            res.status(201).json(result);
          }
        });
      }
    }  
  );
});

router.delete('/:tag_id', function(req, res){
  var tag_id = req.params.tag_id;
  Tag.remove({ _id:tag_id }, function(err){
    if(err){
      res.status(400).end('Removing tag error');
    } else {
      res.status(201).json({ _id:tag_id });
    }
  });  
});

module.exports = router;
