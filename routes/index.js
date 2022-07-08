var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  projects = []
  res.render('admin',{projects});
});

module.exports = router;
