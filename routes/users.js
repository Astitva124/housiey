var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  let dataEntries = [{
    "id": 23,
    "name":"ast",
    "email":"dse",
    "mobile": 2233,
    "city": "gwl",
  }]
  res.render('data-entry', {dataEntries})
});

module.exports = router;
