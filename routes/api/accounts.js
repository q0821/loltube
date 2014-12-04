'use strict';

var express = require('express');
var router = express.Router();
var Account = require('../../models/account');

router.get('/', function(req, res){
  Account.find({active: true}).sort('-created').exec(function(err, results){
    if(err){
      res.status(400).end('Get accounts error');
    } else {
      res.status(200).json(results);
    }
  }); 
});

router.post('/', function(req, res){
  var data = req.body;
  var newAccount = new Account(data);
  newAccount.set( 'created', Date.now());
  newAccount.set( 'lastModifier', req.user.username);
  newAccount.set( 'lastModified', Date.now());

  Account.register(newAccount, data.password, function(err, account) {
    if (err) 
      res.status(400).end('Add a new account error');
    else{
      res.status(201).json(account);
    }
  });
})

module.exports = router;
