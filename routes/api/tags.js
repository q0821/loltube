'use strict';

var express = require('express');
var router = express.Router();
var Tag = require('../../models/tag');
var Q = require('q');

// Request all tags
router.get('/', function(req, res){
  var order = req.query.o ? req.query.o : '-_id';
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
  data.lastModifier = req.user?req.user.username:"system";
  data.lastModified = Date.now();

  checkNameExist(data.name)
  .done(function(result){ 
    data.name = result;
    var tag = new Tag(data);
    tag.save(function(err){
      if(err){
        res.status(400).end(err.message);
      } else {
        Tag.findOne(tag, function(err, result){
          if(err){          
            res.status(400).end(err.message);
          } else {
            res.status(201).json(result);          
          }
        });
      }
    });
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
      lastModified: Date.now(),
      active: data.active
    }},
    function(err, num, raw, results) {
      if(err){
        res.status(400).end(err.message);
      } else {
        Tag.findOne({ _id: tag_id}, function(err, result){
          if(err){
            res.status(400).end(err.message);
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

function checkNameExist(name){

    console.log('check name exist?');
    var deferred = Q.defer();

    Tag.count({name:name}, function(err, count){
      if(err){
        deferred.reject(err);
      } else {
        if(count>0) {
          deferred.resolve(checkNameExist(name + ' copy'));
        } else {
          deferred.resolve(name);
        }
      }
    });
    return deferred.promise;

}

module.exports = router;
