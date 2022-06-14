const express = require('express');
const path = require('path')
const flash = require("connect-flash")
const session = require("express-session")
const passport = require("passport")
const MySQLStore = require("express-mysql-session")(session);
// const options = { host: "192.168.64.3", user: "alldb", database: 'alldb', password:''}
const options = { host: "localhost", user: "root", database: 'alldb', password: '' }

// const options = { host: "localhost", user: "metecxjn_db", database: 'metecxjn_db', password: 'metecxjn_db' }
const sessionStore = new MySQLStore(options);
const fileupload = require("express-fileupload");
const app = express();
require("dotenv").config();
app.use(fileupload({ createParentPath: true }));
app.use(express.static(path.join(__dirname, "views/aeoncapital")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.use(flash());
app.use(session({ secret: "fgnodsfighosfighoghvu", store: sessionStore, resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
require("./app/routers/routers")(app);
require('./app/models/db.config');
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => { console.log(`The server is running on port ${PORT} successfuly`) });