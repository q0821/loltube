var express = require('express');
var router = express.Router();


router.get('/tags', function(req, res){
    res.render('angularadmin/tags', {
      title: "管理區 - Tags"
    });    
});

module.exports = router;