const bcrypt = require("bcrypt");

exports.login_get = async (req, res, next) => {
  // console.log("inside")
  if (req.session.EMAIL !== undefined && req.session.PASSWORD !== undefined) {
    if (req.session.USERTYPE == 2) {
      // console.log(2);
      res.redirect("/dashboard");
    } else if (req.session.USERTYPE == 3) {
      // console.log(3);
      res.redirect("/dashboard");
    } else if (req.session.USERTYPE == 1) {
      // console.log(1);
      res.redirect("/dashboard");
    }
  } else {
    let failed = req.flash("failed");
    let email = req.flash("email");
    let password = req.flash("password");

    let selected = req.params.roleid; // selected role for login.
    if (selected == undefined) {
      selected = 1;
    }

    console.log("hii", selected);
    res.render("login", {
      failed: failed,
      email: email,
      password: password,
      selected: selected,
      baseurl: baseurl,
    });
  }
};

exports.login_post = async (req, res, next) => {
  let table = "";
  let page = "/dashboard";
  if (req.body.role == 1) {
    table = "admin";
  } else if (req.body.role == 2) {
    table = "city_head";
  } else if (req.body.role == 3) {
    table = "sellers";
  }
  let user = await db.query(
    `SELECT * FROM ${table} WHERE email = "${req.body.email}"`
  );

  if (user[0]) {
    // check user password with hashed password stored in the database

    // console.log(req.body.password, req.body.email, user);
    const validPassword = await bcrypt.compare(
      req.body.password,
      user[0].password
    );
    // console.log(user[0],req.body.password, validPassword)
    if (user[0].status !== 1 && req.body.role !== 1) {
      req.flash("failed", "1");
      req.flash("email", req.body.email);
      req.flash("password", req.body.password);

      let role = "admin";
      if (req.body.role == 2) role = "cityHead";
      else if (req.body.role == 3) role = "salesPerson";
      res.redirect(`/login/form/${role}`);
    } else if (validPassword == true) {
      if (req.body.role == 2 || req.body.role == 1) {
        req.session.USERID = user[0].id;
        req.session.CITYID = user[0].city_id;
      } else if (req.body.role == 3) {
        req.session.USERID = user[0].seller_id;
      }
      req.session.EMAIL = req.body.email;
      req.session.PASSWORD = req.body.password;
      req.session.USERTYPE = req.body.role; //  1: ADMIN ,2: CITYHEAD, 3: SALES PERSON;

      //  console.log("hii",req.session)
      res.redirect(page);
    } else {
      req.flash("failed", "2");
      req.flash("email", req.body.email);
      res.redirect(`/login/form/cityHead`);
    }
  } else {
    req.flash("failed", "3");
    res.redirect(`/login/form/salesPerson`);
  }
};
