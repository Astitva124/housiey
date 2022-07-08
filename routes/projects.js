const express = require("express");
const router = express.Router();
const {get_projects} = require('../controllers/projects_controller')

router.get('/',get_projects )

module.exports = router