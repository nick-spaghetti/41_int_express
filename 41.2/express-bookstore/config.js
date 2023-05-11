/** Common config for bookstore. */

const header = `postgresql:///`
let name = "books";

const DB_URI = (process.env.NODE_ENV === 'test') ?
  `${header}${name}_test` :
  `${header}${name}`;

module.exports = {
  DB_URI
};