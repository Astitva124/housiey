const express = require("express");
const router = express.Router();
const {get_dataEntry, get_dataEntry_by_id, update_dataEntry ,block_dataEntry,add_dataEntry} = require('../controllers/dataEntry_controller')

router.get('/',get_dataEntry)
router.post('/update', update_dataEntry)
router.post('/block', block_dataEntry)
router.post('/addDataEntry', add_dataEntry)
router.post('/get_dataEntry_by_id', get_dataEntry_by_id)

module.exports = router