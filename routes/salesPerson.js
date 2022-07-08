const express = require("express");
const router = express.Router();
const {get_salesPerson, get_salesPerson_by_id, update_salesPerson ,add_salesPerson,properties,changeProperty_salesperson} = require('../controllers/salesPerson_controller')


router.get('/',get_salesPerson)
router.post('/update', update_salesPerson)
router.post('/addSalesPerson', add_salesPerson)
router.get('/get_salesPerson_by_id', get_salesPerson_by_id)
router.get('/properties',properties)
router.get('/changeProperties',changeProperty_salesperson)



router.get('/details', )
module.exports = router