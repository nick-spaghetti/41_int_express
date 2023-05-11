/** Express app for bookstore. */
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressError = require('./express-error');

app.use(express.json());
app.use(morgan('dev'));

app.use(express.json());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const bookRoutes = require("./routes/books");
app.use("/", bookRoutes);

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