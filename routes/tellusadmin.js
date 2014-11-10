var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  if(process.argv[2] === 'godmode'){
    res.render('tellusadmin', {
      title: '管理區 - for god',
      godmode: true
    });
  } else {
    res.render('tellusadmin', {
      title: '管理區',
      godmode: false
    });        
  }
});

module.exports = router;
