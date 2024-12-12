/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
// Their stuff
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PgStore = require("connect-pg-simple")(session);
const flash = require("connect-flash");

// My stuff
const static = require("./routes/static.js");
const baseController = require("./controllers/baseController.js");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require("./routes/accountRoute.js");
const messageRoute = require("./routes/messageRoute.js");
const intentionalErrorRoute = require("./routes/intentionalErrorRoute.js");
const utilities = require("./utilities/index.js");
const pool = require("./database/index.js");

// Init
const app = express();
const env = require("dotenv").config();

/* ***********************
 * Middleware
 *************************/
app.use(
    session({
      store: new PgStore({
        pool, // Reuse the existing connection pool
        createTableIfMissing: true, // Automatically create the session table if missing
      }),
      secret: process.env.SESSION_SECRET || "supersecretkey", // Fallback for local testing
      resave: false, // Avoid resaving unchanged sessions
      saveUninitialized: false, // Don't save empty sessions
      name: "sessionId", // Custom session cookie name
      cookie: {
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        httpOnly: true, // Prevent access to cookies via JavaScript
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );
// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// JWT checker
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at view root

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);
// Account routes
app.use("/account", accountRoute);
// Message routes
app.use("/message", messageRoute);
// Intentional error route. Used for testing
app.use("/ierror", intentionalErrorRoute);
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Unfortunately, we don't have that page in stock." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  console.dir(err);
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
