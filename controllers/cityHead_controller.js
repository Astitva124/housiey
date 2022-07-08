const { nodemailer, HtmlTemplate } = require("../lib/functions");
const bcrypt = require("bcrypt");

exports.get_cityHeads = async (req, res, next) => {
  try {
    let cityHeads = await db.query(
      `SELECT city_head.id AS id ,city_head.name AS name, city_head.email, city_head.mobile, city.name AS city, city_head.status AS status FROM city_head INNER JOIN city ON city_head.city_id = city.city_id ORDER BY datetime DESC`
    );

    // { flash: req.flash('msg') }
    // let message = req.flash('message');

    let failed = req.flash("failed");
    let success = req.flash("success");
    // res.render('../views/admin/login',{"success":success,"failed":failed})
    // console.log(req.session.userType);
    res.render("city_head", {
      success: success,
      failed: failed,
      cityHeads: cityHeads,
      baseurl: baseurl
    });
  } catch (error) {
    next(error);
  }
};

exports.add_cityHead = async (req, res, next) => {
  try {
    let checkEmail = await db.query(
      `SELECT * FROM city_head WHERE email = "${req.body.add_email}"`
    );
    if (checkEmail.length) {
      req.flash("failed", "User already exist");
      res.redirect("/cityheads");
      // console.log("HII",checkEmail);
    } else {
      // let city_id = await db.query(
      //   `SELECT city_id From city WHERE name = "${req.body.add_city}"`
      // );

      let password = Math.random().toString(36).slice(2)
   
      let template = HtmlTemplate(req.body.add_email,password,"CityHead",baseurl);
      const salt = await bcrypt.genSalt(10);
       password = await bcrypt.hash(password, salt);
      
      nodemailer(req.body.add_email, "Login info", template);
      await db.query(
        `INSERT INTO city_head (name,email,mobile,city_id,password) VALUES ("${req.body.add_name}", "${req.body.add_email}", ${req.body.add_mobile}, ${req.body.cityid}, "${password}")`
      );

      req.flash("success", "User added and email sent to user");
      res.redirect("/cityheads");
    }
  } catch (error) {
    next(error);
  }
};

exports.get_cityHead_by_id = async (req, res, next) => {
  try {
    let cityHead = await db.query(
      `SELECT city_head.name AS name, city_head.email AS email, city_head.mobile AS mobile, city.name AS city, city_head.status AS status FROM city_head INNER JOIN city ON city_head.city_id = city.city_id WHERE city_head.id = ${req.query.id};`
    );

    res.json(cityHead);
  } catch (error) {
    next(error);
  }
};

exports.update_CityHead = async (req, res, next) => {
  try {
    // let city_id = await db.query(
    //   `SELECT city_id From city WHERE name = "${req.body.city}"`
    // );
    await db.query(
      `UPDATE city_head SET name = "${req.body.name}" , email= "${req.body.email}", mobile = ${req.body.mobile}, city_id = ${req.body.cityid} WHERE id = ${req.body.id}`
    );

    req.flash("success", "User details updated");
    res.redirect("/cityheads");
  } catch (error) {
    next(error);
  }
};

exports.change_status = async (req, res, next) => {
  try {
    // console.log("hello", req.query.id);
    await db.query(
      `UPDATE city_head SET status = ${req.query.newstatus} WHERE id = ${req.query.id} `
    );

    req.flash("success", "Status changed");
    res.redirect("/cityheads");
    // res.json({ status: 200, msg: "Changed" });
  } catch (error) {
    next(error);
  }
};

// exports.login_cityHead_get = async (req, res, next) => {
//   if (req.session.EMAIL !== undefined && req.session.PASSWORD !== undefined) {
//     // console.log(req.session.EMAIL,req.session.PASSWORD)
//     res.redirect("/cityHeads");
//   } else {
//     let failed = req.flash("failed");
//     let email = req.flash("email");
//     let password = req.flash("password");
//     res.render("cityHead_login", {
//       failed: failed,
//       email: email,
//       password: password,
//     });
//   }
// };

// exports.login_cityHead_post = async (req, res, next) => {
//   let table = "";
//   if (req.body.role == 1) {
//     table = "admin";
//   } else if (req.body.role == 2) {
//     table = "city_head";
//   }
//   let user = await db.query(
//     `SELECT * FROM ${table} WHERE email = "${req.body.email}"`
//   );
//   if (user[0]) {
//     // check user password with hashed password stored in the database

//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       user[0].password
//     );
//     if (user[0].status !== 1) {
//       req.flash("failed", "1");
//       req.flash("email", req.body.email);
//       req.flash("password", req.body.password);
//       res.redirect("/cityHeads/login");
//     } else if (validPassword) {
//       req.session.EMAIL = req.body.email;
//       req.session.PASSWORD = req.body.password;
//       req.session.USERTYPE = req.body.role; // 2: CITYHEAD, 1: ADMIN;

//        console.log(req.session)
//       res.redirect("/cityHeads");
//     } else {
//       req.flash("failed", "2");
//       req.flash("email", req.body.email);
//       res.redirect("/cityHeads/login");
//     }
//   } else {
//     req.flash("failed", "3");
//     res.redirect("/cityHeads/login");
//   }
// };
