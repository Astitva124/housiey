var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mysql = require("./libs/mysql.js");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var projectRouter = require("./routes/projects");
var cityHeadRouter = require("./routes/cityHead");
var salesPersonRouter = require("./routes/salesPerson");
var dataEntryRouter = require("./routes/dataEntry");
var loginRouter = require("./routes/login");
var cityHeadDetailRouter = require("./routes/cityHead_details");
var leadsRouter = require("./routes/lead");
var dashboardRouter = require("./routes/dashboard");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.locals.USERTYPE = req.session.USERTYPE;
  // console.log(req.session,res.locals.USERTYPE)
  next();
});

app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/projects", projectRouter);
app.use("/cityHeads", cityHeadRouter);
app.use("/salesPersons", salesPersonRouter);
app.use("/dataEntry", dataEntryRouter);
app.use("/login", loginRouter);
app.use("/cityHeadDetails", cityHeadDetailRouter);
app.use("/leads",leadsRouter)
app.use('/dashboard',dashboardRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

global.db = mysql;
global.baseurl = "http://192.168.1.95:3000";

module.exports = app;
