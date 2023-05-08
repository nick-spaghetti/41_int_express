/** Express app for message.ly. */

const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const {
  authenticateJWT
} = require("./middleware/auth");

const expressError = require("./express-error")
const app = express();

app.use(morgan('dev'));
// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

/** routes */

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

/** 404 handler */

app.use((req, res, next) => {
  const e = new expressError('page not found', 404);
  return next(e);
});

app.use((e, req, res, next) => {
  let status = e.status || 500;
  let msg = e.msg || e;
  res.status(status).json({
    error: {
      msg,
      status
    }
  });
});


module.exports = app;