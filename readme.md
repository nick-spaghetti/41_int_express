# 41 intermediate express

    • practice writing better readme.md

## package.json setup

```json
  "scripts": {
    "debug": "nodemon --inspect server.js",
    "dev:setup": "npm i --save-dev jest morgan nodemon supertest",
    "setup": "npm i axios bcrypt body-parser express helmet jsonschema jsonwebtoken nunjucks pg validator",
    "start": "nodemon server.js",
    "test": "jest --verbose --detectOpenHandles"
  },
    "nodemonConfig": {
    "ext": "html, css, js, json, md, py, sql",
    "verbose": true
  },
```

## npm start

    • starts nodemon server
    • config is set to verbose, disable with 'false'

## running tests

    • tests are written using jest and supertest
    • in terminal, 'npm test' to run tests

## db setup

    • config.js

```js
const header = `postgresql:///`;
let name = "db_name";

const DB_URI =
	process.env.NODE_ENV === "test"
		? `${header}${name}_test`
		: `${header}${name}`;
```
