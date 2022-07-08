var mysql = require('mysql');
var toUnnamed = require('named-placeholders')();
var db_config = require("../config/db_config.json");

var  conit = db_config.default;
var conn = connect();
module.exports.switchDatabase = function(dbname)
{
    conit = db_config[dbname]
   conn =  connect();
    return conit;
}

function connect()
{
  let init =   mysql.createPool({
        host: conit.host,
        user: conit.username,
        password: conit.password,
        port: conit.port,
        database: conit.database
    });
    
    init.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) throw error;
        console.log('The db is connected: ', results[0].solution);
    });

    return init;
}

module.exports.query = async function(query,parameters,debug=false){
    return new Promise(resolve => {
        let sql = query;    
        var q = toUnnamed(sql, parameters);
        console.log(q[0]);
        console.log(q[1]);
        conn.query(q[0],q[1],function(err,result){
            console.log(err);
            if(debug)
                console.log(err);
            resolve(result) 
        });
    })
}


module.exports.insert = async function(table,parameters,debug=false)
{
    return new Promise(resolve => {
        returer = null;
        query = "";
        for(let i in parameters)
        {
            query+= i+' = "'+parameters[i]+'" , ';
        }
        
        query = query.substring(0, query.length - 2);

        let sql = "insert into "+table+" set "+query;
        conn.query(sql,function(err,result){
            console.log(err);
            if(debug)
                console.log(err);
            resolve(result) 
        });
    })
}

