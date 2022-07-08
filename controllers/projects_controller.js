 exports.get_projects = async (req, res, next) => {
  try {

    let projects = await db.query(
      `SELECT projects.id, projects.project_name,projects.create_datetime,(SELECT name from locality WHERE locality_id = (SELECT locality_id from project_locations where project_locations.project_id = projects.id)) AS location,(SELECT name from city WHERE city_id = (SELECT city_id from project_locations where project_locations.project_id = projects.id)) AS city FROM projects`
    );
    res.render("projects", { projects });
  } catch (error) {
    next(error);
  }
};