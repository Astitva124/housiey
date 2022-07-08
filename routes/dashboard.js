const express = require("express");
const router = express.Router();


const {dashboard,graphData} = require('../controllers/dashboard_controller')

router.get('/', dashboard);
router.get('/getGraph',graphData);

module.exports = router;