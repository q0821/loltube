'use strict';

var express = require('express');
var router = express.Router();
var Account = require('../../models/account');

// Request all accounts with active
router.get('/', isAuth, function(req, res){
  Account.find({active: true}).sort('-_id').exec(function(err, results){
    if(err){
      res.status(400).end('Get accounts error');
    } else {
      res.status(200).json(results);
    }
  }); 
});

// Request all tags with active
router.get('/recycle', isAuth, function(req, res){
  Account.find({active: false}).sort('-_id').exec(function(err, results){
    if(err) {
      res.status(400).end('Get tag list error');
    } else {
      res.status(200).json(results);
    }
  });  
});

router.post('/', function(req, res){
  var data = req.body;
  data.created = Date.now();
  data.lastModifier = req.user.username;
  data.lastModified = Date.now();
  var newAccount = new Account(data);

  Account.register(newAccount, data.password, function(err, account) {
    if (err) {
      res.status(400).end(err.message);
    } else {
      res.status(201).json(account);
    }
  });
});

router.put('/:account_id', isAuth, function(req, res){
  var data = req.body;
  var account_id = req.params.account_id
  if(req.user._id == account_id){
    if(data.active == false){
      res.status(400).end('You cat\'t delete yourself!');
      return;
    }
  }


  data.lastModifier = req.user.username;
  data.lastModified = Date.now();

  Account.findByIdAndUpdate(account_id, data, function(err, account){
    if(err) {
      res.status(400).end(err.message);
    } else {
      if(data.password){
        account.setPassword(data.password, function(err){
          if(err){
            res.status(401).end(err.message);
          } else {
            account.save( function(err){ console.log(err)});
          }
        });
      }
      res.status(201).json(account);
    }
  });
});

router.delete('/:account_id', isAuth, function(req, res){
  var account_id = req.params.account_id; 

  // check the user is deleting itself
  if(req.user._id == account_id){
    res.status(400).end('You can\'t delete yourself');
    return;
  }

  Account.remove(
    {_id: account_id},
    function(err){
      if(err){
        res.status(400).end(err.message);
      } else {
        res.status(201).json({_id: account_id});
      }
    }
  );
});

function isAuth(req, res, next){
  if(req.isAuthenticated() && req.user.permission > 0) {
    return next();
  }

  // auth fail
  // res.redirect('/tellusadmin');
  return next();
}

module.exports = router;
