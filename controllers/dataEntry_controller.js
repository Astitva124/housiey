 exports.get_dataEntry = async (req, res, next) => {

    try {
        let dataEntries = await db.query(
            `SELECT admin.id AS id ,admin.username AS name, admin.email, admin.mobile, city.name AS city FROM admin INNER JOIN city ON admin.city_id = city.city_id WHERE admin.status=1;`
          );
          res.render("data-entry" , {dataEntries})
    } catch (error) {
        next(error);
    }
    };
    
    exports.add_dataEntry = async(req,res,next) => {
        try {
            let city_id = await db.query(`SELECT city_id From city WHERE name = "${req.body.city}"`)
            await db.query(`INSERT INTO admin (username,email,mobile,city_id) VALUES ("${req.body.name}", "${req.body.email}", ${req.body.mobile}, ${city_id[0].city_id})`)
            res.redirect('/dataEntry')
        } catch (error) {
            next(error);
        }
    }
    
    exports.get_dataEntry_by_id = async (req,res,next) =>{
        try {
            
            let cityHead = await db.query(
                `SELECT admin.username AS name, admin.email AS email, admin.mobile AS mobile, city.name AS city FROM admin INNER JOIN city ON admin.city_id = city.city_id WHERE admin.id = ${req.body.id};`
              );
              res.json(cityHead);
        } catch (error) {
            next(error);
        }
    }
    
    exports.update_dataEntry= async (req,res,next) =>{
        try {
            let city_id = await db.query(`SELECT city_id From city WHERE name = "${req.body.city}"`)     
            await db.query(`UPDATE admin SET username = "${req.body.name}" , email= "${req.body.email}", mobile = ${req.body.mobile}, city_id = ${city_id[0].city_id} WHERE id = ${req.body.id}`)
            res.json({"status": 200, "msg": "Updated"})
        } catch (error) {
            next(error)
        }
    }
    
    exports.block_dataEntry = async (req,res,next)=>{
        try {
            await db.query(`UPDATE admin SET status = 0 WHERE id = ${req.body.id} `)
            res.json({"status": 200, "msg": "Blocked"})
        } catch (error) {
            next(error);
        }
    }
    