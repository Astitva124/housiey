const express = require("express");
const fileUpload = require("../config/multerDep");
const router = express.Router();

const {getLeads,getUserInfo,getSellerInfo,updateStatus,getRemarks,getLocalities,getDocs} = require("../controllers/leads_controller")

router.get('/',getLeads);
router.get('/getuser',getUserInfo );
router.get('/getSP',getSellerInfo);
router.post('/updateStatus',fileUpload.array('myfile',10),updateStatus );
router.get('/remarks',getRemarks);
router.get('/localities', getLocalities);
router.get('/docs', getDocs)



module.exports = router;