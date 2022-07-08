const moment = require("moment");

exports.getCityHeads = async (req, res, next) => {
  try {
    let cityHeads = await db.query(
      `SELECT *,(SELECT COUNT(*) AS total FROM enquiries WHERE enquiries.city_id = city_head.city_id) AS AssignedLeads,
      (SELECT name FROM city WHERE city.city_id = city_head.city_id) AS city_name
       FROM city_head WHERE suspended<>0 ORDER BY AssignedLeads DESC;`
    );

    let salesPersons = await db.query(
      `SELECT sellers.seller_id AS id, sellers.name , sellers.email, sellers.datetime AS createdAt,(SELECT COUNT(*) as enq_count FROM enquiries WHERE project_id IN (SELECT id FROM projects WHERE FIND_IN_SET(sellers.seller_id,projects.seller_id)) ) as AssignedLeads FROM sellers WHERE sellers.suspended<>0 ORDER BY AssignedLeads DESC; `
    );

    if (salesPersons.length) {
      for (let index = 0; index < salesPersons.length; index++) {
        const singleSalesPerson = salesPersons[index];

        let sql = `SELECT city.name FROM city WHERE city_id=(SELECT city_id FROM projects WHERE FIND_IN_SET(${singleSalesPerson.id},projects.seller_id) LIMIT 1) LIMIT 1;`;
        let cityname = await db.query(sql);
        if (cityname[0] == undefined) {
          salesPersons[index]["city"] = "No City assigned";
        } else {
          salesPersons[index]["city"] = cityname[0].name;
        }
      }
    }

    //  console.log(cityHeads);
    // console.log("hii", salesPersons);
    let selectedCity = "";
    let failed = req.flash("failed");
    let success = req.flash("success");
    res.render("cityHead_details", {
      cityHeads: cityHeads,
      salesPersons: salesPersons,
      baseurl: baseurl,
      selectedCity: selectedCity,
      failed: failed,
      success: success,
      moment: moment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCityHead_byCity = async (req, res, next) => {
  try {
    if (req.query.cityid == "0") {
      res.redirect("/cityHeadDetails");
    } else {
      let cityHeads =
        await db.query(`SELECT *,(SELECT COUNT(*) AS total FROM enquiries WHERE enquiries.city_id = city_head.city_id) AS AssignedLeads,(SELECT name FROM city WHERE city.city_id = ${req.query.cityid}) AS city_name
      FROM city_head WHERE suspended<>0 AND city_head.city_id = ${req.query.cityid} ORDER BY AssignedLeads DESC;`);

      let salesPersons = await db.query(
        `SELECT sellers.seller_id as id ,sellers.name , sellers.email, sellers.datetime AS createdAt,(SELECT COUNT(*) as enq_count FROM enquiries WHERE project_id IN (SELECT id FROM projects WHERE FIND_IN_SET(sellers.seller_id,projects.seller_id)) AND city_id=${req.query.cityid}) as AssignedLeads FROM sellers WHERE sellers.suspended<>0 ORDER BY AssignedLeads DESC `
      );

      // if (salesPersons.length) {
      //   for (let index = 0; index < salesPersons.length; index++) {
      //     const singleSalesPerson = salesPersons[index];
      //     let sql = `SELECT city.city_id AS id,city.name AS name FROM city WHERE city_id=(SELECT city_id FROM projects WHERE FIND_IN_SET(${singleSalesPerson.id},projects.seller_id) LIMIT 1) LIMIT 1;`;
      //     let cityid = await db.query(sql);
      //     if (cityid[0] == undefined || cityid[0].id != req.query.cityid) {
      //       salesPersons.splice(index, 1);
      //       index--;
      //     } else {
      //       salesPersons[index]["city"] = cityid[0].name;
      //     }
      //   }
      // }

      let selectedCity = req.query.cityid;
      let failed = req.flash("failed");
      let success = req.flash("success");

      res.render("cityHead_details", {
        cityHeads: cityHeads,
        salesPersons: salesPersons,
        baseurl: baseurl,
        selectedCity: selectedCity,
        success: success,
        failed: failed,
        moment: moment,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllCityHead = async (req, res, next) => {
  try {
    let cityHeads = await db.query(
      `SELECT city_head.id AS id, city_head.name AS name,city_head.email AS email, city_id AS city FROM city_head`
    );
    //  console.log(cityHeads);
    res.json(cityHeads);
  } catch (error) {
    next(error);
  }
};

exports.suspend_cityHead = async (req, res, next) => {
  try {
    if (req.body.CHRid == "") {
      res.render("cityHead_details");
    } else {
      let replacing_user = await db.query(
        `SELECT * FROM city_head WHERE id = ${req.body.CHRid}`
      );

      let datetime = moment().format("YYYY-MM-DD HH:MM:S");
      // await db.query(
      //   `UPDATE city_head SET name = "${replacing_user[0].name}", email = "${replacing_user[0].email}", mobile = ${replacing_user[0].mobile}, password = "${replacing_user[0].password}", city_id = ${replacing_user[0].city_id}, status = ${replacing_user[0].status}, datetime = "${datetime}" WHERE email = "${req.body.email2}"`
      // );

      // console.log("zzz",req.body)

      await db.query(`
        UPDATE city_head SET replaced_by = "${replacing_user[0].name}",replaced_by_id = "${CHRid}",suspended = 0,suspended_datetime = "${datetime}" WHERE id = ${req.body.CHid}`);
      req.flash("success", "City Head suspended and updated");
      res.redirect(req.get("Referrer"));
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllCity = async (req, res, next) => {
  try {
    let cities = await db.query(`SELECT city_id AS id,name FROM city`);

    res.json(cities);
  } catch (error) {
    next(error);
  }
};

exports.update_CityHead_byid = async (req, res, next) => {
  try {
    await db.query(
      `UPDATE city_head SET name = "${req.body.name}" , email= "${req.body.email}", mobile = ${req.body.mobile}, city_id = ${req.body.city}, email = "${req.body.email}" WHERE id = ${req.body.id}`
    );

    req.flash("success", "City Head updated");
    res.redirect(req.get("Referrer"));
  } catch (error) {
    next(error);
  }
};

exports.get_cityHead_by_id = async (req, res, next) => {
  try {
    let cityHead = await db.query(
      `SELECT city_head.name AS name, city_head.email AS email, city_head.mobile AS mobile, city.city_id AS city, city_head.status AS status FROM city_head INNER JOIN city ON city_head.city_id = city.city_id WHERE city_head.id = ${req.query.id};`
    );

    // console.log(cityHead);
    res.json(cityHead);
  } catch (error) {
    next(error);
  }
};

exports.getAllSuspended = async (req, res, next) => {
  try {
    let suspendedList = await db.query(
      `SELECT name,email,replaced_by,suspended_datetime AS date FROM city_head WHERE city_head.suspended=0 ORDER BY suspended_datetime DESC`
    );
    res.json(suspendedList);
  } catch (error) {
    next(error);
  }
};

exports.update_salesPerson_byid = async (req, res, next) => {
  try {
    await db.query(
      `UPDATE sellers SET name = "${req.body.name}" , email= "${req.body.email}", phone = ${req.body.mobile}, email = "${req.body.email}" WHERE seller_id = ${req.body.SPid}`
    );
    req.flash("success", "Sales Person updated");
    res.redirect(req.get("Referrer"));
  } catch (error) {
    next(error);
  }
};

exports.get_salesPerson_by_id = async (req, res, next) => {
  try {
    let salesPerson = await db.query(
      `SELECT sellers.name, sellers.phone AS mobile, sellers.email, sellers.seller_id AS id FROM sellers WHERE seller_id = ${req.query.id};`
    );

    console.log(salesPerson)
    res.json(salesPerson);
  } catch (error) {
    next(error);
  }
};

exports.getAllSalesPerson = async (req, res, next) => {
  try {
    let salesPersons = await db.query(
      `SELECT seller_id as id, name ,email FROM sellers`
    );

    if (salesPersons.length) {
      for (let index = 0; index < salesPersons.length; index++) {
        const singleSalesPerson = salesPersons[index];
        // console.log("hii",singleSalesPerson);

        let sql = `SELECT city_id AS city FROM city WHERE city_id=(SELECT city_id FROM projects WHERE FIND_IN_SET(${singleSalesPerson.id},projects.seller_id) LIMIT 1) LIMIT 1;`;
        let cityname = await db.query(sql);
        if (cityname[0] == undefined) {
          salesPersons[index]["city"] = "No City assigned";
        } else {
          salesPersons[index]["city"] = cityname[0].city;
        }
      }
    }

    // console.log("all",salesPersons);
    res.json(salesPersons);
  } catch (error) {
    next(error);
  }
};

exports.suspend_salesPerson = async (req, res, next) => {
  try {
    if (req.body.SPRid == "") {
      res.render("cityHead_details");
    } else {
      let replacing_user = await db.query(
        `SELECT * FROM sellers WHERE seller_id = ${req.body.SPRid}`
      );
      // console.log("hii", replacing_user, req.body.SPRid);
      let datetime = moment().format("YYYY-MM-DD HH:MM");

      console.log("datea", datetime);

      await db.query(
        `UPDATE projects SET seller_id = REPLACE(projects.seller_id,${req.body.SPid},${req.body.SPRid}) WHERE FIND_IN_SET(${req.body.SPid},projects.seller_id)>0`
      );

      await db.query(
        `UPDATE sellers SET replaced_by = "${replacing_user[0].name}",replaced_by_id = "${replacing_user[0].seller_id}",suspended = 0,suspended_datetime = "${datetime}" WHERE seller_id = ${req.body.SPid}`
      );

      req.flash("success", "Sales Person suspended and updated");
      res.redirect(req.get("Referrer"));
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllSPSuspended = async (req, res, next) => {
  try {
    let suspended = await db.query(
      `SELECT name,email,replaced_by,suspended_datetime as date FROM sellers WHERE suspended = 0 ORDER BY suspended_datetime DESC`
    );

    // console.log("susp", suspended);
    res.json(suspended);
  } catch (error) {
    next(error);
  }
};
