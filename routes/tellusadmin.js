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

router.post('/', passport.authenticate('local', {
  successRedirect: '/tellusadmin/index',
  failureRedirect: '/tellusadmin'  
}));

router.get('/index', isAuth, function(req, res){
  console.log('user promission: ' + req.user.promission);
  res.render('admin/index', {
    title: '管理區 - 首頁',
    username: req.user.username,
    promission: req.user.promission
  });
})

router.get('/tags', isAuth, function(req, res){
    res.render('admin/tags', {
      title: "管理區 - Tags"
    });    
});

router.get('/godmode', isGodmode, function(req, res){
  res.render('admin/godmode');
});

router.post('/godmode', isGodmode, function(req, res){
  Account.register(new Account({ 
    username : req.body.username,
    promission : 1, 
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
