const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const JSZip = require("jszip");
const fs = require("fs");
const { nodemailer, HtmlTemplate2 } = require("../lib/functions");

exports.getLeads = async (req, res, next) => {
  try {
    let filterCondition = "";
    let sourseCondtion = "";
    let cityCondition = "";
    let SPCondition = "";
    let localityCOnditions = "";

    if (req.query.localityid != "null" && req.query.localityid != undefined) {
      localityCOnditions = `AND projects.id IN (SELECT project_id FROM project_locations WHERE locality_id=${req.query.localityid})`;
    }

    if (req.query.source) {
      sourseCondtion = `AND enquiries.source = IFNULL("${req.query.source}",enquiries.source)`;
    }

    if (req.session.USERTYPE == 2) {
      cityCondition = `enquiries.city_id = ${req.session.CITYID}`;
    }

    if (req.session.USERTYPE == 3) {
      SPCondition = `FIND_IN_SET(${req.session.USERID},projects.seller_id)>0`;
    }

    if (
      (req.query.filter == 0 || req.query.filter == undefined) &&
      req.session.USERTYPE == 1
    ) {
      filterCondition = ``;
    } else if (
      (req.query.filter == 0 || req.query.filter == undefined) &&
      req.session.USERTYPE == 2
    ) {
      filterCondition = `WHERE ${cityCondition}`;
    } else if (
      (req.query.filter == 0 || req.query.filter == undefined) &&
      req.session.USERTYPE == 3
    ) {
      filterCondition = `WHERE ${SPCondition}`;
    }

    if (req.query.filter == 1 && req.session.USERTYPE == 1) {
      let SPquery = "";

      if (req.query.SPid != "null" && req.query.SPid != undefined) {
        SPquery = `FIND_IN_SET(${req.query.SPid}, projects.seller_id)>0 AND`;
      }
      filterCondition = `WHERE ${SPquery} enquiries.city_id = IFNULL(${req.query.cityid},enquiries.city_id)    ${localityCOnditions}  AND enquiries.process_status = IFNULL(${req.query.status},enquiries.process_status) ${sourseCondtion} `;
    } else if (req.query.filter == 1 && req.session.USERTYPE == 2) {
      let SPquery = "";

      if (req.query.SPid != "null" && req.query.SPid != undefined) {
        SPquery = `FIND_IN_SET(${req.query.SPid}, projects.seller_id)>0 AND `;
      }
      filterCondition = `WHERE ${SPquery} ${cityCondition} ${localityCOnditions} AND enquiries.process_status = IFNULL(${req.query.status},enquiries.process_status) ${sourseCondtion} `;
    } else if (req.query.filter == 1 && req.session.USERTYPE == 3) {
      filterCondition = `WHERE ${SPCondition} ${localityCOnditions} AND enquiries.process_status = IFNULL(${req.query.status},enquiries.process_status) ${sourseCondtion} `;
    }

    // let leads = await db.query(
    //   `SELECT projects.id AS projectId , projects.project_name,(SELECT CONCAT(
    //     '[', GROUP_CONCAT(JSON_OBJECT("name",sellers.name,"id",sellers.seller_id)),']'
    //     ) FROM sellers WHERE FIND_IN_SET(seller_id,projects.seller_id)>0) AS sellername,projects.seller_id, enquiries.id AS enqid,
    //     (select remarks from remarks where enquiries.id=remarks.enquiry_id order by changed_time DESC LIMIT 1) AS remarks,

    //     (select name from city where city_id = enquiries.city_id) As city,

    //     (select name from locality where locality.locality_id = (SELECT project_locations.locality_id FROM project_locations WHERE  project_locations.project_id=projects.id) ) as locality,enquiry_datetime as date,
    //     enquiries.process_status AS status, enquiries.source as source,(SELECT name FROM user_tbl WHERE user_tbl.id = enquiries.userid) AS username,enquiries.userid as userid from projects JOIN enquiries ON projects.id = enquiries.project_id ${filterCondition} order by enquiries.datetime DESC`
    // );

    // console.log("filterrr", filterCondition, "    ", req.query.localityid);

    let leads = await db.query(
      `SELECT projects.id AS projectId , projects.project_name,projects.seller_id, enquiries.id AS enqid,
      (select remarks from remarks where enquiries.id=remarks.enquiry_id order by changed_time DESC LIMIT 1) AS remarks,
      (select changed_time from remarks where enquiries.id=remarks.enquiry_id order by changed_time DESC LIMIT 1) AS remarkDate,
      (select name from city where city_id = enquiries.city_id) As city,
      
      (select name from locality where locality.locality_id = (SELECT project_locations.locality_id FROM project_locations WHERE  project_locations.project_id=projects.id) ) as locality,enquiry_datetime as date,
      enquiries.process_status AS status, enquiries.source as source,(SELECT name FROM user_tbl WHERE user_tbl.id = enquiries.userid) AS username,enquiries.userid as userid from projects JOIN enquiries ON projects.id = enquiries.project_id  ${filterCondition} order by enquiries.datetime DESC`
    );

    // console.log("Leads", leads);

    let failed = req.flash("failed");
    let success = req.flash("success");
    res.render("lead", {
      leads: leads,
      baseurl: baseurl,
      failed: failed,
      success: success,
      moment: moment,
      selectedCity: req.query.cityid,
      selectedLocality: req.query.localityid,
      selectedSP: req.query.SPid,
      selectedStatus: req.query.status,
      selectedSource: req.query.source,
      usersCity: req.session.CITYID,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    let user = await db.query(
      `select name,email,mobile from user_tbl where id = ${req.query.userid}`
    );
    // console.log("user infor", user);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getSellerInfo = async (req, res, next) => {
  try {
    let salesPerson;

    let cityCondition = "";
    if (req.query.cityid != undefined && req.query.cityid != "null")
      cityCondition = `WHERE city_id = ${req.query.cityid}`;

    if (req.session.CITYID != undefined) {
      cityCondition = `WHERE city_id = ${req.session.CITYID}`;
    }
    if (req.query.projectid == 0) {
      salesPerson = await db.query(
        `SELECT seller_id, name FROM sellers WHERE FIND_IN_SET(seller_id,(SELECT GROUP_CONCAT(seller_id) from projects WHERE id IN (SELECT project_id from project_locations ${cityCondition})))`
      );
    } else {
      salesPerson = await db.query(
        `select name,seller_id as id, phone as mobile, email from sellers WHERE  FIND_in_SET(sellers.seller_id, (SELECT seller_id from projects where projects.id = ${req.query.projectid}) )>0;`
      );
    }
    // console.log("seller info", salesPerson);
    res.json(salesPerson);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    //  console.log("statusupdate",req.body)

    let name;

    if (req.session.USERTYPE == 1) {
      name = await db.query(
        `select username as name from admin where id = ${req.session.USERID}`
      );
    } else if (req.session.USERTYPE == 2) {
      name = await db.query(
        `select name from city_head where id = ${req.session.USERID}`
      );
    } else if (req.session.USERTYPE == 3) {
      name = await db.query(
        `select name from sellers where seller_id = ${req.session.USERID}`
      );
    } else {
      name = "admin"; // comment it afterwords
    }

    name = name[0].name;

    let filename = "";

    const zip = new JSZip();
    const img = zip.folder("images");

    for (let i = 0; i < req.files.length; i++) {
      if (req.files[i].filename.match(/\.(pdf|doc|txt)$/)) {
        let filepath = path.resolve(
          __dirname,
          `../uploads/${req.files[i].filename}`
        );
        let Data = fs.readFileSync(filepath);
        zip.file(req.files[i].filename, Data);
        fs.unlink(filepath, function (err) {
          if (err) {
            throw err;
          } else {
            console.log(`Successfully deleted . ${filepath}`);
          }
        });
      } else {
        let imgpath = path.resolve(
          __dirname,
          `../uploads/${req.files[i].filename}`
        );
        let imgData = fs.readFileSync(imgpath);
        img.file(req.files[i].filename, imgData);
        fs.unlink(imgpath, function (err) {
          if (err) {
            throw err;
          } else {
            console.log(`Successfully deleted . ${imgpath}`);
          }
        });
      }
    }

    if (req.files.length > 0) {
      filename = uuidv4() + ".zip";
      console.log("filename", filename);

      zip
        .generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(
          fs.createWriteStream(
            path.resolve(__dirname, `../uploads/${filename}`)
          )
        )
        .on("finish", function () {
          console.log(`${filename} written.`);
        });
    }

    console.log(req.body,req.session.USERID,req.session.USERTYPE);

    await db.query(
      `insert into remarks (changed_status,remarks,enquiry_id,changedby_id,changedby_role,changedby_name,filename,changed_time) Values (${req.body.status},"${req.body.remarks}", ${req.body.enqid}, ${req.session.USERID}, ${req.session.USERTYPE}, "${name}", "${filename}", "${req.body.changeTime}")`
    );

    await db.query(
      `UPDATE enquiries set process_status = ${req.body.status}  where id = ${req.body.enqid}`
    );

    // to send mail to user
    let usermail = await db.query(`Select email from user_tbl where id = ${req.body.userid}`);
    usermail = usermail[0].email;

    let status;

    switch (req.body.status) {
      case '0':
        status = "Follow Up";
        break;
      case '1':
        status = "Online Presentation Done";
        break;
      case '2':
        status = "Site Visit Done";
        break;
      case '3':
        status = "Token Done";
        break;
      case '4':
        status = "Booking Done";
        break
      case '5':
        status = "Registration Done";
        break;
      case '6':
        status = "Claim Disbursed";
        break;
      case '7':
        status = "Dead";
        break;
      case '8':
        status = "Fresh Lead";
        break;
    }
    

    // console.log("---------------------",status, req.body.status);
    let template = HtmlTemplate2(req.body.projectname, status);

    nodemailer(usermail, "Status info", template);

    // to send sms to user.

    // let message = "";
    // requests('https://www.txtguru.in/imobile/api.php?username=housiey.com&password=59678510&source=HOUSIY&dmobile='+mobile+'&dlttempid=1707164577497805580&message='+message, false)
    // .on('data', function (chunk) {
    // console.log(chunk)
    // })
    // .on('end', function (err) {
    //     if (err) console.log('connection closed due to errors', err);
    //     console.log('end');
    // });

    req.flash("success", "Status updated and Mail sent to user");
    res.redirect(req.get("Referrer"));
  } catch (error) {
    next(error);
  }
};

exports.getRemarks = async (req, res, next) => {
  try {
    let remarks = await db.query(
      `select id,remarks,changed_status as status,changed_time as date,changedby_name as name from remarks where enquiry_id = ${req.query.id} order by changed_time DESC`
    );

    res.json(remarks);
  } catch (error) {
    next(error);
  }
};

exports.getDocs = async (req, res, next) => {
  try {
    let filename = await db.query(
      `select filename from remarks where id = ${req.query.id}`
    );

    filename = filename[0].filename;

    if (filename == null || filename == undefined || filename == "") {
      console.log("filename", filename);
      res.send({
        msg: "No document available for download",
      });
    } else {
      // console.log("filename",filename);
      let filepath = path.resolve(__dirname, `../uploads/${filename}`);
      console.log("path", filepath);

      res.download(
        filepath,
        "downloads.zip", // Remember to include file extension
        (err) => {
          if (err) {
            console.log(err);
            res.json({
              error: err,
              msg: "Problem downloading the file",
            });
          }
        }
      );
    }
  } catch (error) {
    next(error);
  }
};

// exports.getChangedBy = async (req, res, next) => {
//   let changed_by = await db.query(
//     `select changed_by as id, changedby_table as chtable from remarks where enquiry_id = ${req.query.enqid} order by changed_time DESC LIMIT 1 `
//   );

//   let details;
//   if (changed_by[0].table == "sellers") {
//     details = await db.query(
//       `select name from ${changed_by[0].chtable} where seller_id = ${changed_by[0].id}`
//     );
//   } else if (changed_by[0].table == "city_head") {
//     details = await db.query(
//       `select name from ${changed_by[0].chtable} where id = ${changed_by[0].id}`
//     );
//   } else {
//     details = await db.query(
//       `select username from ${changed_by[0].chtable} where id = ${changed_by[0].id}`
//     );
//   }

//   res.json(details);
// };

exports.getLocalities = async (req, res, next) => {
  try {
    let localities;
    if (req.query.cityid == 0 || req.query.cityid == "null") {
      localities = await db.query(
        `select locality_id as id, name from locality `
      );
    } else {
      localities = await db.query(
        `select 	locality_id as id,name from locality where city_id = ${req.query.cityid}`
      );
    }
    res.json(localities);
  } catch (error) {
    next(error);
  }
};

// exports.getSP = async (req, res, next) => {
//   try {
//     let salesPerson = await db.query(
//       `select seller_id as id, name from sellers`
//     );
//     res.json(salesPerson);
//   } catch (error) {
//     next(error);
//   }
// };
