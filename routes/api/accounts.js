'use strict';

var express = require('express');
var router = express.Router();
var Account = require('../../models/account');

// Request all accounts with active
router.get('/', function(req, res){
  Account.find({active: true}).sort('-_id').exec(function(err, results){
    if(err){
      res.status(400).end('Get accounts error');
    } else {
      res.status(200).json(results);
    }
  }); 
});

// Request all tags with active
router.get('/recycle', function(req, res){
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

router.put('/:account_id', function(req, res){
  var data = req.body;
  data.lastModifier = req.user.username;
  data.lastModified = Date.now();
  var editAccount = new Account(data);

  editAccount.save(function(err, account){
    if(err) {
      res.status(400).end(err.message);
    } else {
      if(data.password) {
        
      }
    }
  });

/*
  Account.register(newAccount, data.password, function(err, account) {
    if (err) 
      res.status(400).end('Add a new account error');
    else{
      res.status(201).json(account);
    }
  });
*/

});

module.exports = router;
