const nodemailer = require("nodemailer");
var bcrypt = require("bcrypt");

module.exports.nodemailer = function (to, title, message) {
  try {
    var transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "developer@techcarrel.com",
        pass: "#Dev@12@!TechCarrel",
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    //    console.log(transporter);
    var mailOptions = {
      from: '"Housiey " <developer@techcarrel.com>',
      to: to,
      subject: title,
      html: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.cryptPassword = function (password, callback) {
  bcrypt.genSalt(14, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(password, salt, function (err, hash) {
      return callback(err, hash);
    });
  });
};

module.exports.comparePassword = function (plainPass, hashword, callback) {
  bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
    return err == null ? callback(null, isPasswordMatch) : callback(err);
  });
};

module.exports.HtmlTemplate = function (email, password, role,baseurl) {
  let template = `<h1>Welcome</h1><h3>You are invited to become ${role}</h3><h4>Email : ${email}</h4><h4>Password: ${password}</h4> <form method="get" action="${baseurl}/login/form/${role}">
     <button type="submit">Login</button></form>`;

  return template;
};


module.exports.HtmlTemplate2 = function (projectname, newStatus){
  let template = `<h1> Hello !!</h1> <p>Status for your enquiry of project: <b>${projectname}</b> is changed to : <b>${newStatus}</b></p>`;

  return template;
}