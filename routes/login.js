const express = require("express");
const router = express.Router();

const {login_get,login_post} = require('../controllers/login_controller');

router.get('/',login_get)
router.get('/form/:roleid', login_get);
router.post('/submitform', login_post);

module.exports = router