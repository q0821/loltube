'use strict';

var express = require('express');
var router = express.Router();
var Tag = require('../../models/tag.js');
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

router.get('/autocomplete',function(req,res){
  Tag.aggregate({$project: {name:1}}).exec(function(err, results){
    if(err)
      res.status(400).end(err.message);
    else
      res.status(200).json(results);
  });
});

// Request tags by page
router.get('/page/:page_index', function(req, res){
  var order = req.query.o ? req.query.o : '-_id';
  var perPage = req.query.per ? req.query.per : 50;
  var pageIndex = req.params.page_index;
  Tag.find({active: true}).sort(order).skip((pageIndex-1)*perPage).limit(perPage).exec(function(err, results){
    if(err) {
      res.status(400).end(err.message);
    } else {
      res.status(200).json(results);
    }
  });  
});

router.post('/', function(req, res){
  var data = req.body;
  data.lastModifier = req.user ? req.user.username : 'system';
  data.lastModified = Date.now();

  new Q(getUniqueName(data.name, 0))
  .then(function(result){ 
    data.name = result;
    var tag = new Tag(data);
    tag.save(function(err){
      if(err)
        res.status(400).end(err.message);
      else {
        Tag.findOne(tag, function(err, result){
          if(err)          
            res.status(400).end(err.message);
          else
            res.status(201).json(result);          
        });
      }
    });
  })
  .catch(function(err){
    res.status(400).end(err.message);
  });
});

router.get('/:tag_id', function(req, res){
  var tag_id = req.params.tag_id;
  Tag.findById( tag_id, function(err, result){
    if(err)
      res.status(400).end(err.message);
    else
      res.status(200).json(result);
  });
});

router.put('/:tag_id', function(req, res){
  var data = req.body;
  var tag_id = req.params.tag_id;

  new Q(checkNameExist(tag_id, data.name))
  .then(function(){
    data.lastModifier = req.user?req.user.username : "system";
    data.lastModified = Date.now();
    Tag.findByIdAndUpdate( tag_id, {$set: data}, function(err, result){
      if(err)
        res.status(400).end(err.message);
      else
        res.status(201).json(result);
    });
  })
  .catch(function(err){
    res.status(400).end(err.message);
  });

});




//// handlers for bulk request ////
router.post('/copy/:tag_ids', function(req, res){
  var tagIdArray = req.params.tag_ids.split(',');
  var where = { '_id': { '$in': tagIdArray}};
  var success = true;
  Tag.find( where, function(err, results){
    if(err)
      res.status(400).end(err.message);
    else{
      results.forEach(function(element){
        element._id = undefined;
        Tag.save(function(err){
          res.status(400).end(err.message);
          success = false;   
        })
        return success;
      });
      if(success)
        res.status(201).json({message: 'copy success'});
    }
  })
});

router.put('/recover/:tag_ids', function(req, res){
  var tagIdArray = req.params.tag_ids.split(',');
  var where = { '_id': { '$in': tagIdArray}};
  Tag.update( where, { $set: {active: true}}, {multi: true}).exec(function(err, num, raw){
    if(err)
      res.status(400).end(err.message);
    else 
      res.status(201).json({ message: 'recover success' });
  });
});

router.delete('/unactive/:tag_ids', function(req, res){
  var tagIdArray = req.params.tag_ids.split(',');
  var where = {'_id': {'$in': tagIdArray}};
  Tag.update( where, { $set: {active: false}}, {multi: true}).exec(function(err, num, raw){
    if(err)
      res.status(400).end(err.message);
    else 
      res.status(201).json({message: 'unactive success'});
  });
});

router.delete('/delete/:tag_ids', function(req, res){
  var tagIdArray = req.params.tag_ids.split(',');
  Tag.remove({'_id': {'$in': tagIdArray} }).exec(function(err){
    if(err){
      res.status(400).end(err.message);
    } else {
      res.status(201).json({message: 'remove success'});
    }  
  });
});

// check the name is exist or not, if exist, create a new name for it
function getUniqueName(name, times){
    var deferred = Q.defer();
    var checkName = times>0 ? name+' copy('+times+')' : name;
    Tag.count({name:checkName}, function(err, count){
      if(err){
        deferred.reject(err);
      } else {
        if(count>0) 
          deferred.resolve(getUniqueName(name, times+1));
        else
          deferred.resolve(checkName);
      }
    });
    return deferred.promise;
}

// check the name is exist or not, if exist, return with err
function checkNameExist( edittingId, name){
  var deferred = Q.defer();
  Tag.find({name:name}, function(err, results){
    if(err){
      deferred.reject(err)
    } else {
      if(results.length == 0)
        deferred.resolve();
      else if(results.some(function(element){ return element._id == edittingId }))
        deferred.resolve();
      else 
        deferred.reject(new Error('Tag name: ' + name + ' already exist'));
    }
  });
  return deferred.promise;
}

module.exports = router;
