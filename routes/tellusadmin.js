var express = require('express');
var router = express.Router();
var Account = require('../models/account.js');
var passport = require('passport');

var auth = passport.authenticate('local', {});

var godmode = false;
if(process.argv[2] === 'godmode'){
  godmode = true;
}

router.get('/', function(req, res){
  res.render('admin/tellusadmin', {
    title: '管理區',
    godmode: godmode
  });
});

router.post('/', passport.authenticate('local', {failureRedirect: '/tellusadmin'}), function(req, res){
  Account.update(
    {username: req.user.username}, 
    {$set: 
      {lastLogin: Date.now()}
    },
    function(err, num, raw, results){
      if(err){
      } else {
        res.redirect('/tellusadmin/index');
      } 
    }
  );  
});

router.get('/index', isAuth, function(req, res){
  //console.log('user permission: ' + req.user.permission);
  res.render('admin/index', {
    title: '管理區 - 首頁',
    active: req.path.slice(1),
    username: req.user.username,
    permission: req.user.permission
  });
})

router.get('/tags', isAuth, function(req, res){
  res.render('admin/tags', {
    title: "管理區 - Tags",
    active: req.path.slice(1),
    username: req.user.username,
    permission: req.user.permission
  });    
});

router.get('/accounts', isAuth, function(req, res){
  res.render('admin/accounts', {
    title: '管理區 - Accounts', 
    active: req.path.slice(1),
    username: req.user.username,
    permission: req.user.permission
  });  
});

router.get('/godmode', isGodmode, function(req, res){
  res.render('admin/godmode');
});

router.post('/godmode', isGodmode, function(req, res){
  Account.register(new Account({ 
    username : req.body.username,
    permission : 1, 
    active : true
  }), req.body.password, function(err, account) {
    if (err) {
      return res.render('admin/godmode', { 
        account : account 
      });
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/tellusadmin/index');
    });
  });    
})


function isAuth(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/tellusadmin');
}

function isGodmode(req, res, next){
  if(godmode)
    return next();
  else
    res.redirect(401, '/tellusadmin');
}

module.exports = router;
