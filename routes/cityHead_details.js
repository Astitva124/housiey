const express = require("express");
const router = express.Router();
const {
  getCityHeads,
  suspend_cityHead,
  getCityHead_byCity,
  getAllCityHead,
  getAllCity,
  get_cityHead_by_id,
  update_CityHead_byid,
  getAllSuspended,
  get_salesPerson_by_id,
  update_salesPerson_byid,
  getAllSalesPerson,
  suspend_salesPerson,
  getAllSPSuspended
} = require("../controllers/cityHead_details");

router.post("/CHsuspend", suspend_cityHead);
router.get("/", getCityHeads);
router.get("/bycity",getCityHead_byCity)
router.get("/allcityheads", getAllCityHead);
router.get("/allcity", getAllCity);
router.get("/CHdata", get_cityHead_by_id);
router.post("/updateCH", update_CityHead_byid);
router.get("/allsuspended", getAllSuspended);
router.get("/SPdata", get_salesPerson_by_id)
router.post("/updateSP", update_salesPerson_byid)
router.get('/allsalesperson',getAllSalesPerson)
router.post('/SPsuspend',suspend_salesPerson)
router.get('/allSPsuspended',getAllSPSuspended)

module.exports = router;
