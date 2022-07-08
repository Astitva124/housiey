exports.dashboard = async (req, res, next) => {
  try {
    if (req.session.USERTYPE == "2") {
      req.query.cityid = req.session.CITYID;
    } else if (req.session.USERTYPE == "3") {
      req.query.SPid = req.session.USERID;
    }

    let SPquery = "";

    if (req.query.SPid != "null" && req.query.SPid != undefined) {
      SPquery = `where FIND_IN_SET(${req.query.SPid}, projects.seller_id)>0`;
    }

    let currentmonth = new Date().getMonth() + 1;

    let datequery = "";
    if (req.query.date == 1 || req.query.date == undefined || req.query.date == null) {
      datequery = ` Month(enquiries.datetime) = ${currentmonth}`;
    } else if (req.query.date == 3) {
      datequery = ` Month(enquiries.datetime) >= ${currentmonth - 3} and Month(enquiries.datetime) < ${currentmonth}`;
    } else {

      let dates = req.query.date.split(",");    // dates[0] = start date, dates[1] = end date.
      datequery = `Date(enquiries.datetime) >= "${dates[0]}" and Date(enquiries.datetime)<= "${dates[1]}"`;
    }

    // console.log("--------------------",req.query.date, datequery);
    let cityquery = "";
    if (req.query.cityid != undefined && req.query.cityid != "null") {
      cityquery = `enquiries.city_id = ${req.query.cityid} and `;
    }

    let query = `select count(*) as count from enquiries where ${cityquery} enquiries.project_id IN (select id from projects ${SPquery}) and ${datequery}`;

    let query2 = `select count(*) as count from enquiries where ${datequery}`;

    let totalLeads,
      totalSiteVisits,
      totalOnlinePresnt,
      totalbooked,
      totaltoken,
      totalFreshLead,
      totaldead;

    if (
      (req.query.filter == 0 || req.query.filter == undefined) &&
      req.session.USERTYPE == 1
    ) {
      totalLeads = await db.query(`${query2}`);
      totalSiteVisits = await db.query(`${query2} and process_status = 2`);
      totalOnlinePresnt = await db.query(`${query2} and process_status = 1`);
      totalbooked = await db.query(`${query2} and process_status = 4`);
      totaltoken = await db.query(`${query2} and process_status = 3`);
      totaldead = await db.query(`${query2} and process_status = 7`);
      totalFollowUp = await db.query(`${query2} and process_status = 0`);
      totalFreshLead = await db.query(`${query2} and process_status = 8`);
      totalRegistrationDone = await db.query(
        `${query2} and process_status = 5`
      );
      totalClaimDisbursed = await db.query(`${query2} and process_status = 6`);
    } else if (req.query.filter == 1 || req.session.USERTYPE != 1) {
      totalLeads = await db.query(`${query}`);
      totalSiteVisits = await db.query(`${query} and process_status = 2`);
      totalOnlinePresnt = await db.query(`${query} and process_status = 1`);
      totalbooked = await db.query(`${query} and process_status = 4`);
      totaltoken = await db.query(`${query} and process_status = 3`);
      totaldead = await db.query(`${query} and process_status = 7`);
      totalFollowUp = await db.query(`${query} and process_status = 0`);
      totalRegistrationDone = await db.query(`${query} and process_status = 5`);
      totalClaimDisbursed = await db.query(`${query} and process_status = 6`);
      totalFreshLead = await db.query(`${query} and process_status = 8`);
    }

    console.log(
      totalLeads,
      totalSiteVisits,
      totalOnlinePresnt,
      totalbooked,
      totaltoken,
      totaldead,
      req.query.filter,
      req.query.SPid,
      req.session.USERTYPE
    );

    res.render("dashboard", {
      totalLeads: totalLeads,
      totalFollowUp: totalFollowUp,
      totalRegistrationDone: totalRegistrationDone,
      totalClaimDisbursed: totalClaimDisbursed,
      totalSiteVisits: totalSiteVisits,
      totalOnlinePresnt: totalOnlinePresnt,
      totalbooked: totalbooked,
      totaltoken: totaltoken,
      totaldead: totaldead,
      totalFreshLead:totalFreshLead,
      selectedCity: req.query.cityid,
      selectedSP: req.query.SPid,
      selecteddate: req.query.date,
    });
  } catch (error) {
    next(error);
  }
};

exports.graphData = async (req, res, next) => {
  try {
    if (req.session.USERTYPE == 2) {
      req.query.cityid = req.session.CITYID;
    } else if (req.session.USERTYPE == 3) {
      req.query.SPid = req.session.USERID;
    }

    let SPquery = "";
    let cityquery = "";

    if (req.query.SPid != "null" && req.query.SPid !=undefined) {
      SPquery = `where FIND_IN_SET(${req.query.SPid}, projects.seller_id)>0`;
    }

    if (req.query.cityid != undefined && req.query.cityid != "null") {
      cityquery = `and enquiries.city_id = ${req.query.cityid}`;
    }
    // console.log("sppppp", req.query.SPid == "null");

    let data = await db.query(
      `select DATE_FORMAT(enquiries.datetime,'%d-%m-%y') as x, count(id) as y  from enquiries where MONTH(enquiries.datetime) = ${req.query.month} and YEAR(enquiries.datetime) = ${req.query.year} ${cityquery} and enquiries.project_id IN (select id from projects ${SPquery}) GROUP BY DATE(enquiries.datetime)`
    );

    console.log("graph", data, req.query.SPid);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
