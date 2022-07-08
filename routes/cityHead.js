const express = require("express");
const router = express.Router();
const {get_cityHeads, get_cityHead_by_id, update_CityHead ,change_status,add_cityHead,login_cityHead_post,login_cityHead_get} = require('../controllers/cityHead_controller')

router.get('/',get_cityHeads)
// router.get('/login',login_cityHead_get)
// router.post('/login',login_cityHead_post)
router.post('/update', update_CityHead)
router.get('/changeStatus', change_status)
router.post('/addCityHead', add_cityHead)
router.get('/get_cityHead_by_id', get_cityHead_by_id)


module.exports = router