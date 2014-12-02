'use strict';

var express = require('express');
var router = express.Router();
var Account = require('../../models/account');

router.get('/', function(req, res){
  Account.find().exec(function(err, results){
    if(err){
      res.status(400).end('Get accounts error');
    } else {
      res.status(200).json(results);
    }
  }); 
});

module.exports = router;
