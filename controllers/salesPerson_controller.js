const { nodemailer, HtmlTemplate } = require("../lib/functions");
const bcrypt = require("bcrypt");

exports.get_salesPerson = async (req, res, next) => {
  try {
    let salesPersons = await db.query(
      `SELECT sellers.seller_id AS id ,sellers.name AS name, sellers.email, sellers.phone As mobile FROM sellers ORDER BY datetime DESC`
    );
    let failed = req.flash("failed");
    let success = req.flash("success");
    res.render("sales_person", {
      success: success,
      failed: failed,
      salesPersons: salesPersons,
      baseurl: baseurl
    });
  } catch (error) {
    next(error);
  }
};

exports.add_salesPerson = async (req, res, next) => {
  try {
    let checkEmail = await db.query(
      `SELECT * FROM sellers WHERE email = "${req.body.add_email}"`
    );
    if (checkEmail.length) {
      req.flash("failed", "User already exist");
      res.redirect("/salesPersons");
      // console.log("HII",checkEmail);
    } else {
      
      let password = Math.random().toString(36).slice(2)
      let template = HtmlTemplate(req.body.add_email, password, "salesPerson");
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      nodemailer(req.body.add_email, "Login info", template,baseurl);
      await db.query(
        `INSERT INTO sellers (name,email,phone,password) VALUES ("${req.body.add_name}", "${req.body.add_email}", ${req.body.add_mobile}, "${password}")`
      );
      req.flash("success", "Sales Person added and email sent to sales person.");
      res.redirect("/salesPersons");
    }
  } catch (error) {
    next(error);
  }
};

exports.get_salesPerson_by_id = async (req, res, next) => {
  try {
    let salesPerson = await db.query(
      `SELECT sellers.name AS name, sellers.email AS email, sellers.phone AS mobile FROM sellers WHERE seller_id = ${req.query.id};`
    );
    res.json(salesPerson);
  } catch (error) {
    next(error);
  }
};

exports.update_salesPerson = async (req, res, next) => {
  try {
    await db.query(
      `UPDATE sellers SET name = "${req.body.name}" , email= "${req.body.email}", phone = ${req.body.mobile} WHERE seller_id = ${req.body.id}`
    );
    req.flash("success", "Sales Person updated");
    res.redirect("/salesPersons");
  } catch (error) {
    next(error);
  }
};

exports.properties = async (req,res,next)=>{
  try {
    let properties = await db.query(`SELECT project_name, id, seller_id FROM projects`);

    console.log("hii",properties)

    res.render("properties2",{
       properties: properties,
       id: req.query.id,
       baseurl: baseurl,
       SPname: req.query.name
    });
  } catch (error) {
     next(error)
  }
}

exports.changeProperty_salesperson = async (req,res,next)=>{
   try {
     
        // console.log("req.properties", req.body.properties);

        // let properties = [];

        // if(Array.isArray(req.body.properties)){
        //   properties = properties.concat(req.body.properties);
        // }
        // else if(typeof(req.body.properties === 'string') || req.body.properties instanceof String){
        //    properties = [req.body.properties];
        // }
        // console.log(properties);
     
        // properties.forEach(async(property) => {
        //   let seller_IDs = await db.query(`SELECT seller_id FROM projects WHERE project_name = "${property}" `);
        //   seller_IDs = seller_IDs[0].seller_id;
        //   console.log(seller_IDs);
        //    seller_IDs += ","+req.body.id;

        //   await db.query(`UPDATE projects SET seller_id = "${seller_IDs}" WHERE project_name = "${property}" `)
        // });
        // req.flash('success', "projects added successfuly")
        // res.redirect("/salesPersons");

        let seller_IDs = await db.query(`SELECT seller_id FROM projects WHERE id = "${req.query.projectid}" `);
        seller_IDs = seller_IDs[0].seller_id;
        console.log(seller_IDs);
   
        if(req.query.flag==1){
           seller_IDs += ","+req.query.SPid;
        }
        else{
          if(seller_IDs.indexOf(req.query.SPid)==0){
            seller_IDs = seller_IDs.replace(req.query.SPid,"");

            if(seller_IDs.indexOf(",")==0)
            seller_IDs = seller_IDs.replace(",","");
          }
          else{
            seller_IDs = seller_IDs.replace(","+req.query.SPid,"");
          }
        }
        console.log(seller_IDs);
        await db.query(`UPDATE projects SET seller_id = "${seller_IDs}" WHERE id = "${req.query.projectid}" `);
        res.json({
          status: true,
          msg: "Success"
        });
   } catch (error) {
     next(error)
   }
}

// exports.block_salesPerson = async (req, res, next) => {
//   try {
//     await db.query(
//       `UPDATE sellers SET status = 0 WHERE seller_id  = ${req.body.id} `
//     );
//     res.json({ status: 200, msg: "Blocked" });
//   } catch (error) {
//     next(error);
//   }
// };
